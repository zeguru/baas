import { Controller, Post, Param, Body } from '@nestjs/common';
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

    @Post(':setName/tiered/compute')
    async computeTiered(
          @Param('setName') setName: string,
          @Body() facts: Record<string, any>,
        ) {
          return this.calculatorService.computeTiered(setName, facts);
        }    
}
