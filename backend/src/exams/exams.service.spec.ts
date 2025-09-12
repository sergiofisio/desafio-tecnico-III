import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { DicomModality } from '@prisma/client';

const mockPrismaService = {
  exam: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  patient: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (promises) => {
    const [findManyResult, countResult] = await Promise.all([
      promises[0],
      promises[1],
    ]);
    return [findManyResult, countResult];
  }),
};

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a single exam by id', async () => {
      const mockExam = { id: 'exam-id-1', modality: DicomModality.CT };
      mockPrismaService.exam.findUnique.mockResolvedValue(mockExam);

      const result = await service.findOne('exam-id-1');
      expect(result).toEqual(mockExam);
      expect(mockPrismaService.exam.findUnique).toHaveBeenCalledWith({
        where: { id: 'exam-id-1' },
        include: { patient: true },
      });
    });

    it('should throw NotFoundException if exam is not found', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all exams when no patientId is provided', async () => {
      const mockExams = [{ id: 'exam-1' }, { id: 'exam-2' }];
      mockPrismaService.exam.findMany.mockResolvedValue(mockExams);
      mockPrismaService.exam.count.mockResolvedValue(2);

      await service.findAll(1, 10);
      expect(mockPrismaService.exam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(mockPrismaService.exam.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('should find exams filtered by patientId when it is provided', async () => {
      const mockExams = [{ id: 'exam-1', patientId: 'patient-123' }];
      mockPrismaService.exam.findMany.mockResolvedValue(mockExams);
      mockPrismaService.exam.count.mockResolvedValue(1);

      await service.findAll(1, 10, 'patient-123');
      expect(mockPrismaService.exam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { patientId: 'patient-123' } }),
      );
      expect(mockPrismaService.exam.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { patientId: 'patient-123' } }),
      );
    });
  });

  describe('update', () => {
    it('should update an exam', async () => {
      const examId = 'exam-id-1';
      const updateDto = { modality: DicomModality.MR };
      const existingExam = { id: examId, modality: DicomModality.CT };
      const updatedExam = { ...existingExam, ...updateDto };

      mockPrismaService.exam.findUnique.mockResolvedValue(existingExam);
      mockPrismaService.exam.update.mockResolvedValue(updatedExam);

      const result = await service.update(examId, updateDto);

      expect(result).toEqual(updatedExam);
      expect(mockPrismaService.exam.findUnique).toHaveBeenCalledWith({
        where: { id: examId },
        include: { patient: true },
      });
      expect(mockPrismaService.exam.update).toHaveBeenCalledWith({
        where: { id: examId },
        data: updateDto,
      });
    });
  });
});
