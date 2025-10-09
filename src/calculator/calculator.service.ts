import { Injectable } from '@nestjs/common';
import { Engine } from 'json-rules-engine';
import { evaluate } from 'mathjs';
import { DateUtils } from '../common/util/date-utils';
import { CalcUtils } from '../common/util/calc-utils';
import { RuleSetService } from '../ruleset/ruleset.service';


@Injectable()
export class CalculatorService {


    constructor(private readonly ruleSetService: RuleSetService) {}

    /**
     *  Compute (while evaluating) facts against a ruleset
     * - Supports fixed amounts, percentage rates and expressions
     * - Uses runtime facts...
     */
      async compute(setName: string, facts: Record<string, any>) {

        const rules = this.ruleSetService.getRules(setName);
        const engine = new Engine(rules, { allowUndefinedFacts: false });
        const baseFacts: Record<string, any> = { ...facts };

        const utils = {
            age: DateUtils.age,
            daysBetween: DateUtils.daysBetween,
            addDays: DateUtils.addDays,
            currentYear: DateUtils.currentYear,
            curentMonth: DateUtils.currentMonth,
            curentDay: DateUtils.currentDay
            };

        let stopped = false;

        engine.on('success', async (event, almanac, ruleResult) => {
            if(event.params?.break){
                stopped = true;
                engine.stop();
                }

            if (event.type !== 'apply-adjustment') return;

            console.log('[DEBUG] Event triggered:', event);
            
            let value = 0;

            if (event.params.mode === 'rate') {
                const base = await almanac.factValue(event.params.base) as number;
                value = base * event.params.value;
                console.log(`[DEBUG] Rate mode: base=${base}, rate=${event.params.rate}, value=${value}`);
                } 
            else if (event.params.mode === 'fixed') {
                value = event.params.value ?? 0;
                console.log(`[DEBUG] Fixed mode: value=${value}`);
                }
            else if (event.params.mode === 'value-lookup') {
                const base = await almanac.factValue(event.params.base) as number;
                value = event.params.table[base] ?? event.params.default;
                console.log(`[DEBUG] Range lookup mode: value=${value}`);
                }
            else if (event.params.mode === 'range-lookup') {
                const base = await almanac.factValue(event.params.base) as number;
                value = await CalcUtils.handleRangeLookup(base, event.params.table, event.params.default);
                console.log(`[DEBUG] Range lookup mode: value=${value}`);
                }
            else if (event.params.mode === 'value-range-lookup') {
                const base = await almanac.factValue(event.params.base) as number;
                const key = await almanac.factValue(event.params.key) as string;
                value = await CalcUtils.handleValueRangeLookup(key, base, event.params.table, event.params.default);
                console.log(`[DEBUG] Value Range lookup mode: value=${value}`);
                }
            //TODO: use `base` for context. This will enforce uniformity of syntax and semantics    
            else if(event.params.mode === 'expression') {
                console.log(`[DEBUG] Expression mode: expression=${event.params?.value}`);
                const context: Record<string, any> = {};

                for (const key of event.params.context ?? []) {
                  try {
                    context[key] = await almanac.factValue(key);
                    } 
                  catch {
                    context[key] = 0; 
                    }
                  }
                console.log(`context: value=${context}`);
                value = evaluate(event.params.value, {...context, ...utils});
                console.log(`[DEBUG] Experssion mode: value=${value}`);

                }
        
            await almanac.addRuntimeFact(event.params.item, value);
            console.log(`[DEBUG] Added runtime fact: ${event.params.item}=${value}`);

          });

        const result = await engine.run(facts);
      
        const allFacts: Record<string, any> = {};
        let derivedFacts: Record<string, any> = {};

        for (const fact of [
          ...Object.keys(facts),
          ...result.events.map((e) => e.params.item)
        ]) {
          try {
            allFacts[fact] = await result.almanac.factValue(fact);
            derivedFacts = Object.fromEntries(
                Object.entries(allFacts).filter(([k]) => !(k in baseFacts))
              );
            } 
          catch {
            console.log(`Skipping = ${fact}`);
            }
          }

        return {
          ruleSet: setName,
          stopped: stopped,
          baseFacts: baseFacts,
          derivedFacts: derivedFacts,
          then: result.events.map((e) => ({
            do: e.type,
            message: e.params.message,
            result: derivedFacts[e.params.item]
            })),
          };
      }
      
}
