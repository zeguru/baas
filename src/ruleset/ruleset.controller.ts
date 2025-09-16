import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RuleSetService } from './ruleset.service';

@Controller('ruleset')
export class RuleSetController {
  
  constructor(private readonly ruleSetsService: RuleSetService) {}

    /**
     * Load a predefined JSON ruleset into the calculator
     */
    @Post(':fileName/load')
    async load(@Param('fileName') fileName: string) {
        return this.ruleSetsService.loadFromFile(fileName);
        }

  @Get()
  listRuleSets() {
    return this.ruleSetsService.listRuleSets();
    }

  @Post('/create')
  createRuleSet(@Body('name') name: string) {
    return this.ruleSetsService.createRuleSet(name);
    }

  @Get(':setName')
  getRules(@Param('setName') setName: string) {
    return this.ruleSetsService.getRules(setName);
    }

  @Post(':setName/add')
  addRule(@Param('setName') setName: string, @Body() rule: any) {
    return this.ruleSetsService.addRule(setName, rule);
    }

  @Post(':setName/evaluate')
  evaluate(
    @Param('setName') setName: string,
    @Body() facts: Record<string, any>,
    ) {
    return this.ruleSetsService.evaluate(setName, facts);
    }
  }
