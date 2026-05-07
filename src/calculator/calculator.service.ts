import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Engine } from 'json-rules-engine';
import { evaluate, create, all, type MathNode, parse } from "mathjs";

import { DateUtils } from '../common/util/date-utils';
import { CalcUtils } from '../common/util/calc-utils';
import { RuleSetService } from '../ruleset/ruleset.service';
import { registerCustomOperators } from '../common/util/custom-operators'
import { coalesce } from '../common/util/misc-utils';
import { SessionManager } from '../session/manager';

@Injectable()
export class CalculatorService {

    private readonly logger = new Logger(CalculatorService.name);

    constructor(
      private readonly ruleSetService: RuleSetService,
      private readonly sessionManager: SessionManager,
    ) {}

    /**
     *  Compute (while evaluating) facts against a ruleset
     * - Supports fixed amounts, percentage rates and expressions
     * - Uses runtime facts...
     */
    async compute(setName: string, facts: Record<string, any>) {

      let engine: Engine | null = null;

      const math = create(all);

      try {
        
        const baseFacts: Record<string, any> = { ...facts };

        const rules = this.ruleSetService.getRules(setName);
        engine = new Engine(rules, { allowUndefinedFacts: false });

        const isSession = baseFacts.sessionID != null && baseFacts.sessionID !== '';
        let session = null;
      
        if (isSession) {
            session = this.sessionManager.get(baseFacts.sessionID);
            if (!session) session = this.sessionManager.create(baseFacts.sessionID);
            this.logger.log(`Using session : ${JSON.stringify(session)}`);

            //add session related facts to engine 
            Object.entries(session.state).forEach(([key, value]) => {
                  engine.addFact(`session.state.${key}`, value);
              });
            }

        registerCustomOperators(engine);
        const context: Record<string, any> = { ...facts, session };

        const utils = {
            age: DateUtils.age,
            daysBetween: DateUtils.daysBetween,
            addDays: DateUtils.addDays,
            coalesce,
            currentYear: DateUtils.currentYear,
            currentMonth: DateUtils.currentMonth,
            currentDay: DateUtils.currentDay,
            currentDate: DateUtils.currentDate,
            currentDateTime: DateUtils.currentDateTime
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
                const base = await almanac.factValue(event.params.base) as string;
                value = event.params.table[base.toUpperCase()] ?? event.params.default;
                console.log(`[DEBUG] Value lookup mode: value=${value}, base=${base}`);
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
                console.log(`[DEBUG] Value Range lookup mode: value=${value}, key=${key}, base = ${base}`);
                }
            //TODO: use `base` for context. This will enforce uniformity of syntax and semantics    
            else if(event.params.mode === 'expression') {

                console.log(`[DEBUG] Expression mode: expression=${event.params?.value}`);

                const symbols = CalcUtils.extractVariablesFromExpression(event.params?.value)

                for (const sym of symbols) {
                  console.log(`sym = ${sym}`)

                  // 🚫 Skip mathjs built-ins (sin, tan, min, etc.)
                  if (sym in math) continue;

                  // 🚫 Skip custom functions
                  if (sym in utils) continue;
https://files.slack.com/files-pri/TMY3YEPP0-F0B1D1Z9YCV/image.png
                  if (!(sym in context)) {  //if not set
                    context[sym] = 0;        
                    }
                  }
                  
                console.log(`context: value=${context}`);
                value = evaluate(event.params.value, { ...context, ...utils});
                  // @ts-ignore - data property always exists for DenseMatrix
                  // Handle mathjs DenseMatrix responses
                  if (value && value['mathjs'] === 'DenseMatrix') {
                    value = (value as any).data;
                  }
                console.log(`[DEBUG] Experssion mode: value=${value}`);
                }
        
            await almanac.addRuntimeFact(event.params.item, value);
            console.log(`[DEBUG] Added runtime fact: ${event.params.item}=${value}`);

            context[event.params.item] = value;
            console.log(`[DEBUG] Updated context: ${event.params.item}=${value}`);

            if (isSession && session) {
                session.state["step"] = event.params.item.toUpperCase();
                session.state[event.params.item] = value;
                this.sessionManager.update(facts.sessionID, session.state);
                console.log(`[DEBUG] Updated session to ${JSON.stringify(session)}  `);
                }

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
            derivedFacts.timestamp = utils.currentDateTime
            } 
          catch {
            console.log(`Skipping = ${fact}`);
            }
          }

        return {
          ruleSet: setName,
          stopped: stopped,
          baseFacts: baseFacts,
          ...(session ? { session } : {}),
          derivedFacts: derivedFacts,
          breakdown: result.events.map((e) => ({
            do: e.type,
            message: e.params.message,
            result: derivedFacts[e.params.item]
            })),
          };

        } 
      catch (err: any) {

        try {
          engine.stop();
          } 
        catch (stopErr) {
          this.logger.warn(`Error stopping engine: ${stopErr.message}`);
          }

        const msg = err?.message || 'Unexpected error during computation';
        this.logger.error(`Compute failed for set "${setName}": ${msg}`);

        if (msg.includes('Undefined fact')) {
          throw new BadRequestException({
            code: 'MISSING_FACT',
            message: msg,
            });
          }

        throw new InternalServerErrorException({
          code: 'ENGINE_ERROR',
          message: msg,
          });
        }
    }
      
}

