import { DicomModality } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsEnum(DicomModality)
  @IsNotEmpty()
  modality: DicomModality;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  examDate: Date;
}
