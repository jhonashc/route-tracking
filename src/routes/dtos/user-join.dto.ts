import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserDto } from '../../common/dtos';

export class UserJoinDto {
  @IsUUID()
  @IsNotEmpty()
  routeId: string;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}
