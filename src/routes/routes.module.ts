import { Module } from '@nestjs/common';

import { RoutesGateway } from './routes.gateway';
import { RoutesService } from './routes.service';

@Module({
  providers: [RoutesGateway, RoutesService],
})
export class RoutesModule {}
