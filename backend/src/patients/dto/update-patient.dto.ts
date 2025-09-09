import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateDocumentDto } from './update-document.dto';

const BaseUpdatePatientDto = OmitType(CreatePatientDto, ['documents'] as const);

export class UpdatePatientDto extends PartialType(BaseUpdatePatientDto) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateDocumentDto)
  documents?: UpdateDocumentDto[];
}
