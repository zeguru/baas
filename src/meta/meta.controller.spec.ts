import { Test, TestingModule } from '@nestjs/testing';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';

describe('MetaController', () => {
  let controller: MetaController;
  let service: MetaService;

  const mockMetaService = {
    getVersion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetaController],
      providers: [
        {
          provide: MetaService,
          useValue: mockMetaService,
        },
      ],
    }).compile();

    controller = module.get<MetaController>(MetaController);
    service = module.get<MetaService>(MetaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return version from service', () => {
    mockMetaService.getVersion.mockReturnValue('1.2.3');

    const result = controller.getVersion();

    expect(result).toEqual({ version: '1.2.3' });
    expect(service.getVersion).toHaveBeenCalled();
  });
});