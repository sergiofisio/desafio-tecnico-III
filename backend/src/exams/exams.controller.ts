import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body(new ValidationPipe()) createExamDto: CreateExamDto) {
    const { exam, isNew } = await this.examsService.create(createExamDto);

    if (isNew) return { statusCde: HttpStatus.CREATED, ...exam };

    return exam;
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('patientId', new DefaultValuePipe(10), ParseIntPipe)
    patientId: string,
  ) {
    return this.examsService.findAll(page, pageSize, patientId);
  }
}
