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
    description: 'Show list of available business logic. Grouped into `rulesets` ',
    })
  listRuleSets():String[]{
    return this.ruleSetsService.listRuleSets();
    }

  @Get(':nameOfRuleSet')
  @ApiOperation({
    summary: 'See all business rules defined in selected ruleset',
    description: 'Show all rules that form the business logic in that `ruleset` ',
    })
  @ApiOkResponse({description: 'Individual rules for the given `ruleset`', type: RuleDto, isArray: true,})
  getFriendlyRules(@Param('nameOfRuleSet') setName: string):RuleDto[] {
    return this.ruleSetsService.getFriendlyRules(setName);
    }


  @Post(':nameOfRuleSet/create')
  @ApiOperation({
    summary: 'Create a new empty ruleset',
    description: 'Create a title for a set of business rules aka `ruleset`. Without rules, yet',
    })
  createRuleSet(@Param('nameOfRuleSet') setName: string) {
    return this.ruleSetsService.createRuleSet(setName);
    }

  @Post(':nameOfRuleSet/clear')
  @ApiOperation({
    summary: 'Delete contents of a ruleset',
    description: 'Delete the rules inside a ruleset but not the `ruleset` itself',
    })
  emptifyRuleSet(@Param('nameOfRuleSet') setName: string) {
    return this.ruleSetsService.emptifyRuleSet(setName);
    }


  @Post(':nameOfRuleSet/update')
  @ApiOperation({
    summary: 'Add business logic (one or more rules) to an existing ruleset',
    description: 'Add a set of sequential rules that implement a specific business logic',
    })
  @ApiOkResponse({description: 'Name of ruleset and the number of rules added'})
  @ApiBody({
      description: 'Create a rule definition',
      type: RuleDto,
      examples: {
        simpleFixed: {
          summary: 'Simple fixed rule',
          description: 'Award 50 points to PREMIUM users who buy 1000 items or more',
          value: {
            when: {
              all: [
                { fact: 'quantity', operator: 'greaterThanInclusive', value: 1000 },
                { fact: 'category', operator: 'equal', value: "PREMIUM" }
              ]
            },
            then: {
              do: 'apply-adjustment',
              with: {
                item: 'points',
                mode: 'fixed',
                value: 50,
                message: 'Award 50 points when quantity is 1000 or above and customer is PREMIUM'
              }
            },
            priority: 100
          }
        },
        simpleRate: {
          summary: 'Rate rule',
          description: 'Compute tax by applying a given rate. Applicable if price is greater than 20k OR labelled as LUXURY/EXPORT',
          value: {
            when: {
              any: [
                { fact: 'price', operator: 'greaterThan', value: 20000 },
                { fact: 'category', operator: 'in', value: ["LUXURY","EXPORT"] }
              ]
            },
            then: {
              do: 'apply-adjustment',
              with: {
                item: 'tax',
                mode: 'rate',
                value: 0.2,
                base: 'price',
                message: 'Apply 20% tax, of price, for items priced above 20k OR made for export/luxury purposes'
              }
            },
            priority: 100
          }
        },
        rangeBased: {
          summary: 'Range lookup rule',
          description: 'Calculate grade based on students percentage score',
          value: {
            when: {
              all: [{ fact: 'marks', operator: 'greaterThan', value: 0 }]
            },
            then: {
              do: 'apply-adjustment',
              with: {
                item: 'examGrade',
                mode: 'range-lookup',
                base: 'marks',
                table: {
                  '1-39': 'D',
                  '40-59': 'C',
                  '60-79': 'B',
                  '80-100': 'A',
                  '101-9999999': 'X',

                },
                default: 'E',
                message: 'Grade students based on the table using their total marks'
              }
            },
            priority: 100
          }
        },
        rulePriority: {
          summary: 'Rule dependence',
          description: 'Apply a rule that uses the result of a previous, higher priority, rule in the same ruleset. ',
          value: {
            when: {
              all: [
                { fact: 'examGrade', operator: 'in', value: ["A","B"] }
              ]
            },
            then: {
              do: 'advice',
              with: {
                message: 'Good job, keep it up'
              }
            },
            priority: 50
          }
        },
        expressionBased: {
          summary: 'Expression rule. Advanced',
          description: 'Use common expressions: arithmetic, trigonometry, logarithmic, statistics and other utility functions',
          value: {
            when: {
              all: [
                  { fact: 'upperLimit', operator: 'greaterThan', value: 1 },
                  { fact: 'computedTax', operator: 'greaterThan', value: 1 }
                ]
            },
            then: {
              do: 'apply-adjustment',
              with: {
                item: 'applicableTax',
                mode: 'expression',
                value: 'min(upperLimit,computedTax)',
                context: ["upperLimit","computedTax"],
                message: 'Applicable tax is the one calculated or the limit, whichever is lower'
              }
            },
            priority: 100
          }
        },
      }
    })
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
