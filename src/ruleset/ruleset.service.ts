import { BadRequestException, Injectable, NotFoundException, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Engine, Rule } from 'json-rules-engine';
import * as path from 'path';
import { RuleMapper } from '../common/util/rule-mapper';
import { RuleDto } from '../common/dto/rule';
import { normalizeWhen } from '../common/util/misc-utils'
@Injectable()
export class RuleSetService implements OnModuleInit {

  private readonly logger = new Logger(RuleSetService.name);

  private ruleSets: Record<string, Rule[]> = {};
  
  constructor() {

    this.ruleSets['salary'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'gross', operator: 'greaterThan', value: 0 }],
          },
        event: {
          type: 'advice',
          params: { message: 'PAYE is mandatory for you' },
          },
        }),
      ];

    }

    
  async onModuleInit() {

    await this.loadFromFile('good-life'); 
    await this.loadFromFile('band-logic'); 
    await this.loadFromFile('utility-bill'); 
    await this.loadFromFile('motor-insurance'); 
    await this.loadFromFile('health-insurance'); 

    const result = await this.evaluate('good-life', {
      coffeeCups: 2,
      commitsToday: 5,
      productionIncidents: 0,
      releaseDay: 'Thursday',
      });
      
    this.logger.log('Default evaluation result:', JSON.stringify(result, null, 2));

  }

  /**
   * Load rules from a JSON file and register in RuleSetsService
   */
    async loadFromFile(fileName: string) {

        const setName = fileName;
        const fullFileName = `${fileName}.json`;
        const absPath = path.resolve('./logic', fullFileName);
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
    try{
      if (this.ruleSets[name]) {
        throw new BadRequestException(`Rule set "${name}" already exists`);
        }
      this.ruleSets[name] = [];
      return { success: true, ruleSet: name };
      } 
    catch (error) {
      this.logger.warn(`Unable to create ruleset: ${error.message}`);
      throw new InternalServerErrorException(`Failed to create rule set: ${error.message}`);
      }
    }

  emptifyRuleSet(name: string) {
    if (!this.ruleSets[name]) {
      throw new BadRequestException(`Ruleset "${name}" does not exist`);
      }
    this.ruleSets[name] = [];
    return { success: true, ruleSet: name };
    }

  listRuleSets():String[] {
    return Object.keys(this.ruleSets);
    }

  getRules(setName: string) {
    const rules = this.ruleSets[setName];
    if (!rules) 
        throw new NotFoundException(`Ruleset "${setName}" not found`);
    return rules
    }


  getFriendlyRules(setName: string): RuleDto[] {
    const rules = this.ruleSets[setName];
    if (!rules) 
        throw new NotFoundException(`Rule set "${setName}" not found`);

    return rules.map((rule) => ({
      when: normalizeWhen(rule.conditions),
      then: {
        do: rule.event.type,
        with: rule.event.params,
      },
      priority: rule.priority,
    })) as RuleDto[];
  }


  addRule(setName: string, ruleObj: any) {
    try{
      if (!this.ruleSets[setName]) {
        this.ruleSets[setName] = [];
        }
        
      const rule = new Rule(ruleObj);
      this.ruleSets[setName].push(rule);
      return { success: true, count: this.ruleSets[setName].length };
      } 
    catch (error) {
      this.logger.warn(`Failed to add a rule: ${error.message}`);
      throw new BadRequestException(`Failed to update ruleset`);
      }
    }

  addFriendlyRule(setName: string, ruleDto: RuleDto) {
    try {
      if (!this.ruleSets[setName]) {
        this.ruleSets[setName] = [];
        }
        
      const ruleObj = this.toEngineRuleObject(ruleDto);

      const rule = new Rule(ruleObj as any);
      this.ruleSets[setName].push(rule);
      return { success: true, count: this.ruleSets[setName].length };
      } 
    catch (error) {
      this.logger.warn(`Failed to add friendly rule: ${error.message}`);
      throw new BadRequestException(`Failed to update ruleset`);
      }
    }


  async evaluate(setName: string, facts: Record<string, any>) {

    try {

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
    catch (error) {
      this.logger.warn(`Failed to evaluate: ${error.message}`);
      throw new BadRequestException(`Failed to evaluate ruleset : ${error.message}`);
      }
  }


  private toEngineRuleObject(ruleDto: RuleDto) {
    return {
      conditions: ruleDto.when, // same shape
      event: {
        type: ruleDto.then.do,
        params: ruleDto.then.with,
      },
      priority: ruleDto.priority,
    };
  }
}
