import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RuleSetService } from './ruleset.service';
import { ApiExcludeEndpoint, ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { RuleDto, EvaluateDto } from '../common/dto/rule';

@Controller('ruleset')
@ApiTags('Rulesets')
export class RuleSetController {
  
  constructor(private readonly ruleSetsService: RuleSetService) {}

  /**
   * Load a predefined JSON ruleset from file into the calculator
   */
  @ApiExcludeEndpoint() 
  @Post(':fileName/load')
  async load(@Param('fileName') fileName: string) {
      return this.ruleSetsService.loadFromFile(fileName);
      }

  @Get()
  @ApiOperation({
    summary: 'List available rulesets',
    description: 'Show list of business logic. Grouped into `rulesets` ',
    })
  listRuleSets():String[]{
    return this.ruleSetsService.listRuleSets();
    }

  @Post(':nameOfRuleSet/create')
  @ApiOperation({
    summary: 'Create an empty ruleset',
    description: 'Create a title for a set of business rules `ruleset`. Without rules, yet',
    })
  createRuleSet(@Param('nameOfRuleSet') setName: string) {
    return this.ruleSetsService.createRuleSet(setName);
    }

  @Post(':nameOfRuleSet/clear')
  @ApiOperation({
    summary: 'Delete contents of a ruleset',
    description: 'Delete the rules inside a ruleset but not the ruleset itself',
    })
  emptifyRuleSet(@Param('nameOfRuleSet') setName: string) {
    return this.ruleSetsService.emptifyRuleSet(setName);
    }

  @Get(':nameOfRuleSet')
  @ApiOperation({
    summary: 'Show all business rules defined in selected ruleset',
    description: 'Show all specific rule that forms the logic within that `ruleset` ',
    })
  @ApiOkResponse({description: 'Individual rules for the given `ruleset`', type: RuleDto, isArray: true,})
  getFriendlyRules(@Param('nameOfRuleSet') setName: string):RuleDto[] {
    return this.ruleSetsService.getFriendlyRules(setName);
    }

  @Post(':nameOfRuleSet/update')
  @ApiOperation({
    summary: 'Add business logic (one or more rules) to an existing ruleset',
    description: 'Add a set of sequential rules that implement a specific business logic.Eg agent-commissions, loan-prequalification, claim-triage, motor-insurance-premiums',
    })
  @ApiOkResponse({description: 'Name of ruleset and the number of rules added'})
  addRule(@Param('nameOfRuleSet') setName: string, @Body() rule: RuleDto) {
    return this.ruleSetsService.addFriendlyRule(setName, rule);
    }

  @ApiExcludeEndpoint() 
  @Post(':nameOfRuleSet/evaluate')
  @ApiBody({
    schema: {
      type: 'object',
      example: { amount: 5500, category: 'VIP' },
      additionalProperties: { type: 'any' },
      },
    })
  evaluate(
    @Param('nameOfRuleSet') setName: string,
    @Body() facts: Record<string, any>,
    ) {
    return this.ruleSetsService.evaluate(setName, facts);
    }
    
  }
