import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../../schemas/user.schema';

export interface SerializedUser {
  _id: string;
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
}

function serializeUser(user: {
  _id: { toString: () => string };
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
}): SerializedUser {
  return {
    _id: user._id.toString(),
    username: user.username,
    name: user.name,
    surname: user.surname,
    patronymic: user.patronymic,
    role: user.role,
  };
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUsers(): Promise<SerializedUser[]> {
    const users = await this.userModel
      .find()
      .lean<
        {
          _id: { toString: () => string };
          username: string;
          name: string;
          surname?: string;
          patronymic?: string;
          role: string;
        }[]
      >()
      .exec();
    return users.map((u) => serializeUser(u));
  }

  async createUser(data: {
    username: string;
    password: string;
    name: string;
    surname?: string;
    patronymic?: string;
    role?: string;
  }): Promise<SerializedUser> {
    const existing = await this.userModel.findOne({ username: data.username });
    if (existing) {
      throw new BadRequestException('Пользователь с таким логином уже существует');
    }

    const newUser = new this.userModel({
      username: data.username,
      password: data.password,
      name: data.name,
      surname: data.surname || '',
      patronymic: data.patronymic || '',
      role: data.role || 'moderator',
    });

    await newUser.save();

    return serializeUser(newUser);
  }

  async updateUser(
    id: string,
    data: Partial<{
      username: string;
      name: string;
      surname?: string;
      patronymic?: string;
      role: string;
    }>,
  ): Promise<SerializedUser> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean<{
        _id: { toString: () => string };
        username: string;
        name: string;
        surname?: string;
        patronymic?: string;
        role: string;
      }>()
      .exec();

    if (!updated) {
      throw new NotFoundException('Пользователь не найден');
    }

    return serializeUser(updated);
  }

  async deleteUser(id: string, currentUserId: string): Promise<SerializedUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('Нельзя удалить самого себя');
    }

    const deleted = await this.userModel
      .findByIdAndDelete(id)
      .lean<{
        _id: { toString: () => string };
        username: string;
        name: string;
        surname?: string;
        patronymic?: string;
        role: string;
      }>()
      .exec();

    if (!deleted) {
      throw new NotFoundException('Пользователь не найден');
    }

    return serializeUser(deleted);
  }

  async updatePassword(
    userId: string,
    currentUserId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (userId !== currentUserId) {
      throw new ForbiddenException('Можно изменить пароль только для себя');
    }

    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('Пользователь не найден');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new BadRequestException('Неверный текущий пароль');

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();
  }
}
