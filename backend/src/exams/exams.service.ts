import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { Prisma } from '@prisma/client';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    const existingExam = await this.prisma.exam.findUnique({
      where: {
        idempotencyKey: createExamDto.idempotencyKey,
      },
    });

    if (existingExam) return { exam: existingExam, isNew: false };

    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({
        where: {
          id: createExamDto.patientId,
        },
      });

      if (!patient) throw new NotFoundException('Paciente não encontrado');

      try {
        const newExam = await tx.exam.create({
          data: createExamDto,
        });

        return { exam: newExam, isNew: true };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          const conflictingExam = await this.prisma.exam.findUnique({
            where: { idempotencyKey: createExamDto.idempotencyKey },
          });
          return { exam: conflictingExam, isNew: false };
        }
        throw new InternalServerErrorException('Exame não criado');
      }
    });
  }

  async findAll(page: number, pageSize: number, patientId?: string) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const whereClause: Prisma.ExamWhereInput = {};
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const [exams, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        where: whereClause,
      }),
      this.prisma.exam.count({
        where: whereClause,
      }),
    ]);

    return {
      data: exams,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { patient: true },
    });
    if (!exam) {
      throw new NotFoundException(`Exame não encontrado`);
    }
    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    await this.findOne(id);
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.exam.delete({ where: { id } });
    return { message: `Exame Deletado com sucesso` };
  }
}
