import { ConnectedUser } from '../../common/interfaces';

export interface Route {
  id: string;
  host?: ConnectedUser;
  users: ConnectedUser[];
}
