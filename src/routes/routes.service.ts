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
      route = { id: routeId, host: undefined, users: [] };

      if (newUser.type === UserType.DRIVER) {
        route.host = newUser;
      } else {
        route.users.push(newUser);
      }

      this.activeRoutes.set(routeId, route);
    } else {
      if (newUser.type === UserType.DRIVER) {
        if (route.host?.id === newUser.id) {
          route.host.socket.disconnect();
          route.host = newUser;
        }
      } else {
        const userIndex = route.users.findIndex(
          (user) => user.id === newUser.id,
        );

        if (userIndex !== -1) {
          route.users[userIndex].socket.disconnect();
          route.users.splice(userIndex, 1);
        }

        route.users.push(newUser);
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
