import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PortionPriceUpdateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  size!: string;

  @IsNumber()
  @Min(0.01)
  price!: number;
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PortionPriceUpdateDto)
  prices!: PortionPriceUpdateDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsBoolean()
  hidden!: boolean;

  @IsBoolean()
  isAlcohol!: boolean;
}
