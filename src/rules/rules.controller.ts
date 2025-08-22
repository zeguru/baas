import { Controller, Post, Body } from '@nestjs/common';
import { RulesService } from './rules.service';
import { Rule } from 'json-rules-engine';

@Controller('rules')
export class RulesController {

    constructor(private readonly rulesService: RulesService) {}

    /**
   * Run preconfigured rules with user-provided facts
   */
    @Post('example')
    async runExample(@Body() facts: Record<string, any>) {
        return this.rulesService.runExample(facts);
        }

    /**
     * Add a new rule dynamically to the in-memory engine
     */
    @Post('add')
    async addRule(@Body() rule: Rule) {
        return this.rulesService.addRule(rule);
        }

    @Post('evaluate')
    async evaluateFacts(@Body() facts: Record<string, any>) {
        return this.rulesService.evaluateFacts(facts);
        }

    /**
     * Run dynamic queries with custom rules + facts
     */
    @Post('dynamic')
    async runDynamic(
        @Body() payload: { facts: Record<string, any>; rules: Rule[] },
        ) {
        return this.rulesService.runDynamic(payload.facts, payload.rules);
    }
    }
