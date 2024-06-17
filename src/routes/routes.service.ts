import { Injectable } from '@nestjs/common';

import { UserType } from '../common/enums';

import { ConnectedUser, User } from '../common/interfaces';

import { Route } from './interfaces';

@Injectable()
export class RoutesService {
  private activeRoutes: Map<string, Route> = new Map();

  addUserToRoute(routeId: string, newUser: ConnectedUser): Route {
    // Retrieve the route by ID, or create a new one if it doesn't exist
    const route = this.getRouteById(routeId) || {
      id: routeId,
      host: undefined,
      users: [],
    };

    if (newUser.type === UserType.DRIVER) {
      // If the new user is a driver
      if (route.host) {
        if (route.host.id === newUser.id) {
          // If the current driver is the same, disconnect the current driver's socket
          route.host.socket.disconnect();
        }
      }
      // Assign the new driver
      route.host = newUser;
    } else {
      // If the new user is a student or spectator
      const existingUserIndex = route.users.findIndex(
        (user) => user.id === newUser.id,
      );

      if (existingUserIndex !== -1) {
        // Disconnect the existing student's or spectator's socket
        route.users[existingUserIndex].socket.disconnect();
        // Remove the existing student or spectator
        route.users.splice(existingUserIndex, 1);
      }

      // Add the new student or spectator
      route.users.push(newUser);
    }

    // Save the updated route
    this.activeRoutes.set(routeId, route);

    // TODO: This is temporary
    console.log(
      'Current active routes',
      Array.from(this.activeRoutes.values()),
    );

    return route;
  }

  getRouteById(routeId: string): Route | undefined {
    return this.activeRoutes.get(routeId);
  }

  // TODO: Create a mapper
  getUsersByRouteId(routeId: string): User[] | undefined {
    return this.getRouteById(routeId)?.users.map((user) => ({
      id: user.id,
      name: user.name,
      type: user.type,
    }));
  }

  handleDisconnection(socketId: string): void {
    for (const [routeId, route] of this.activeRoutes.entries()) {
      // If the disconnected socket belongs to the host
      if (route.host?.socket.id === socketId) {
        route.host = undefined;
      } else {
        // If the disconnected socket belongs to a user
        const userIndex = route.users.findIndex(
          (user) => user.socket.id === socketId,
        );

        if (userIndex !== -1) {
          route.users.splice(userIndex, 1);
        }
      }

      // If there is no host and no users, delete the route
      if (!route.host && route.users.length === 0) {
        this.activeRoutes.delete(routeId);
      }
    }

    // TODO: This is a temporary log
    console.log(
      'Current active routes',
      Array.from(this.activeRoutes.values()),
    );
  }
}
