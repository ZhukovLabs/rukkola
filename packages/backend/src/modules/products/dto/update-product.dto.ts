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
  MinLength,
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

export class ProductTagUpdateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(12)
  text!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;
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

  @IsBoolean()
  @IsOptional()
  removeImage?: boolean;

  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ProductTagUpdateDto)
  @IsOptional()
  tags?: ProductTagUpdateDto[];
}
