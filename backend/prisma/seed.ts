import {
  PrismaClient,
  DicomModality,
  DocumentType,
  Prisma,
} from '@prisma/client';
import { Faker, pt_BR } from '@faker-js/faker';

const prisma = new PrismaClient();
const faker = new Faker({ locale: [pt_BR] });

async function main() {
  console.log('Iniciando o processo de seed...');

  console.log('Limpando dados antigos...');
  await prisma.exam.deleteMany();
  await prisma.document.deleteMany();
  await prisma.patient.deleteMany();

  console.log('Criando 50 pacientes...');
  for (let i = 0; i < 50; i++) {
    const patientBirthDate = faker.date.past({
      years: 80,
      refDate: '2005-01-01',
    });

    const examsToCreate: Prisma.ExamCreateWithoutPatientInput[] = [];
    const modalities = Object.values(DicomModality);

    for (const modality of modalities) {
      for (let j = 0; j < 3; j++) {
        examsToCreate.push({
          modality: modality,
          examDate: faker.date.between({
            from: patientBirthDate,
            to: new Date(),
          }),
          idempotencyKey: faker.string.uuid(),
        });
      }
    }

    await prisma.patient.create({
      data: {
        name: faker.person.fullName(),
        birthDate: patientBirthDate,
        documents: {
          create: [
            {
              type: DocumentType.CPF,
              document: faker.string.numeric(11),
            },
            {
              type: DocumentType.RG,
              document: faker.string.numeric(9),
            },
          ],
        },
        exams: {
          create: examsToCreate,
        },
      },
    });
  }

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
