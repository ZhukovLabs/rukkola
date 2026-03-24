import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { LunchesService } from './lunches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('lunches')
export class LunchesController {
  constructor(private lunchesService: LunchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    const lunches = await this.lunchesService.getAllLunches();
    return {
      success: true,
      message: 'Список обедов получен',
      data: lunches,
    };
  }

  // Public image serving - no auth required
  @Get('image/:filename')
  async serveImage(
    @Param('filename') filename: string,
    @Query('w') width: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const parsedWidth = width ? parseInt(width, 10) : undefined;
      if (width && isNaN(parsedWidth as number)) {
        return res.status(400).json({ success: false, message: 'Некорректная ширина' });
      }

      const result = await this.lunchesService.serveImage(filename, parsedWidth);
      res.set({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      });
      return res.send(result.buffer);
    } catch (error) {
      const status = error instanceof NotFoundException ? 404 : 500;
      const message = error instanceof Error ? error.message : 'Ошибка сервера';
      if (!res.headersSent) {
        return res.status(status).json({ success: false, message });
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.lunchesService.uploadLunch(file);
    return {
      success: true,
      message: 'Обед загружен',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const result = await this.lunchesService.activateLunch(id);
    return {
      success: true,
      message: 'Обед активирован',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('deactivate')
  async deactivate() {
    const result = await this.lunchesService.deactivateAll();
    return {
      success: true,
      message: 'Все обеды деактивированы',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.lunchesService.deleteLunch(id);
    return {
      success: true,
      message: 'Обед удалён',
      data: result,
    };
  }
}
