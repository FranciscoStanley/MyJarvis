import { IsEmail, IsString, MinLength, MaxLength, IsEnum, Matches, IsBoolean, Equals } from 'class-validator';
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
  @ApiProperty({ description: 'Aceite obrigatório dos Termos de Uso e Política de Privacidade' })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' })
  acceptTerms!: boolean;
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

export class AcceptTermsRequestDto {
  @ApiProperty({ description: 'Confirmação de leitura e aceite dos termos vigentes' })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' })
  acceptTerms!: boolean;
}