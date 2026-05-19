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
import { Session } from '../../schemas/session.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface SerializedUser {
  _id: string;
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
  isActive: boolean;
}

function serializeUser(user: {
  _id: { toString: () => string };
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
  isActive: boolean;
}): SerializedUser {
  return {
    _id: user._id.toString(),
    username: user.username,
    name: user.name,
    surname: user.surname,
    patronymic: user.patronymic,
    role: user.role,
    isActive: user.isActive,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private auditLogService: AuditLogService,
  ) {}

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
          isActive: boolean;
        }[]
      >()
      .exec();
    return users.map((u) => serializeUser(u));
  }

  async getUserById(id: string): Promise<SerializedUser | null> {
    const user = await this.userModel
      .findById(id)
      .lean<{
        _id: { toString: () => string };
        username: string;
        name: string;
        surname?: string;
        patronymic?: string;
        role: string;
        isActive: boolean;
      }>()
      .exec();
    if (!user) return null;
    return serializeUser(user);
  }

  async createUser(data: {
    username: string;
    password: string;
    name: string;
    surname?: string;
    patronymic?: string;
    role?: string;
  }, userId?: string): Promise<SerializedUser> {
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

    if (userId) {
      await this.auditLogService.createLog(
        userId,
        'Создание пользователя',
        `Пользователь: ${newUser.name} (@${newUser.username}), Роль: ${newUser.role}`,
        { entityType: 'user', entityId: newUser._id.toString() },
      );
    }

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
    userId?: string,
  ): Promise<SerializedUser> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const changes: string[] = [];
    if (data.name && data.name !== user.name) changes.push(`Имя: ${user.name} → ${data.name}`);
    if (data.username && data.username !== user.username) changes.push(`Логин: ${user.username} → ${data.username}`);
    if (data.role && data.role !== user.role) changes.push(`Роль: ${user.role} → ${data.role}`);

    const updated = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean<{
        _id: { toString: () => string };
        username: string;
        name: string;
        surname?: string;
        patronymic?: string;
        role: string;
        isActive: boolean;
      }>()
      .exec();

    if (!updated) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (userId && changes.length > 0) {
      await this.auditLogService.createLog(
        userId,
        'Обновление пользователя',
        `Пользователь: ${updated.name} (@${updated.username}), Изменения: ${changes.join(', ')}`,
        {
          entityType: 'user',
          entityId: id,
        },
      );
    }

    return serializeUser(updated);
  }

  async deleteUser(id: string, currentUserId: string): Promise<SerializedUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('Нельзя удалить самого себя');
    }

    const userToDelete = await this.userModel.findById(id);
    if (!userToDelete) {
      throw new NotFoundException('Пользователь не найден');
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
        isActive: boolean;
      }>()
      .exec();

    if (!deleted) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.auditLogService.createLog(
      currentUserId,
      'Удаление пользователя',
      `Пользователь: ${userToDelete.name} (@${userToDelete.username})`,
      { entityType: 'user', entityId: id },
    );

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

    await this.auditLogService.createLog(
      userId,
      'Изменение пароля',
      `Пользователь ${user.name} (@${user.username}) изменил пароль`,
      { entityType: 'user', entityId: userId },
    );
  }

  async toggleBlock(id: string, currentUserId: string): Promise<SerializedUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('Нельзя заблокировать самого себя');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'Разблокировка' : 'Блокировка';
    await this.auditLogService.createLog(
      currentUserId,
      `${action} пользователя`,
      `Пользователь: ${user.name} (@${user.username}) — ${user.isActive ? 'разблокирован' : 'заблокирован'}`,
      { entityType: 'user', entityId: id },
    );

    return serializeUser(user);
  }

  async logoutAllSessions(id: string, currentUserId: string): Promise<{ count: number }> {
    const isSelf = id === currentUserId;

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const result = await this.sessionModel.deleteMany({ userId: user._id });

    if (!isSelf) {
      await this.auditLogService.createLog(
        currentUserId,
        'Принудительный выход',
        `Все сессии пользователя ${user.name} (@${user.username}) завершены (${result.deletedCount} шт.)`,
        { entityType: 'user', entityId: id },
      );
    }

    return { count: result.deletedCount };
  }
}
