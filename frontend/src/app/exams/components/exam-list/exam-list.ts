import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamModel } from '../../models/exam.model';
import { Exam } from './../../services/exam';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './exam-list.html',
})
export class ExamList implements OnInit {
  exams: ExamModel[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalExams = 0;

  constructor(private examService: Exam) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.isLoading = true;
    this.error = null;
    this.examService.getExams(this.currentPage, this.pageSize);
  }
}
