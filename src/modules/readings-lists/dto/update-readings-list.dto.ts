import { PartialType } from '@nestjs/swagger'
import { CreateReadingsListDto } from './create-readings-list.dto'

export class UpdateReadingsListDto extends PartialType(CreateReadingsListDto) {}
