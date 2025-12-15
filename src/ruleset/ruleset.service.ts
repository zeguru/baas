import { BadRequestException, Injectable, NotFoundException, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Engine, Rule } from 'json-rules-engine';
import * as path from 'path';
import { RuleMapper } from '../common/util/rule-mapper';
import { RuleDto } from '../common/dto/rule';
import { transformWhenStringToJson } from '../common/util/misc-utils'
import { registerCustomOperators } from '../common/util/custom-operators'
import { DateUtils } from '../common/util/date-utils';
import { capitalizeTableKeys } from '../common/util/misc-utils';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessLogic } from './logic';


@Injectable()
export class RuleSetService implements OnModuleInit {

  private readonly logger = new Logger(RuleSetService.name);

  private ruleSets: Record<string, Rule[]> = {};
  
  private sampleFiles = ['sample-netpay-calc', 'sample-utility-bill',  'sample-table-lookup', 'sample-good-life',  'sample-motor-insurance','sample-health-insurance','sample-loan-eligibility', 'sample-survey'];

  constructor(
    @InjectRepository(BusinessLogic)
    private readonly logicRepository: Repository<BusinessLogic>,
    ) {

    //simplest Engine rule
    this.ruleSets['welcome'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'always', operator: 'always', value: true }],
          },
        event: {
          type: 'advice',
          params: { message: 'Welcome to business logic as a service' },
          },
        }),
      ];

    }

  async onModuleInit() {

    await this.loadAllRules();
    }

  async loadAllRules() {
    // 1️⃣ Load all enabled rules from DB
    const enabledDbRulesets = await this.logicRepository.find({ where: { is_enabled: true } });

    for (const ruleset of enabledDbRulesets) {
      this.logger.log(`Loading ruleset from DB: ${ruleset.name_of_ruleset} with ${ruleset.rules.length} rules`);
      const engineRules = RuleMapper.mapArrayToEngine(ruleset.rules);
      for (const rule of engineRules) {
        await this.addEngineRule(ruleset.name_of_ruleset, rule);
        }
      }

    // 2️⃣ Load all sample rules from files
    for (const file of this.sampleFiles) {
      this.logger.log(`Loading sample ruleset from file: ${file}.json`);
      if(!this.ruleSets[file]){   //do not load updated samples 
        await this.loadSample(file);
        }
    }
  }

  /**
   * Load rules from a JSON file and register in RuleSetsService
   */
  async loadSample(fileName: string) {

      const setName = fileName;
      const fullFileName = `${fileName}.json`;
      const absPath = path.resolve('./samples', fullFileName);
      const content = await fs.readFile(absPath, 'utf-8');
  
      const friendlyRules = JSON.parse(content);
      const engineRules: any [] = RuleMapper.mapArrayToEngine(friendlyRules);

      //naiive rule validation
      for (const rule of engineRules) {
          if (!rule.conditions || !rule.event || !rule.event.type || !rule.event.params || !rule.priority) {
            this.logger.error(`Invalid rule format in ${fullFileName}`)
            throw new Error(`Invalid rule format in ${fullFileName}`);
            }
          await this.addEngineRule(setName, rule);
          }

      return { success:true,  ruleSet: setName, count:engineRules };
      }

  createEmptyRuleSet(name: string) {  //Useful for reserving a ruleset namespace
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

    const transformedRules: RuleDto[] = rules.map((rule) => ({
      when: transformWhenStringToJson(rule.conditions),
      then: {
        do: rule.event.type,
        with: rule.event.params,
      },
      priority: rule.priority,
    })) as RuleDto[];

  transformedRules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return transformedRules;

  }

  addEngineRule(setName: string, ruleObj: any) {
    try{
      if (!this.ruleSets[setName]) {
        this.ruleSets[setName] = [];
        }
        
      const normalizedRule = this.prepareEngineRule(ruleObj);

      const rule = new Rule(normalizedRule);

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
        
      const normalizedRule = this.prepareFriendlyRule(ruleDto);

      const ruleObj = this.toEngineRuleObject(normalizedRule);

      const rule = new Rule(ruleObj as any);
      this.ruleSets[setName].push(rule);
      return { success: true, count: this.ruleSets[setName].length };
      } 
    catch (error) {
      this.logger.warn(`Failed to add friendly rule: ${error.message}`);
      throw new BadRequestException(`Failed to update ruleset`);
      }
    }

  async persistBusinessLogic(setName: string) {

    if(this.sampleFiles.includes(setName)){
      throw new BadRequestException(`Overwiting sample RuleSet "${setName}". This is not permitted. Create a new ruleset instead and copy individual rules.`);
      }

    const rules = this.getFriendlyRules(setName);

    let logic = await this.logicRepository.findOneBy({ name_of_ruleset: setName });

    if (!logic) {
      this.logger.debug('Creating new logic entry');
      logic = this.logicRepository.create({
        name_of_ruleset: setName,
        rules: rules,
        //is_enabled: enabled
        });
      }
    else{
      this.logger.debug('Updating existing logic entry');
      logic.rules = rules;
      //logic.is_enabled = enabled;
      }

     return this.logicRepository.save(logic);

    }
  
  async getBusinessLogic(name: string) {
    const logic = await this.logicRepository.findOneBy({ name_of_ruleset: name });
    if (!logic) {
      throw new NotFoundException(`No saved logic for "${name}" found`);
      }
    return logic;
    }


  async evaluate(setName: string, facts: Record<string, any>) {

    try {

        const rules = this.ruleSets[setName];
        if (!rules) throw new NotFoundException(`Rule set "${setName}" not found`);

        const engine = new Engine(rules, { allowUndefinedFacts: false });
        registerCustomOperators(engine);

        const utils = {
            age: DateUtils.age,
            daysBetween: DateUtils.daysBetween,
            addDays: DateUtils.addDays,
            currentYear: DateUtils.currentYear,
            currentMonth: DateUtils.currentMonth,
            currentDay: DateUtils.currentDay,
            currentDate: DateUtils.currentDate,
            currentDateTime: DateUtils.currentDateTime
            };

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

  private prepareFriendlyRule(rule: RuleDto): RuleDto {
    if (rule.then?.with?.table) {
      rule.then.with.table = capitalizeTableKeys(rule.then.with.table);
      }
    return rule;
  }

  private prepareEngineRule(rule: any): Rule {
    if (rule.event?.params?.table) {
      rule.event.params.table = capitalizeTableKeys(rule.event.params.table);
      }
    return rule;
    }

}
