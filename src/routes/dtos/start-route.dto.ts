import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { LocationDto, UserDto } from '../../common/dtos';

export class StartRouteDto {
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
