import { Body, Controller, Param, Post } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EvaluateDto } from '../common/dto/rule';
import { ApiExcludeEndpoint, ApiTags, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Compute')
@Controller('calculator')
export class CalculatorController {

    constructor(private readonly calculatorService: CalculatorService) {}

    @Post(':nameOfRuleSet/compute')
    @ApiBody({
        schema: {
          type: 'object',
          example: { amount: 5500, category: 'VIP' },
          additionalProperties: { type: 'any' },
          },
        })
    async compute(
      @Param('nameOfRuleSet') setName: string,
      @Body() facts: Record<string, any>,
        ) {
          return this.calculatorService.compute(setName, facts);
        }

}
