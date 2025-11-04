import { Test, TestingModule } from '@nestjs/testing';
import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';

describe('BreedsController', () => {
  let controller: BreedsController;
  let service: BreedsService;

  const mockService = {
    getBreeds: jest.fn(),
    getBreedById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BreedsController],
      providers: [{ provide: BreedsService, useValue: mockService }],
    }).compile();

    controller = module.get<BreedsController>(BreedsController);
    service = module.get<BreedsService>(BreedsService);

    mockService.getBreeds.mockReset();
    mockService.getBreedById.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAll should call service.getBreeds with default params', async () => {
    const fakeResult = { page: 1, limit: 12, total: 0, items: [] };
    mockService.getBreeds.mockResolvedValue(fakeResult);

    const res = await controller.getAll();
    expect(mockService.getBreeds).toHaveBeenCalledWith(1, 12, undefined);
    expect(res).toBe(fakeResult);
  });

  it('getAll should pass query params to service', async () => {
    const fakeResult = { page: 2, limit: 5, total: 0, items: [] };
    mockService.getBreeds.mockResolvedValue(fakeResult);

    //  on précise le type explicitement
    const res: { page: number; limit: number; total: number; items: any[] } =
      (await controller.getAll('2', '5', 'beagle')) as any;

    expect(mockService.getBreeds).toHaveBeenCalledWith(2, 5, 'beagle');
    expect(res.page).toBe(2);
  });

  it('getOne should call service.getBreedById', async () => {
    const fakeBreed = { id: 1, name: 'Beagle' };
    mockService.getBreedById.mockResolvedValue(fakeBreed);

    const res = await controller.getOne('1');
    expect(mockService.getBreedById).toHaveBeenCalledWith('1');
    expect(res).toBe(fakeBreed);
  });
});
