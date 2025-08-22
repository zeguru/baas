import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Engine, Rule } from 'json-rules-engine';

@Injectable()
export class RuleSetService {
  private ruleSets: Record<string, Rule[]> = {};

  constructor() {
    // Example preconfigured sets
    this.ruleSets['salary'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'gross', operator: 'greaterThan', value: 0 }],
        },
        event: {
          type: 'net-salary',
          params: { message: 'Salary calculation rule triggered' },
        },
      }),
    ];

    this.ruleSets['eligibility'] = [
      new Rule({
        conditions: {
          all: [{ fact: 'age', operator: 'greaterThan', value: 18 }],
        },
        event: {
          type: 'adult',
          params: { message: 'User is an adult' },
        },
      }),
    ];
  }

  createRuleSet(name: string) {
    if (this.ruleSets[name]) {
      throw new BadRequestException(`Rule set "${name}" already exists`);
    }
    this.ruleSets[name] = [];
    return { success: true, ruleSet: name };
  }

  listRuleSets() {
    return Object.keys(this.ruleSets);
  }

  getRules(setName: string) {
    const rules = this.ruleSets[setName];
    if (!rules) throw new NotFoundException(`Rule set "${setName}" not found`);
    return rules.map((r: any) => r.toJSON());
  }

  addRule(setName: string, ruleObj: any) {
    if (!this.ruleSets[setName]) {
      this.ruleSets[setName] = [];
    }
    const rule = new Rule(ruleObj);
    this.ruleSets[setName].push(rule);
    return { success: true, count: this.ruleSets[setName].length };
  }

  async evaluate(setName: string, facts: Record<string, any>) {
    const rules = this.ruleSets[setName];
    if (!rules) throw new NotFoundException(`Rule set "${setName}" not found`);

    const engine = new Engine(rules, { allowUndefinedFacts: false });

    let stopped = false;

    // stop evaluation if a "break" rule fires
    engine.on('success', (event, almanac, ruleResult) => {
        const originalRule = rules.find((r) => r.event.type === event.type);
        if (originalRule && (originalRule as any).break) {
        stopped = true;
        engine.stop();
        }
    });

    const result = await engine.run(facts);

    return {
      ruleSet: setName,
      stopped: stopped,
      events: result.events.map((e) => ({
        type: e.type,
        params: e.params,
      })),
    };
  }
}
