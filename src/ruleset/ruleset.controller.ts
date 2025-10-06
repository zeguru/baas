import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RuleSetService } from './ruleset.service';
import { ApiExcludeEndpoint, ApiTags, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: 'List available rulesets.' })
  listRuleSets():String[]{
    return this.ruleSetsService.listRuleSets();
    }

  @ApiExcludeEndpoint()
  @Post('/create')
  createRuleSet(@Body('name') name: string) {
    return this.ruleSetsService.createRuleSet(name);
    }

  @Get(':setName')
  @ApiOkResponse({description: 'List rules for the given rule set', type: RuleDto, isArray: true,})
  getFriendlyRules(@Param('setName') setName: string):RuleDto[] {
    return this.ruleSetsService.getFriendlyRules(setName);
    }

  @Post(':setName/add')
  addRule(@Param('setName') setName: string, @Body() rule: RuleDto) {
    return this.ruleSetsService.addFriendlyRule(setName, rule);
    }

  @Post(':setName/evaluate')
  @ApiBody({
    schema: {
      type: 'object',
      example: { amount: 5500, category: 'VIP' },
      additionalProperties: { type: 'any' },
      },
    })
  evaluate(
    @Param('setName') setName: string,
    @Body() facts: Record<string, any>,
    ) {
    return this.ruleSetsService.evaluate(setName, facts);
    }
    
  }
