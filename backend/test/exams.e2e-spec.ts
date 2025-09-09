import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DicomModality, DocumentType } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('ExamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let patientId1: string;
  let patientId2: string;
  let createdExamId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.exam.deleteMany();
    await prisma.document.deleteMany();
    await prisma.patient.deleteMany();

    const patient1 = await prisma.patient.create({
      data: {
        name: 'Patient One',
        birthDate: new Date(),
        documents: { create: [{ type: DocumentType.OTHER, document: 'P1' }] },
      },
    });
    patientId1 = patient1.id;

    const patient2 = await prisma.patient.create({
      data: {
        name: 'Patient Two',
        birthDate: new Date(),
        documents: { create: [{ type: DocumentType.OTHER, document: 'P2' }] },
      },
    });
    patientId2 = patient2.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /exams', () => {
    it('should handle creation and idempotency correctly', async () => {
      const idempotencyKey = 'idempotency-key-e2e-post';
      const examPayload = {
        patientId: patientId1,
        idempotencyKey: idempotencyKey,
        modality: DicomModality.CT,
        examDate: new Date().toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/exams')
        .send(examPayload)
        .expect(HttpStatus.CREATED);

      expect(createResponse.body).toHaveProperty('id');
      createdExamId = createResponse.body.id;

      const idempotentResponse = await request(app.getHttpServer())
        .post('/exams')
        .send(examPayload)
        .expect(HttpStatus.OK);

      expect(idempotentResponse.body.id).toEqual(createdExamId);
    });
  });

  describe('GET /exams', () => {
    beforeAll(async () => {
      await prisma.exam.create({
        data: {
          patientId: patientId2,
          idempotencyKey: 'another-key',
          modality: DicomModality.MR,
          examDate: new Date(),
        },
      });
    });

    it('should get all exams when no patientId filter is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams')
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should get only exams for a specific patient when patientId filter is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams?patientId=${patientId1}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.data[0].patientId).toEqual(patientId1);
    });
  });

  describe('GET /exams/:id', () => {
    it('should get a single exam by its id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams/${createdExamId}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdExamId);
      expect(response.body.modality).toEqual(DicomModality.CT);
    });

    it('should return 404 for a non-existent exam id', () => {
      return request(app.getHttpServer())
        .get(`/exams/clxry892b00002gbv8q8j3o2o`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /exams/:id', () => {
    it('should update an exam', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/exams/${createdExamId}`)
        .send({ modality: DicomModality.US })
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdExamId);
      expect(response.body.modality).toEqual(DicomModality.US);
    });
  });

  describe('DELETE /exams/:id', () => {
    it('should delete an exam', async () => {
      await request(app.getHttpServer())
        .delete(`/exams/${createdExamId}`)
        .expect(HttpStatus.OK);

      // Verifica se o exame foi realmente deletado
      await request(app.getHttpServer())
        .get(`/exams/${createdExamId}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
