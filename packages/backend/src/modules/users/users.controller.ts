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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

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
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.createUser(dto, currentUser.id);
    return {
      success: true,
      message: 'Пользователь создан',
      data: user,
    };
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    await this.usersService.updatePassword(
      id,
      currentUser.id,
      dto.oldPassword,
      dto.newPassword,
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
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.updateUser(id, dto, currentUser.id);
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

  @Patch(':id/toggle-block')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async toggleBlock(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.toggleBlock(id, currentUser.id);
    return {
      success: true,
      message: user.isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
      data: user,
    };
  }

  @Post(':id/logout-sessions')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async logoutAllSessions(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    const result = await this.usersService.logoutAllSessions(id, currentUser.id);
    return {
      success: true,
      message: `Завершено сессий: ${result.count}`,
      data: result,
    };
  }
}
