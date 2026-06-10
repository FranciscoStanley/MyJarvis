import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'tony@stark.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Tony Stark' })
  @IsString()
  @MinLength(2)
  name!: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'tony@stark.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}
