import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';

const mockPrismaService = {
  patient: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  document: {
    findMany: jest.fn(),
  },
  $transaction: jest
    .fn()
    .mockImplementation((callback) => callback(mockPrismaService)),
};

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient with documents', async () => {
      const createPatientDto = {
        name: 'John Doe',
        birthDate: new Date(),
        documents: [{ type: DocumentType.CPF, document: '123' }],
      };
      const expectedPatient = { id: 'some-cuid', ...createPatientDto };

      mockPrismaService.document.findMany.mockResolvedValue([]);
      mockPrismaService.patient.create.mockResolvedValue(expectedPatient);

      const result = await service.create(createPatientDto);
      expect(result).toEqual(expectedPatient);
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { document: { in: ['123'] } },
      });
      expect(mockPrismaService.patient.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if a document already exists', async () => {
      const createPatientDto = {
        name: 'Jane Doe',
        birthDate: new Date(),
        documents: [{ type: DocumentType.CPF, document: '456' }],
      };
      mockPrismaService.document.findMany.mockResolvedValue([
        { id: 'doc-id', document: '456' },
      ]);
      await expect(service.create(createPatientDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single patient', async () => {
      const patient = { id: '1', name: 'John Doe' };
      mockPrismaService.patient.findUnique.mockResolvedValue(patient);
      const result = await service.findOne('1');
      expect(result).toEqual(patient);
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
