import { Controller, Post, Param, Body } from '@nestjs/common';
import { CalculatorService } from './calculator.service';

@Controller('calculator')
export class CalculatorController {

    constructor(private readonly calculatorService: CalculatorService) {}

    /**
     * Load a predefined JSON ruleset into the calculator
     */
    @Post(':fileName/load')
    async load(@Param('fileName') fileName: string) {
        // hardcoded for now → can later make this dynamic or configurable
        //const filePath = 'src/logic/net-rules.json';
        return this.calculatorService.loadFromFile(fileName);
        }

    // @Post(':setName/simple/compute')
    // async calculate(
    //     @Param('setName') setName: string,
    //     @Body() facts: Record<string, any>,
    //     ) {
    //       return this.calculatorService.naiveCalculate(setName, facts);
    //     }


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
