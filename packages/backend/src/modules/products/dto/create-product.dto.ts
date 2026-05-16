import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PortionPriceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  size!: string;

  @IsNumber()
  @Min(0.01)
  price!: number;
}

export class ProductTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(12)
  text!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;
}

export class CreateProductDto {
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
  @Type(() => PortionPriceDto)
  prices!: PortionPriceDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsBoolean()
  @IsOptional()
  isAlcohol?: boolean;

  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ProductTagDto)
  @IsOptional()
  tags?: ProductTagDto[];
}
