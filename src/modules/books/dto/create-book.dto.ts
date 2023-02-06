import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from "class-validator";
import { transformArray } from "~common/constants";

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNumber()
  yearOfPublication: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty()
  @Transform(transformArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  authors: string[];

  @ApiProperty()
  @Transform(transformArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  genres: string[];

  @ApiPropertyOptional()
  @IsString()
  @Length(10, 5000)
  description: string;
}
