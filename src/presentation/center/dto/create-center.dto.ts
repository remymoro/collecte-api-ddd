import {
  IsNotEmpty,
  IsPostalCode,
  IsString,
  Length,
} from 'class-validator';

export class CreateCenterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  address!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city!: string;

  @IsPostalCode('FR')
  postalCode!: string;
}
