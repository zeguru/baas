import { Controller, Get } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('version')
  getVersion() {
    return {
      version: this.metaService.getVersion(),
    };
  }
}
