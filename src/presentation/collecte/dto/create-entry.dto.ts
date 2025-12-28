import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryItemDto } from './entry-item.dto';

export class CreateEntryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryItemDto)
  items: EntryItemDto[];
}
