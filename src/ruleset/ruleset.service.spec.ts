import { Test, TestingModule } from '@nestjs/testing';
import { RulesetService } from './ruleset.service';

describe('RulesetService', () => {
  let service: RulesetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesetService],
    }).compile();

    service = module.get<RulesetService>(RulesetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
