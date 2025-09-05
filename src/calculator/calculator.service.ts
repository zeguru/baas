import { Injectable } from '@nestjs/common';
import { Engine } from 'json-rules-engine';
import { RuleSetService } from '../ruleset/ruleset.service';

import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class CalculatorService {

    constructor(private readonly ruleSetService: RuleSetService) {}

    /**
   * Load rules from a JSON file and register in RuleSetsService
   */
    async loadFromFile(fileName: string) {

        const setName = fileName;
        const fullFileName = `${fileName}.json`;
        const absPath = path.resolve('src/logic', fullFileName);
        const content = await fs.readFile(absPath, 'utf-8');
    
        const rules: any[] = JSON.parse(content);

        for (const rule of rules) {
            if (!rule.conditions || !rule.event) {
              throw new Error(`Invalid rule format in ${fullFileName}`);
              }

            await this.ruleSetService.addRule(setName, rule);
            }

        return { setName, count: rules.length };
        }

    /**
     * Evaluate facts against a ruleset
     * - Supports fixed amounts or percentage rates
     * - After the fact, might miss derived facts
     */
    // async naiveCalculate(setName: string, facts: Record<string, any>) {
    //     const rules = this.ruleSetService.getRules(setName);
    //     const engine = new Engine(rules, { allowUndefinedFacts: true });
      
    //     // clone facts to avoid mutating original - use spread syntax
    //     // you can adjust just like koltin copy().... const adjusted = { ...facts, grossSalary: 6000 };
    //     const computedFacts: Record<string, any> = { ...facts };
      
    //     const result = await engine.run(computedFacts);
      
    //     // apply adjustments
    //     for (const event of result.events) {
    //       if (event.type === 'apply-adjustment') {
    //         const { item, mode, base, rate, amount, action } = event.params;
      
    //         let value = 0;
      
    //         if (mode === 'fixed') {
    //           value = amount ?? 0;
    //         } else if (mode === 'rate') {
    //           const baseValue = computedFacts[base] ?? 0;
    //           value = baseValue * (rate ?? 0);
    //         }
      
    //         // save the adjustment fact itself
    //         computedFacts[item] = value;
      
            
    //         // apply to net
    //         if (!('net' in computedFacts)) {
    //           computedFacts.net = computedFacts.grossSalary ?? 0;
    //         }
      
    //         if (action === 'subtract') {
    //           computedFacts.net -= value;
    //         } else if (action === 'add') {
    //           computedFacts.net += value;
    //         }
    //       }
    //     }
      
    //     return {
    //       ruleSet: setName,
    //       facts: computedFacts,
    //       events: result.events.map((e) => ({
    //         type: e.type,
    //         params: e.params,
    //       })),
    //     };
    //   }
      



    /**
     * Evaluate facts against a ruleset
     * - Supports fixed amounts or percentage rates
     * - Uses runtime facts...
     */
      async compute(setName: string, facts: Record<string, any>) {
        const rules = this.ruleSetService.getRules(setName);
        const engine = new Engine(rules, { allowUndefinedFacts: true });
      
        // clone facts to avoid mutating original - use spread syntax
        const baseFacts: Record<string, any> = { ...facts };

        let total = 0;
        engine.addFact('total', async () => total);

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
                value = base * (event.params.rate ?? 0);
                console.log(`[DEBUG] Rate mode: base=${base}, rate=${event.params.rate}, value=${value}`);
                } 
            else if (event.params.mode === 'fixed') {
                value = event.params.amount ?? 0;
                console.log(`[DEBUG] Fixed mode: value=${value}`);
                }
        
            await almanac.addRuntimeFact(event.params.item, value);
            console.log(`[DEBUG] Added runtime fact: ${event.params.item}=${value}`);

            const gross = await almanac.factValue('grossValue') as number;
            console.log(`[DEBUG] Gross value = ${gross}`);

            //let total = (await almanac.factValue('total').catch(() => gross) as number) ?? gross;
            console.log(`[DEBUG] Total = ${total}`);

            if (event.params.action === 'subtract') {
              total -= value;
              } 
            else if (event.params.action === 'add') {
              total += value;
              }

        
            let net = gross - total;
            console.log(`[DEBUG] Updated net = ${net}`);

            await almanac.addRuntimeFact('net', net);
            console.log(`[DEBUG] Runtime fact 'net' updated = ${net}`);
          
          });

        const result = await engine.run(facts);
      
        // 🔑 collect all computed facts
        const allFacts: Record<string, any> = {};
        let derivedFacts: Record<string, any> = {};

        for (const fact of [
          ...Object.keys(facts),
          ...result.events.map((e) => e.params.item),
          'net', 
          'total'
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
          events: result.events.map((e) => ({
            type: e.type,
            params: e.params.message,
            })),
          };
      }


      async computeTiered(setName: string, facts: Record<string, any>) {
        const rules = this.ruleSetService.getRules(setName);
        const engine = new Engine(rules, { allowUndefinedFacts: false });
      
        const baseFacts = { ...facts};
        let total = 0;
        engine.addFact('total', async () => total);

        // listen for adjustments
        engine.on('success', async (event, almanac) => {

          console.log('[TIERED] Event triggered:', event);

          if (event.type === 'apply-adjustment') {
            let value = 0;
      
            if (event.params.mode === 'rate') {
                const baseVal = Number(await almanac.factValue(event.params.base).catch(() => 0)) || 0;
              
                // Inclusive slab boundaries
                const start = Number(event.params.sliceFrom ?? 1);            // e.g. 1, 101, 201
                const endCap = event.params.cap != null ? Number(event.params.cap) : baseVal; // e.g. 100, 200, ∞
                const end = Math.min(baseVal, endCap);
              
                const applicableUnits = Math.max(0, end - (start - 1));       // inclusive math
                const rate = Number(event.params.rate ?? 0) || 0;
              
                value = applicableUnits * rate;
                console.log(`Rate mode: base=${baseVal}, rate=${event.params.rate}, value=${value}`);
                }
            else if (event.params.mode === 'fixed') {
                value = event.params.amount ?? 0;
                console.log(`Fixed mode: value=${value}`);
                }
      
            await almanac.addRuntimeFact(event.params.item, value);
            console.log(`Updating almanac runtime fact: ${event.params.item}=${value}`);

            //let total = Number(await almanac.factValue('total').catch(() => 0)) || 0;
            console.log(`Total before = ${total}`);

            total += (event.params.action === 'subtract' ? -value : value);

            console.log(`Total after = ${total}`);
            //await almanac.addRuntimeFact('total', total);

          }
        });
      
        // BEFORE engine.run
        const result = await engine.run(baseFacts);
      
        // collect facts of interest
        const computedFacts: Record<string, any> = {};
        for (const fact of [
          ...Object.keys(facts),
          ...result.events.map((e) => e.params.item),
          'total'
        ]) {
          try {
            computedFacts[fact] = await result.almanac.factValue(fact);
            } 
          catch {
            /* skip */
            console.log(`Skipping = ${fact}`);
            }
          }
      
        return {
          ruleSet: setName,
          facts: computedFacts,
          breakdown: result.events.map((e) => ({
            item: e.params.item,
            //params: e.params,
            amount: computedFacts[e.params.item],
            params: e.params.message

          })),
          total: total
        };
      }
      

}
