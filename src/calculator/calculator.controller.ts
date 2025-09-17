import { Body, Controller, Param, Post } from '@nestjs/common';
import { CalculatorService } from './calculator.service';

@Controller('calculator')
export class CalculatorController {

    constructor(private readonly calculatorService: CalculatorService) {}

    @Post(':setName/custom/compute')
    async compute(
          @Param('setName') setName: string,
          @Body() facts: Record<string, any>,
        ) {
          return this.calculatorService.compute(setName, facts);
        }

}
