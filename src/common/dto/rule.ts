
import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


export type ValueLookupTable = Record<string, string | number | boolean>;
export type RangeLookupTable = Record<string, number>; // keys like "0-40"
export type ValueRangeLookupTable = Record<string, RangeLookupTable>; // category -> range->number

export type TableUnion = ValueLookupTable | RangeLookupTable | ValueRangeLookupTable;

export class EvaluateDto {
    [key: string]: any; 
    }

export class ConditionDto {
    @ApiProperty({ example: 'coffeeCups' })
    @IsString()
    fact: string;

    @ApiProperty({ example: 'greaterThan' })
    @IsString()
    operator: string;

    @ApiProperty({ example: 3 })
    value: any;
    }

export class WhenDto {

  @Type(() => ConditionDto)
  all?: ConditionDto[];
  
}

export class WithDto {
  @ApiProperty({ description: 'Stop execution ?', example: false, default: false })
  break: boolean;

  @ApiProperty({ description:'The result of the computation, adjustment', example: 'discount' })
  @IsOptional()
  item?: string;

  @ApiProperty({ description:'Type of operation to be done. We apply it on `base` or `table` using `value`', example: 'rate', enum: ['fixed', 'rate', 'expression', 'value-lookup', 'range-lookup', 'value-range-lookup'] })
  @IsOptional()
  mode?: string;

  @ApiProperty({ description: 'The fact, variable required for this computation, adjustment', example: 'amount' })
  @IsOptional()
  base?: string;

  @ApiProperty({ description:'The actual value that has the `mode` applied to', example: 0.16 })
  @IsOptional()
  value?: any;

  @IsOptional()
  table?: TableUnion;

  @ApiProperty({description:'Describes the rule, step', example: 'Awesome, give 10% discount to PREMIUM and VIP.'})
  @IsString()
  message: string;
  
  }

export class ThenDto {
  @ApiProperty({ example: 'apply-adjustment' })
  @IsString()
  do: string;

  @ApiProperty({ type: WithDto })
  @IsObject()
  @ValidateNested()
  @Type(() => WithDto)
  with: WithDto;
  }

export class RuleDto {
  @ApiProperty({
    type: WhenDto,
    description: 'Conditions that determine when the rule should trigger',
    example: {
      all: [
        { fact: 'amount', operator: 'greaterThan', value: 1000 },
        { fact: 'category', operator: 'in', value: ['PREMIUM','VIP'] },
      ],
    },
  })
  @ValidateNested()
  @Type(() => WhenDto)
  when: WhenDto;

  @ApiProperty({ type: ThenDto })
  @ValidateNested()
  @Type(() => ThenDto)
  then: ThenDto;

  @ApiProperty({ description:'Higher priority rules are evaluated first', example: 1 })
  priority: number;
  }


  