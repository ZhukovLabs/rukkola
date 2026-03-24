import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LunchesController } from './lunches.controller';
import { LunchesService } from './lunches.service';
import { Lunch, LunchSchema } from '../../schemas/lunch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lunch.name, schema: LunchSchema }]),
  ],
  controllers: [LunchesController],
  providers: [LunchesService],
  exports: [LunchesService],
})
export class LunchesModule {}
