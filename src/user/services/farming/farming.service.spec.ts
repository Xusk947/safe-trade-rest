import { Test, TestingModule } from '@nestjs/testing';
import { FarmingService } from './farming.service';

describe('FarmingService', () => {
  let service: FarmingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmingService],
    }).compile();

    service = module.get<FarmingService>(FarmingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
