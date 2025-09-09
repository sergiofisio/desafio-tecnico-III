import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { DocumentType } from '@prisma/client';
import { UpdatePatientDto } from './dto/update-patient.dto';

const mockPatientsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient by calling the service', async () => {
      const createDto: CreatePatientDto = {
        name: 'John Doe',
        birthDate: new Date(),
        documents: [{ type: DocumentType.CPF, document: '123' }],
      };
      const expectedPatient = { id: 'patient-id-1', ...createDto };

      mockPatientsService.create.mockResolvedValue(expectedPatient);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedPatient);
    });
  });

  describe('findAll', () => {
    it('should find all patients by calling the service', async () => {
      const expectedResult = { data: [], total: 0 };
      mockPatientsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should find a single patient by id', async () => {
      const patientId = 'patient-id-1';
      const expectedPatient = { id: patientId, name: 'John Doe' };
      mockPatientsService.findOne.mockResolvedValue(expectedPatient);

      const result = await controller.findOne(patientId);

      expect(service.findOne).toHaveBeenCalledWith(patientId);
      expect(result).toEqual(expectedPatient);
    });
  });

  describe('update', () => {
    it('should update a patient by calling the service', async () => {
      const patientId = 'patient-id-1';
      const updateDto: UpdatePatientDto = { name: 'John Doe Updated' };
      const updatedPatient = { id: patientId, name: 'John Doe Updated' };
      mockPatientsService.update.mockResolvedValue(updatedPatient);

      const result = await controller.update(patientId, updateDto);

      expect(service.update).toHaveBeenCalledWith(patientId, updateDto);
      expect(result).toEqual(updatedPatient);
    });
  });

  describe('remove', () => {
    it('should remove a patient by calling the service', async () => {
      const patientId = 'patient-id-1';
      const expectedResponse = { message: 'Patient deleted' };
      mockPatientsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(patientId);

      expect(service.remove).toHaveBeenCalledWith(patientId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
