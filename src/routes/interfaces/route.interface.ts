import { ConnectedUser } from '../../common/interfaces';

export interface Route {
  id: string;
  host?: ConnectedUser;
  spectators: ConnectedUser[];
}
