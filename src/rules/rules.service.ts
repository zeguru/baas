import { Injectable } from '@nestjs/common';
import { Engine, Rule } from 'json-rules-engine';

@Injectable()
export class RulesService {

    private rules: Rule[] = []; // store dynamically added rules

    constructor() {
        const highTempRule = new Rule({
          conditions: {
            any: [
              {
                fact: 'temperature',
                operator: 'greaterThanInclusive',
                value: 100,
              },
            ],
          },
          event: {
            type: 'high-temperature',
            params: { message: 'Temperature is too high!' },
          },
        });
    
        this.rules.push(highTempRule);
      }

    async runExample(facts: Record<string, any>) {
        const engine = new Engine(this.rules);
        const result = await engine.run(facts);
        return {
            events: result.events.map(e => ({
              type: e.type,
              params: e.params,
            })),
          };
    }


    async evaluateFacts(facts: Record<string, any>) {
        //const engine = new Engine(this.rules);
        const engine = new Engine(this.rules, { allowUndefinedFacts: true }); // 👈 here

        const result = await engine.run(facts);
      
        // Keep response clean: only return triggered events
        return {
          events: result.events.map(e => ({
            type: e.type,
            params: e.params,
          })),
        };
      }

    async runDynamic(facts: Record<string, any>, rulesObj: any[]) {
        const rules = rulesObj.map((r) => new Rule(r));
        const engine = new Engine(rules);
        const result = await engine.run(facts);
        return {
          events: result.events.map(e => ({
            type: e.type,
            params: e.params,
          })),
        };
      }

    async addRule(rule: Rule) {
        this.rules.push(rule);
        return { success: true, count: this.rules.length };
      }
}
