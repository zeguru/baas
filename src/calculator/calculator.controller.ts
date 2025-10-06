import { Body, Controller, Param, Post } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EvaluateDto } from '../common/dto/rule';
import { ApiExcludeEndpoint, ApiTags, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';

@Controller('calculator')
export class CalculatorController {

    constructor(private readonly calculatorService: CalculatorService) {}

    @Post(':setName/custom/compute')
    @ApiBody({
        schema: {
          type: 'object',
          example: { amount: 5500, category: 'VIP' },
          additionalProperties: { type: 'any' },
          },
        })
    async compute(
      @Param('setName') setName: string,
      @Body() facts: Record<string, any>,
        ) {
          return this.calculatorService.compute(setName, facts);
        }

}
