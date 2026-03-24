import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LunchesModule } from './modules/lunches/lunches.module';
import { UsersModule } from './modules/users/users.module';
import { MenuModule } from './modules/menu/menu.module';
import { HealthModule } from './modules/health/health.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MinioModule } from './modules/minio/minio.module';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(ROOT_DIR, '.env.local'),
        path.join(ROOT_DIR, '.env'),
        '.env.local',
        '.env',
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        maxPoolSize: 20,
        minPoolSize: 5,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
      }),
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    LunchesModule,
    UsersModule,
    MenuModule,
    HealthModule,
    DashboardModule,
    MinioModule,
  ],
})
export class AppModule {}
