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

import { LocationUpdateDto, StartRouteDto, UserJoinDto } from './dtos';

import { RouteEvent } from './enums';

import { RoutesService } from './routes.service';

@WebSocketGateway({ cors: true, namespace: 'routes' })
export class RoutesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly routesService: RoutesService) {}

  handleConnection(client: Socket): void {
    console.log(`Connected client ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Disconnected client ${client.id}`);
    this.routesService.handleDisconnection(client.id);
  }

  @SubscribeMessage(RouteEvent.JOIN_USER)
  handleUserJoinToRoute(
    @MessageBody() userJoinDto: UserJoinDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { routeId, user } = userJoinDto;

    const route = this.routesService.addUserToRoute(routeId, {
      ...user,
      socket: client,
    });

    // Create the route room name
    const routeRoom = `route-${route.id}`;

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
        route.host.socket.emit(selectedRouteEvent, userJoinDto);

        // Notifiy Notify the driver with all connected users
        route.host.socket.emit(
          RouteEvent.GET_CONNECTED_USERS,
          this.routesService.getUsersByRouteId(route.id),
        );
      }
    }
  }

  @SubscribeMessage(RouteEvent.START_ROUTE)
  handleStartRoute(
    @MessageBody() startRouteDto: StartRouteDto,
    @ConnectedSocket() client: Socket,
  ): void {
    // Create the route room name
    const routeRoom = `route-${startRouteDto.routeId}`;

    // Notifies all students and spectators in the room that the route has started
    client.broadcast
      .to(routeRoom)
      .emit(RouteEvent.ROUTE_STARTED, startRouteDto);
  }

  @SubscribeMessage(RouteEvent.LOCATION_UPDATE)
  handleLocationUpdate(
    @MessageBody() locationUpdateDto: LocationUpdateDto,
    @ConnectedSocket() client: Socket,
  ): void {
    // Create the route room name
    const routeRoom = `route-${locationUpdateDto.routeId}`;

    // Notify all students and spectators in the room that the route has updated its location
    client.broadcast
      .to(routeRoom)
      .emit(RouteEvent.BROADCAST_LOCATION, locationUpdateDto);
  }
}
