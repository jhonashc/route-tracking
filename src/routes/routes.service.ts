import { Injectable } from '@nestjs/common';

import { UserType } from '../common/enums';

import { ConnectedUser } from '../common/interfaces';

import { Route } from './interfaces';

@Injectable()
export class RoutesService {
  private activeRoutes: Map<string, Route> = new Map();

  addUserToRoute(routeId: string, newUser: ConnectedUser): Route {
    let route = this.getRouteById(routeId);

    if (!route) {
      route = { id: routeId, host: undefined, spectators: [] };

      if (newUser.type === UserType.DRIVER) {
        route.host = newUser;
      } else {
        route.spectators.push(newUser);
      }

      this.activeRoutes.set(routeId, route);
    } else {
      if (newUser.type === UserType.DRIVER) {
        if (route.host?.id === newUser.id) {
          route.host.socket.disconnect();
          route.host = newUser;
        }
      } else {
        const spectatorIndex = route.spectators.findIndex(
          (spectator) => spectator.id === newUser.id,
        );

        if (spectatorIndex !== -1) {
          route.spectators[spectatorIndex].socket.disconnect();
          route.spectators.splice(spectatorIndex, 1);
        }

        route.spectators.push(newUser);
      }
    }

    // TODO: This is a temporary
    console.log(
      'Current active routes',
      Array.from(this.activeRoutes.values()),
    );

    return route;
  }

  getRouteById(routeId: string): Route | undefined {
    return this.activeRoutes.get(routeId);
  }
}
