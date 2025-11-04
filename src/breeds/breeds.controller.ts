import { Controller, Get, Query, Param } from '@nestjs/common';
import { BreedsService } from './breeds.service';

@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  //liste paginée avec recherche
  @Get()
  getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
  ) {
    return this.breedsService.getBreeds(+page, +limit, search);
  }

  //détails d’une race
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.breedsService.getBreedById(id);
  }
}
