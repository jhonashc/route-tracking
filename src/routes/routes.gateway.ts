import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { UserType } from '../common/enums';

import { UserJoinDto } from './dtos';

import { RouteEvent } from './enums';

import { RoutesService } from './routes.service';

@WebSocketGateway({ cors: true, namespace: 'routes' })
export class RoutesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly routesService: RoutesService) {}

  handleConnection(client: Socket) {
    console.log(`Connected client ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected client ${client.id}`);
  }

  @SubscribeMessage(RouteEvent.JOIN_USER)
  handleUserJoinToRoute(
    @MessageBody() userJoinDto: UserJoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { routeId, user } = userJoinDto;

    const route = this.routesService.addUserToRoute(routeId, {
      ...user,
      socket: client,
    });

    // Create the route room name
    const routeRoom: string = `route-${route.id}`;

    // Join the user to the route room
    client.join(routeRoom);

    if (user.type === UserType.DRIVER) {
      // Notify everyone in the route room that the driver joined
      client.broadcast
        .to(routeRoom)
        .emit(RouteEvent.DRIVER_JOINED, userJoinDto);
    } else {
      const selectedRouteEvent =
        user.type === UserType.STUDENT
          ? RouteEvent.STUDENT_JOINED
          : RouteEvent.SPECTATOR_JOINED;

      if (route.host) {
        // Notify the driver in the route room that the student or spectator has joined
        route.host.socket.broadcast
          .to(routeRoom)
          .emit(selectedRouteEvent, userJoinDto);
      }
    }
  }
}
