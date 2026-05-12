// calculator.service.spec.ts

import {
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { Test, TestingModule } from '@nestjs/testing';
  
  import { CalculatorService } from './calculator.service';
  import { RuleSetService } from '../ruleset/ruleset.service';
  import { SessionManager } from '../session/manager';
  
  describe('CalculatorService', () => {
    let service: CalculatorService;
  
    const mockRuleSetService = {
      getRules: jest.fn(),
    };
  
    const mockSessionManager = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CalculatorService,
          {
            provide: RuleSetService,
            useValue: mockRuleSetService,
          },
          {
            provide: SessionManager,
            useValue: mockSessionManager,
          },
        ],
      }).compile();
  
      service = module.get<CalculatorService>(CalculatorService);
  
      jest.clearAllMocks();
    });
  
    describe('compute', () => {
      it('should compute fixed adjustment', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'amount',
                  operator: 'greaterThan',
                  value: 100,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'discount',
                mode: 'fixed',
                value: 50,
                break: false,
                message: 'Flat discount',
              },
            },
            priority: 1,
          },
        ]);
  
        const result = await service.compute('discount-rules', {
          amount: 200,
        });
  
        expect(result.ruleSet).toBe('discount-rules');
  
        expect(result.derivedFacts.discount).toBe('50');
  
        expect(result.breakdown[0]).toEqual({
          do: 'apply-adjustment',
          message: 'Flat discount',
          result: '50',
        });
      });
  
      it('should compute rate adjustment', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'salary',
                  operator: 'greaterThan',
                  value: 0,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'tax',
                mode: 'rate',
                base: 'salary',
                value: 0.1,
                break: false,
                message: '10% tax',
              },
            },
            priority: 1,
          },
        ]);
  
        const result = await service.compute('tax-rules', {
          salary: 1000,
        });
  
        expect(result.derivedFacts.tax).toBe('100');
      });
  
      it('should compute expression adjustment', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'principal',
                  operator: 'greaterThan',
                  value: 0,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'interest',
                mode: 'expression',
                value: 'principal * rate',
                break: false,
                message: 'Compute interest',
              },
            },
            priority: 1,
          },
        ]);
  
        const result = await service.compute('interest-rules', {
          principal: 1000,
          rate: 0.2,
        });
  
        expect(result.derivedFacts.interest).toBe('200');
      });
  
      it('should compute value lookup adjustment', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'customerType',
                  operator: 'equal',
                  value: 'VIP',
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'discount',
                mode: 'value-lookup',
                base: 'customerType',
                table: {
                  VIP: 25,
                  REGULAR: 5,
                },
                break: false,
                message: 'Lookup discount',
              },
            },
            priority: 1,
          },
        ]);
  
        const result = await service.compute('lookup-rules', {
          customerType: 'VIP',
        });
  
        expect(result.derivedFacts.discount).toBe('25');
      });
  
      it('should support sessions', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'amount',
                  operator: 'greaterThan',
                  value: 100,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'bonus',
                mode: 'fixed',
                value: 10,
                break: false,
                message: 'Session bonus',
              },
            },
            priority: 1,
          },
        ]);
  
        mockSessionManager.get.mockReturnValue({
          state: {},
        });
  
        const result = await service.compute('session-rules', {
          amount: 500,
          sessionID: 'abc123',
        });
  
        expect(mockSessionManager.get).toHaveBeenCalledWith('abc123');
  
        expect(mockSessionManager.update).toHaveBeenCalled();
  
        expect(result.session).toBeDefined();
      });
  
      it('should stop engine when break=true', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'amount',
                  operator: 'greaterThan',
                  value: 0,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'step1',
                mode: 'fixed',
                value: 1,
                break: true,
                message: 'Stop here',
              },
            },
            priority: 100,
          },
          {
            conditions: {
              all: [
                {
                  fact: 'amount',
                  operator: 'greaterThan',
                  value: 0,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'step2',
                mode: 'fixed',
                value: 2,
                break: false,
                message: 'Should not execute',
              },
            },
            priority: 1,
          },
        ]);
  
        const result = await service.compute('break-rules', {
          amount: 50,
        });
  
        expect(result.stopped).toBe(true);
  
        expect(result.derivedFacts.step1).toBe('1');
  
        expect(result.derivedFacts.step2).toBeUndefined();
      });
  
      it('should throw BadRequestException for missing facts', async () => {
        mockRuleSetService.getRules.mockReturnValue([
          {
            conditions: {
              all: [
                {
                  fact: 'salary',
                  operator: 'greaterThan',
                  value: 0,
                },
              ],
            },
            event: {
              type: 'apply-adjustment',
              params: {
                item: 'tax',
                mode: 'rate',
                base: 'salary',
                value: 0.1,
                break: false,
                message: 'tax',
              },
            },
            priority: 1,
          },
        ]);
  
        await expect(
          service.compute('missing-facts', {}),
        ).rejects.toThrow(BadRequestException);
      });
  
      it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockRuleSetService.getRules.mockImplementation(() => {
          throw new Error('Unexpected failure');
        });
  
        await expect(
          service.compute('broken-rules', {}),
        ).rejects.toThrow(InternalServerErrorException);
      });
    });
  });