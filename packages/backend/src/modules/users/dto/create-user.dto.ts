import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[a-zA-Z]+$/, { message: 'Логин: только английские буквы' })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?=.*[^a-zA-Zа-яА-Я0-9]).{6,}$/, {
    message: 'Пароль: минимум 6 символов, 1 большая буква, 1 маленькая буква, 1 спецсимвол',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  surname?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  patronymic?: string;

  @IsString()
  @IsIn(['admin', 'moderator'], { message: 'Роль: moderator или admin' })
  role?: string;
}