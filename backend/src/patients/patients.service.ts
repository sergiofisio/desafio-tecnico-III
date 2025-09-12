import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Prisma } from '@prisma/client';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const { documents, ...patientData } = createPatientDto;

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
          ...patientData,
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
        orderBy: { name: 'asc' },
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

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!patient) {
      throw new NotFoundException(`Paciente não encontrado`);
    }
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const { documents, ...patientData } = updatePatientDto;

    return this.prisma.$transaction(async (tx) => {
      const patientExists = await tx.patient.findUnique({ where: { id } });
      if (!patientExists) {
        throw new NotFoundException(`Paciente não encontrado`);
      }

      if (Object.keys(patientData).length > 0) {
        await tx.patient.update({
          where: { id },
          data: patientData,
        });
      }

      if (documents) {
        for (const doc of documents) {
          if (doc.id) {
            await tx.document.update({
              where: { id: doc.id },
              data: {
                type: doc.type,
                document: doc.document,
                other: doc.other,
              },
            });
          } else {
            await tx.document.create({
              data: {
                patientId: id,
                type: doc.type,
                document: doc.document,
                other: doc.other,
              },
            });
          }
        }
      }

      return tx.patient.findUnique({
        where: { id },
        include: { documents: true },
      });
    });
  }

  async remove(id: string) {
    const { name } = await this.findOne(id);

    await this.prisma.patient.delete({
      where: { id },
    });

    return { message: `Paciente ${name} deletado com sucesso` };
  }
}
