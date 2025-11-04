import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as NodeCache from 'node-cache';
import axiosRetry from 'axios-retry';

const DOGAPI_BASE = 'https://api.thedogapi.com/v1';
const API_KEY = process.env.DOGAPI_KEY || '';

//axiosRetry pour relancer automaticement les requêtes en cas d'erreur
axiosRetry(axios, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

//NodeCache pour stocker les reponses en memoire : eviter de trop appler api
@Injectable()
export class BreedsService {
  private readonly cache = new NodeCache({ stdTTL: 300 });
  private readonly logger = new Logger(BreedsService.name);
  private axiosInstance = axios.create({
    baseURL: DOGAPI_BASE,
    timeout: 5000,
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  async getBreeds(page = 1, limit = 12, search?: string) {
    const cacheKey = `breeds:${page}:${limit}:${search || ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const res = await this.axiosInstance.get('/breeds');
      let breeds = res.data;

      if (search) {
        breeds = breeds.filter((b) =>
          b.name.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const total = breeds.length;
      const start = (page - 1) * limit;
      const pageItems = breeds.slice(start, start + limit).map(this.mapBreed);

      const result = { page, limit, total, items: pageItems };
      this.cache.set(cacheKey, result);
      return result;
    } catch (err) {
      this.logger.error('Error fetching breeds', err?.message);
      throw new Error('Failed to fetch breeds');
    }
  }

  async getBreedById(id: string) {
    const cacheKey = `breed:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const res = await this.axiosInstance.get('/breeds');
    const breed = res.data.find((b) => String(b.id) === id);
    if (!breed) throw new Error('Breed not found');
    const mapped = this.mapBreed(breed);
    this.cache.set(cacheKey, mapped);
    return mapped;
  }

  private mapBreed(b: any) {
    const imageUrl = b.image?.url
      ? b.image.url
      : b.reference_image_id
      ? `https://cdn2.thedogapi.com/images/${b.reference_image_id}.jpg`
      : null;
  
    return {
      id: b.id,
      name: b.name,
      origin: b.origin || b.country_code || 'Inconnu',
      height: b.height?.metric || 'N/A',
      life_span: b.life_span || 'N/A',
      temperament: b.temperament || 'N/A',
      image: imageUrl,
    };
  }
  
  
}
