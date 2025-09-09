import { Test, TestingModule } from '@nestjs/testing';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { DicomModality } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

const mockExamsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ExamsController', () => {
  let controller: ExamsController;
  let service: ExamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        {
          provide: ExamsService,
          useValue: mockExamsService,
        },
      ],
    }).compile();

    controller = module.get<ExamsController>(ExamsController);
    service = module.get<ExamsService>(ExamsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateExamDto = {
      patientId: 'patient-1',
      idempotencyKey: 'key-1',
      modality: DicomModality.CT,
      examDate: new Date(),
    };

    it('should return a new exam with a custom status code field when isNew is true', async () => {
      const newExamResult = {
        exam: { id: 'exam-1', ...createDto },
        isNew: true,
      };
      mockExamsService.create.mockResolvedValue(newExamResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        statusCde: HttpStatus.CREATED,
        ...newExamResult.exam,
      });
    });

    it('should return an existing exam when isNew is false', async () => {
      const existingExamResult = {
        exam: { id: 'exam-1', ...createDto },
        isNew: false,
      };
      mockExamsService.create.mockResolvedValue(existingExamResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(existingExamResult.exam);
    });
  });

  describe('findAll', () => {
    it('should call the service to find all exams with given parameters', async () => {
      const page = 1,
        pageSize = 10,
        patientId = 'patient-1';
      const expectedResult = { data: [], total: 0 };
      mockExamsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(page, pageSize, patientId);

      expect(service.findAll).toHaveBeenCalledWith(page, pageSize, patientId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call the service to find a single exam by id', async () => {
      const examId = 'exam-1';
      const expectedExam = { id: examId, modality: DicomModality.MR };
      mockExamsService.findOne.mockResolvedValue(expectedExam);

      const result = await controller.findOne(examId);

      expect(service.findOne).toHaveBeenCalledWith(examId);
      expect(result).toEqual(expectedExam);
    });
  });

  describe('update', () => {
    it('should call the service to update an exam', async () => {
      const examId = 'exam-1';
      const updateDto: UpdateExamDto = { modality: DicomModality.US };
      const updatedExam = { id: examId, ...updateDto };
      mockExamsService.update.mockResolvedValue(updatedExam);

      const result = await controller.update(examId, updateDto);

      expect(service.update).toHaveBeenCalledWith(examId, updateDto);
      expect(result).toEqual(updatedExam);
    });
  });

  describe('remove', () => {
    it('should call the service to remove an exam', async () => {
      const examId = 'exam-1';
      const expectedResponse = { message: 'Exam deleted' };
      mockExamsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(examId);

      expect(service.remove).toHaveBeenCalledWith(examId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
