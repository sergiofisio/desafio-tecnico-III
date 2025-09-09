import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Response } from 'express';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createExamDto: CreateExamDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { exam, isNew } = await this.examsService.create(createExamDto);

    if (isNew) {
      res.status(HttpStatus.CREATED);
    } else {
      res.status(HttpStatus.OK);
    }

    return exam;
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('patientId') patientId?: string,
  ) {
    return this.examsService.findAll(page, pageSize, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateExamDto: UpdateExamDto,
  ) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
