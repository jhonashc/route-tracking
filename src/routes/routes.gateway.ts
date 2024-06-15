import { WebSocketGateway } from '@nestjs/websockets';

import { RoutesService } from './routes.service';

@WebSocketGateway()
export class RoutesGateway {
  constructor(private readonly routesService: RoutesService) {}
}
