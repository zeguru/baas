// rule-set.service.spec.ts

import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { Test, TestingModule } from '@nestjs/testing';
  import { getRepositoryToken } from '@nestjs/typeorm';
  import { Rule } from 'json-rules-engine';
  import { Repository } from 'typeorm';
  
  import { RuleSetService } from './ruleset.service';
  import { BusinessLogic } from './logic';
  
  describe('RuleSetService', () => {
    let service: RuleSetService;
    let repository: jest.Mocked<Repository<BusinessLogic>>;
  
    const mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RuleSetService,
          {
            provide: getRepositoryToken(BusinessLogic),
            useValue: mockRepository,
          },
        ],
      }).compile();
  
      service = module.get<RuleSetService>(RuleSetService);
      repository = module.get(getRepositoryToken(BusinessLogic));
  
      jest.clearAllMocks();
    });
  
    describe('constructor', () => {
      it('should initialize welcome ruleset', () => {
        const rules = service.getRules('welcome');
  
        expect(rules).toBeDefined();
        expect(rules.length).toBe(1);
        expect(rules[0]).toBeInstanceOf(Rule);
      });
    });
  
    describe('createEmptyRuleSet', () => {
      it('should create a new empty ruleset', () => {
        const result = service.createEmptyRuleSet('test-ruleset');
  
        expect(result).toEqual({
          success: true,
          ruleSet: 'test-ruleset',
        });
  
        expect(service.getRules('test-ruleset')).toEqual([]);
      });
  
      it('should throw if ruleset already exists', () => {
        service.createEmptyRuleSet('existing');
  
        expect(() => service.createEmptyRuleSet('existing')).toThrow(
          InternalServerErrorException,
        );
      });
    });
  
    describe('emptifyRuleSet', () => {
      it('should empty an existing ruleset', () => {
        service.addEngineRule('sample', {
          conditions: {
            all: [
              {
                fact: 'age',
                operator: 'equal',
                value: 18,
              },
            ],
          },
          event: {
            type: 'approved',
            params: {},
          },
          priority: 1,
        });
  
        const result = service.emptifyRuleSet('sample');
  
        expect(result).toEqual({
          success: true,
          ruleSet: 'sample',
        });
  
        expect(service.getRules('sample')).toEqual([]);
      });
  
      it('should throw if ruleset does not exist', () => {
        expect(() => service.emptifyRuleSet('missing')).toThrow(
          BadRequestException,
        );
      });
    });
  
    describe('listRuleSets', () => {
      it('should return all ruleset names', () => {
        service.createEmptyRuleSet('alpha');
        service.createEmptyRuleSet('beta');
  
        const result = service.listRuleSets();
  
        expect(result).toContain('welcome');
        expect(result).toContain('alpha');
        expect(result).toContain('beta');
      });
    });
  
    describe('getRules', () => {
      it('should return rules for a ruleset', () => {
        service.createEmptyRuleSet('my-rules');
  
        expect(service.getRules('my-rules')).toEqual([]);
      });
  
      it('should throw when ruleset does not exist', () => {
        expect(() => service.getRules('missing')).toThrow(
          NotFoundException,
        );
      });
    });
  
    describe('addEngineRule', () => {
      it('should add an engine rule', () => {
        const result = service.addEngineRule('engine-set', {
          conditions: {
            all: [
              {
                fact: 'salary',
                operator: 'greaterThan',
                value: 1000,
              },
            ],
          },
          event: {
            type: 'eligible',
            params: {
              approved: true,
            },
          },
          priority: 10,
        });
  
        expect(result.success).toBe(true);
        expect(result.count).toBe(1);
  
        const rules = service.getRules('engine-set');
        expect(rules.length).toBe(1);
        expect(rules[0]).toBeInstanceOf(Rule);
      });

    });
  
    describe('addFriendlyRule', () => {
      it('should add a friendly rule', () => {
        const result = service.addFriendlyRule('friendly-set', {
          when: {
            all: [
              {
                fact: 'country',
                operator: 'equal',
                value: 'KE',
              },
            ],
          },
          then: {
            do: 'approve',
            with: {
              break: false,
              message: 'Kenya approved',
            },
          },
          priority: 5,
        });
  
        expect(result.success).toBe(true);
  
        const rules = service.getRules('friendly-set');
        expect(rules.length).toBe(1);
      });
  
      it('should throw for invalid friendly rule', () => {
        expect(() =>
          service.addFriendlyRule('bad-friendly', {} as any),
        ).toThrow(BadRequestException);
      });
    });
  
    describe('getFriendlyRules', () => {
      it('should return transformed friendly rules sorted by priority', () => {
        service.addEngineRule('priority-set', {
          conditions: {
            all: [
              {
                fact: 'x',
                operator: 'equal',
                value: 1,
              },
            ],
          },
          event: {
            type: 'low',
            params: {},
          },
          priority: 1,
        });
  
        service.addEngineRule('priority-set', {
          conditions: {
            all: [
              {
                fact: 'x',
                operator: 'equal',
                value: 2,
              },
            ],
          },
          event: {
            type: 'high',
            params: {},
          },
          priority: 100,
        });
  
        const result = service.getFriendlyRules('priority-set');
  
        expect(result.length).toBe(2);
        expect(result[0].priority).toBe(100);
        expect(result[1].priority).toBe(1);
      });
  
      it('should throw when ruleset does not exist', () => {
        expect(() =>
          service.getFriendlyRules('missing'),
        ).toThrow(NotFoundException);
      });
    });
  
    describe('evaluate', () => {
      beforeEach(() => {
        service.addFriendlyRule('eligibility', {
          when: {
            all: [
              {
                fact: 'age',
                operator: 'greaterThanInclusive',
                value: 18,
              },
            ],
          },
          then: {
            do: 'approve',
            with: {
              break: false,
              message: 'approved',
            },
          },
          priority: 1,
        });
      });
  
      it('should evaluate rules successfully', async () => {
        const result = await service.evaluate('eligibility', {
          age: 25,
        });
  
        expect(result.ruleSet).toBe('eligibility');
        expect(result.then.length).toBe(1);
        expect(result.then[0].do).toBe('approve');
        
      });
  
      it('should return empty events when no rule matches', async () => {
        const result = await service.evaluate('eligibility', {
          age: 10,
        });
  
        expect(result.then).toEqual([]);
      });
  
      it('should throw when ruleset does not exist', async () => {
        await expect(
          service.evaluate('missing', {}),
        ).rejects.toThrow(BadRequestException);
      });
    });
  
    describe('persistBusinessLogic', () => {
      it('should create new business logic if not existing', async () => {
        repository.findOneBy.mockResolvedValue(null);
  
        repository.create.mockImplementation((data) => data as any);
  
        repository.save.mockResolvedValue({
          id: 1,
          name_of_ruleset: 'persisted',
        } as any);
  
        service.addFriendlyRule('persisted', {
          when: {
            all: [
              {
                fact: 'score',
                operator: 'greaterThan',
                value: 50,
              },
            ],
          },
          then: {
            do: 'pass',
            with: {
                break: false,
                message: 'passed',
              },
          },
          priority: 1,
        });
  
        const result = await service.persistBusinessLogic('persisted');
  
        expect(repository.create).toHaveBeenCalled();
        expect(repository.save).toHaveBeenCalled();
  
        expect(result).toEqual({
          id: 1,
          name_of_ruleset: 'persisted',
        });
      });
  
      it('should update existing business logic', async () => {
        const existing = {
          id: 1,
          name_of_ruleset: 'existing',
          rules: [],
        };
  
        repository.findOneBy.mockResolvedValue(existing as any);
        repository.save.mockResolvedValue(existing as any);
  
        service.addFriendlyRule('existing', {
          when: {
            all: [
              {
                fact: 'income',
                operator: 'greaterThan',
                value: 5000,
              },
            ],
          },
          then: {
            do: 'premium',
            with: {
                break: false,
                message: 'premium',
              },
          },
          priority: 1,
        });
  
        await service.persistBusinessLogic('existing');
  
        expect(repository.save).toHaveBeenCalled();
      });
  
      it('should reject sample rulesets', async () => {
        await expect(
          service.persistBusinessLogic('sample-netpay-calc'),
        ).rejects.toThrow(BadRequestException);
      });
    });
  
    describe('getBusinessLogic', () => {
      it('should return business logic', async () => {
        repository.findOneBy.mockResolvedValue({
          id: 1,
          name_of_ruleset: 'logic',
        } as any);
  
        const result = await service.getBusinessLogic('logic');
  
        expect(result.name_of_ruleset).toBe('logic');
      });
  
      it('should throw when logic not found', async () => {
        repository.findOneBy.mockResolvedValue(null);
  
        await expect(
          service.getBusinessLogic('missing'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });