import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorController } from './calculator.controller';
import { CalculatorService } from './calculator.service';

describe('CalculatorController', () => {
  let controller: CalculatorController;
  let service: CalculatorService;

  const mockCalculatorService = {
    compute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculatorController],
      providers: [
        {
          provide: CalculatorService,
          useValue: mockCalculatorService,
        },
      ],
    }).compile();

    controller = module.get<CalculatorController>(CalculatorController);
    service = module.get<CalculatorService>(CalculatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call compute on the service and return result', async () => {
    const setName = 'VIP_RULES';
    const facts = { amount: 5500, category: 'VIP' };
    const expectedResult = { score: 99 };

    mockCalculatorService.compute.mockResolvedValue(expectedResult);

    const result = await controller.compute(setName, facts);

    expect(result).toBe(expectedResult);
    expect(mockCalculatorService.compute).toHaveBeenCalledWith(setName, facts);
    expect(mockCalculatorService.compute).toHaveBeenCalledTimes(1);
  });
});