import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Engine, Rule } from 'json-rules-engine';
import * as path from 'path';
import { RuleMapper } from '../common/util/rule-mapper';

@Injectable()
export class RuleSetService implements OnModuleInit{

  private ruleSets: Record<string, Rule[]> = {};

  constructor() {

    this.ruleSets['salary'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'gross', operator: 'greaterThan', value: 0 }],
          },
        event: {
          type: 'net-salary',
          params: { message: 'Salary calculation rule triggered' },
          },
        }),
      ];

    this.ruleSets['eligibility'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'age', operator: 'greaterThan', value: 18 }],
          },
        event: {
          type: 'adult',
          params: { message: 'User is an adult' },
          },
        }),
      ];
    }

  async onModuleInit() {
    await this.loadFromFile('bima-bamba'); 
    await this.loadFromFile('good-life'); 

    const result = await this.evaluate('good-life', {
      coffeeCups: 2,
      commitsToday: 5,
      productionIncidents: 0,
      releaseDay: 'Thursday',
      });
      
    console.log('Default evaluation result:', JSON.stringify(result, null, 2));

  }

  /**
   * Load rules from a JSON file and register in RuleSetsService
   */
    async loadFromFile(fileName: string) {

        const setName = fileName;
        const fullFileName = `${fileName}.json`;
        const absPath = path.resolve('src/logic', fullFileName);
        const content = await fs.readFile(absPath, 'utf-8');
    
        const friendlyRules = JSON.parse(content);
        const engineRules: any [] = RuleMapper.mapArrayToEngine(friendlyRules);

        for (const rule of engineRules) {
            if (!rule.conditions || !rule.event) {
              throw new Error(`Invalid rule format in ${fullFileName}`);
              }

            await this.addRule(setName, rule);
            }

        return { setName, count: engineRules.length };
        }

  createRuleSet(name: string) {
    if (this.ruleSets[name]) {
      throw new BadRequestException(`Rule set "${name}" already exists`);
    }
    this.ruleSets[name] = [];
    return { success: true, ruleSet: name };
    }

  listRuleSets() {
    return Object.keys(this.ruleSets);
    }

  getRules(setName: string) {
    const rules = this.ruleSets[setName];
    if (!rules) 
        throw new NotFoundException(`Rule set "${setName}" not found`);
    return rules
    }



  getFriendlyRules(setName: string) {
    const rules = this.ruleSets[setName];
    if (!rules) 
        throw new NotFoundException(`Rule set "${setName}" not found`);
    //return rules
    return rules.map((rule) => ({
      when: rule.conditions,
      then: {
        do: rule.event.type,
        with: rule.event.params,
      },
      priority: rule.priority,
    }))
  }

  addRule(setName: string, ruleObj: any) {
    if (!this.ruleSets[setName]) {
      this.ruleSets[setName] = [];
      }
    const rule = new Rule(ruleObj);
    this.ruleSets[setName].push(rule);
    return { success: true, count: this.ruleSets[setName].length };
    }

  async evaluate(setName: string, facts: Record<string, any>) {
    const rules = this.ruleSets[setName];
    if (!rules) throw new NotFoundException(`Rule set "${setName}" not found`);

    const engine = new Engine(rules, { allowUndefinedFacts: false });

    let stopped = false;

    engine.on('success', (event, almanac, ruleResult) => {
        if(event.params?.break){
          stopped = true;
          engine.stop();
          }
      });
      
    const result = await engine.run(facts);

    return {
      ruleSet: setName,
      stopped: stopped,
      then: result.events.map((e) => ({
        do: e.type,
        with: e.params,
      })),
    };
  }
}
