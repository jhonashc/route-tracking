import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  latLng: [number, number];

  @IsNotEmpty()
  @IsNumber()
  accuracy: number;
}
