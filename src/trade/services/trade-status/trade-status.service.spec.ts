import { Test, TestingModule } from '@nestjs/testing';
import { TradeStatusService } from './trade-status.service';

describe('TradeStatusService', () => {
  let service: TradeStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradeStatusService],
    }).compile();

    service = module.get<TradeStatusService>(TradeStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
