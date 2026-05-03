import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  @Matches(/^[a-zA-Z]+$/, { message: 'Логин: только английские буквы' })
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  surname?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  patronymic?: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'moderator'], { message: 'Роль: moderator или admin' })
  role?: string;
}