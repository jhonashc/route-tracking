import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserDto } from './user.dto';
import { LocationDto } from './location.dto';

export class LocationRouteDto {
  @IsUUID()
  @IsNotEmpty()
  routeId: string;

  @ValidateNested()
  @Type(() => UserDto)
  driver: UserDto;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
