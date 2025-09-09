import { DocumentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsOptional()
  other?: string;
}
