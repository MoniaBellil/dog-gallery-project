import { BreedsService } from './breeds.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface PaginatedResult<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

describe('BreedsService', () => {
  let service: BreedsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BreedsService();
    //  Associer le mock axios à l'instance utilisée par le service
    (service as any).axiosInstance = mockedAxios;
  });

  it('getBreeds should return paginated and filtered results', async () => {
    const fakeBreeds = [
      { id: 1, name: 'Beagle', image: { url: 'beagle.jpg' } },
      { id: 2, name: 'Bulldog', image: { url: 'bulldog.jpg' } },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: fakeBreeds });

    const res = (await service.getBreeds(1, 10, 'beag')) as PaginatedResult<any>;

    expect(res.items.length).toBe(1);
    expect(res.items[0].name).toBe('Beagle');
    expect(res.total).toBe(1);
  });

  it('getBreedById should return mapped breed when found', async () => {
    const fakeBreeds = [{ id: 1, name: 'Beagle', image: { url: 'beagle.jpg' } }];

    mockedAxios.get.mockResolvedValueOnce({ data: fakeBreeds });

    const breed = (await service.getBreedById('1')) as any;

    expect(breed).toEqual({
      id: 1,
      name: 'Beagle',
      image: 'beagle.jpg',
      temperament: 'N/A',
      life_span: 'N/A',
      origin: 'Inconnu',
      height: 'N/A',
    });
  });

  it('getBreedById should throw when breed not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    await expect(service.getBreedById('999')).rejects.toThrow('Breed not found');
  });

  it('should use cache on second call (no axios call)', async () => {
    const fakeBreeds = [{ id: 1, name: 'Beagle', image: { url: 'beagle.jpg' } }];

    mockedAxios.get.mockResolvedValueOnce({ data: fakeBreeds });

    await service.getBreeds(1, 10, '');
    await service.getBreeds(1, 10, ''); // Utilise le cache

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
