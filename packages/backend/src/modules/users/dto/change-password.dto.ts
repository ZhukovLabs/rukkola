import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?=.*[^a-zA-Zа-яА-Я0-9]).{6,}$/, {
    message: 'Пароль: минимум 6 символов, 1 большая буква, 1 маленькая буква, 1 спецсимвол',
  })
  newPassword!: string;
}