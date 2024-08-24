import { Test, TestingModule } from '@nestjs/testing';
import { TradeAcceptService } from './trade-accept.service';

describe('TradeAcceptService', () => {
  let service: TradeAcceptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradeAcceptService],
    }).compile();

    service = module.get<TradeAcceptService>(TradeAcceptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
