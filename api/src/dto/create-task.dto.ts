import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsEnum(['high', 'medium', 'low'])
  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  priority: 'high' | 'medium' | 'low';
}