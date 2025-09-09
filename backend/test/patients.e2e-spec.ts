import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DocumentType } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdPatientId: string;
  let createdDocumentId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /patients', () => {
    it('should reject with 400 on invalid data', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Incomplete Patient' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a new patient successfully', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          name: 'John Doe',
          birthDate: '1990-01-15T00:00:00.000Z',
          documents: [{ type: DocumentType.CPF, document: '12345678900' }],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toEqual('John Doe');
          expect(response.body.documents[0].document).toEqual('12345678900');
          createdPatientId = response.body.id;
          createdDocumentId = response.body.documents[0].id;
        });
    });

    it('should reject with 409 when document is duplicated', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          name: 'Jane Doe',
          birthDate: '1992-05-20T00:00:00.000Z',
          documents: [{ type: DocumentType.CPF, document: '12345678900' }],
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /patients', () => {
    it('should return a paginated list of patients', () => {
      return request(app.getHttpServer())
        .get('/patients?page=1&pageSize=5')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body.total).toBeGreaterThanOrEqual(1);

          const returnedIds = response.body.data.map((p) => p.id);
          expect(returnedIds).toContain(createdPatientId);
        });
    });
  });

  describe('GET /patients/:id', () => {
    it('should return a single patient by id', () => {
      return request(app.getHttpServer())
        .get(`/patients/${createdPatientId}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.id).toEqual(createdPatientId);
          expect(response.body.name).toEqual('John Doe');
        });
    });
  });

  describe('PATCH /patients/:id', () => {
    it('should update a patient name', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${createdPatientId}`)
        .send({ name: 'John Doe Updated' })
        .expect(HttpStatus.OK);

      expect(response.body.name).toEqual('John Doe Updated');
    });

    it('should add a new document to the patient', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${createdPatientId}`)
        .send({
          documents: [{ type: DocumentType.RG, document: '11223344-5' }],
        })
        .expect(HttpStatus.OK);

      expect(response.body.documents).toHaveLength(2);
      expect(response.body.documents.map((d) => d.document)).toContain(
        '11223344-5',
      );
    });

    it('should update an existing document of the patient', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${createdPatientId}`)
        .send({
          documents: [
            {
              id: createdDocumentId,
              type: DocumentType.CPF,
              document: '00000000000',
            },
          ],
        })
        .expect(HttpStatus.OK);

      expect(response.body.documents).toHaveLength(2);
      const updatedDoc = response.body.documents.find(
        (d) => d.id === createdDocumentId,
      );
      expect(updatedDoc.document).toEqual('00000000000');
    });
  });

  describe('DELETE /patients/:id', () => {
    it('should delete a patient and return 404 on subsequent get', async () => {
      await request(app.getHttpServer())
        .delete(`/patients/${createdPatientId}`)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get(`/patients/${createdPatientId}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
