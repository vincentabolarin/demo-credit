import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  size?: number;

  @ApiPropertyOptional({
    description: 'Search term first name, last name or email',
    example: 'vincent',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
