import { IsEmail, IsString, MinLength, MaxLength, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE } from '@myjarvis/shared';

export class RegisterRequestDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_MESSAGE })
  password!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name!: string;
}

export class LoginRequestDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) password!: string;
}

export class LdapLoginRequestDto {
  @ApiProperty({ example: 'jdoe' }) @IsString() @MinLength(1) @MaxLength(256) username!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) password!: string;
}

export class AssignRoleRequestDto {
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole) role!: UserRole;
}
