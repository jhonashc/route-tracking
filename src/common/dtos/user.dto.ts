import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UserType } from '../enums';

export class UserDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserType)
  type: UserType;
}
