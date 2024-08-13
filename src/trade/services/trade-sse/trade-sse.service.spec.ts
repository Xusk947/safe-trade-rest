import { Test, TestingModule } from '@nestjs/testing';
import { TradeSseService } from './trade-sse.service';

describe('TradeSseService', () => {
  let service: TradeSseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradeSseService],
    }).compile();

    service = module.get<TradeSseService>(TradeSseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
