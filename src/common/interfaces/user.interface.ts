import { Socket } from 'socket.io';

import { UserType } from '../enums';

export interface User {
  id: string;
  name: string;
  type: UserType;
}

export interface ConnectedUser extends User {
  socket: Socket;
}
