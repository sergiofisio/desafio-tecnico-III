import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatienntDto: CreatePatientDto) {
    const { documents, ...patient } = createPatienntDto;

    const documentNumbers = documents.map((doc) => doc.document);

    const existingDocuments = await this.prisma.document.findMany({
      where: {
        document: { in: documentNumbers },
      },
    });

    if (existingDocuments.length > 0) {
      const duplicated = existingDocuments
        .map((doc) => doc.document)
        .join(', ');
      throw new ConflictException(`Documentos ja registrados: ${duplicated}`);
    }

    try {
      return await this.prisma.patient.create({
        data: {
          ...patient,
          documents: {
            create: documents,
          },
        },
        include: {
          documents: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Um documento digitado ja exite no sistema',
        );
      }
      throw new InternalServerErrorException(
        'Paciente não for criado. Por favor entre em contato com o Suporte',
      );
    }
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        skip,
        take,
        orderBy: { name: 'desc' },
        include: {
          documents: true,
        },
      }),
      this.prisma.patient.count(),
    ]);
    return {
      data: patients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
