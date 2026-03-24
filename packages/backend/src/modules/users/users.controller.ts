import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUsers() {
    const users = await this.usersService.getUsers();
    return {
      success: true,
      message: 'OK',
      data: users,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createUser(
    @Body()
    body: {
      username: string;
      password: string;
      name: string;
      surname?: string;
      patronymic?: string;
      role?: string;
    },
  ) {
    const user = await this.usersService.createUser(body);
    return {
      success: true,
      message: 'Пользователь создан',
      data: user,
    };
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { oldPassword: string; newPassword: string },
    @CurrentUser() currentUser: { id: string },
  ) {
    await this.usersService.updatePassword(
      id,
      currentUser.id,
      body.oldPassword,
      body.newPassword,
    );
    return {
      success: true,
      message: 'Пароль успешно обновлён',
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      username: string;
      name: string;
      surname?: string;
      patronymic?: string;
      role: string;
    }>,
  ) {
    const user = await this.usersService.updateUser(id, body);
    return {
      success: true,
      message: 'Пользователь обновлён',
      data: user,
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.deleteUser(id, currentUser.id);
    return {
      success: true,
      message: 'Пользователь удалён',
      data: user,
    };
  }
}
