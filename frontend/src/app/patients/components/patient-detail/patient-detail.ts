import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Document, PatientModel } from '../../models/patient.model';
import { ExamModel } from '../../../exams/models/exam.model';
import { Patient } from '../../services/patient';
import { Exam } from '../../../exams/services/exam';
import { finalize, forkJoin } from 'rxjs';
import { StateTransfer } from '../../../shared/services/state-transfer';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ToastrService } from 'ngx-toastr';
import { intervalToDuration, formatDuration } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NgxMaskPipe } from 'ngx-mask';

interface ExamGroup {
  modality: string;
  exams: ExamModel[];
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, ButtonComponent, NgxMaskPipe],
  templateUrl: './patient-detail.html',
})
export class PatientDetail implements OnInit {
  patient: PatientModel | null = null;
  groupedExams: ExamGroup[] = [];
  isLoading = true;
  error: string | null = null;
  patientId: string | null;
  page: number = 1;
  pageSize: number = 100;

  modalityColors: { [key: string]: { header: string; tag: string } } = {
    CT: { header: 'bg-blue-100 text-blue-800', tag: 'bg-blue-200 text-blue-900' },
    MR: { header: 'bg-green-100 text-green-800', tag: 'bg-green-200 text-green-900' },
    US: { header: 'bg-yellow-100 text-yellow-800', tag: 'bg-yellow-200 text-yellow-900' },
    CR: { header: 'bg-indigo-100 text-indigo-800', tag: 'bg-indigo-200 text-indigo-900' },
    DX: { header: 'bg-purple-100 text-purple-800', tag: 'bg-purple-200 text-purple-900' },
    MG: { header: 'bg-pink-100 text-pink-800', tag: 'bg-pink-200 text-pink-900' },
    NM: { header: 'bg-red-100 text-red-800', tag: 'bg-red-200 text-red-900' },
    OT: { header: 'bg-teal-100 text-teal-800', tag: 'bg-teal-200 text-teal-900' },
    PT: { header: 'bg-orange-100 text-orange-800', tag: 'bg-orange-200 text-orange-900' },
    RF: { header: 'bg-cyan-100 text-cyan-800', tag: 'bg-cyan-200 text-cyan-900' },
    XA: { header: 'bg-lime-100 text-lime-800', tag: 'bg-lime-200 text-lime-900' },
    DEFAULT: { header: 'bg-gray-100 text-gray-800', tag: 'bg-gray-200 text-gray-900' },
  };

  constructor(
    private route: ActivatedRoute,
    private patientService: Patient,
    private examService: Exam,
    private router: Router,
    private stateTransferService: StateTransfer,
    private toastr: ToastrService
  ) {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    if (!this.patientId) {
      this.isLoading = false;
      this.error = 'ID do paciente não foi encontrado na URL.';
      return;
    }

    forkJoin({
      patient: this.patientService.getPatientById(this.patientId),
      exams: this.examService.getExams(this.page, this.pageSize, this.patientId),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ patient, exams }) => {
          this.patient = patient;
          this.groupAndSortExams(exams.data);
        },
        error: () => (this.error = 'Falha ao carregar dados do paciente.'),
      });
  }

  private groupAndSortExams(exams: ExamModel[]): void {
    const sortedExams = exams.sort(
      (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    );

    const groups = sortedExams.reduce((acc, exam) => {
      (acc[exam.modality] = acc[exam.modality] || []).push(exam);
      return acc;
    }, {} as { [key: string]: ExamModel[] });

    this.groupedExams = Object.keys(groups).map((modality) => ({
      modality: modality,
      exams: groups[modality],
    }));
  }

  getModalityStyles(modality: string) {
    return this.modalityColors[modality] || this.modalityColors['DEFAULT'];
  }

  navigateToCreateExam(): void {
    if (this.patient) {
      this.stateTransferService.setPatientContext(this.patient);
      this.router.navigate(['/exams/new']);
    }
  }

  getExamStatus(examDate: string): { text: string; cssClass: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOfExam = new Date(examDate);

    if (dateOfExam < today) {
      return { text: 'Realizado', cssClass: 'text-gray-500' };
    } else {
      return { text: 'Agendado', cssClass: 'text-green-600 font-semibold' };
    }
  }

  deleteExam(examId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (confirm('Tem certeza que deseja deletar este exame?')) {
      this.examService.deleteExam(examId).subscribe({
        next: () => {
          this.toastr.success('Exame deletado com sucesso!');
          this.loadData();
        },
        error: (err) => {
          const errorMessage = err.error.message || 'Falha ao deletar o exame.';
          this.toastr.error(errorMessage);
        },
      });
    }
  }

  calculateAge(birthDateString: string): string {
    if (!birthDateString) {
      return '';
    }

    const birthDate = new Date(birthDateString);
    const duration = intervalToDuration({ start: birthDate, end: new Date() });

    return formatDuration(duration, {
      format: ['years', 'months', 'days'],
      locale: ptBR,
    });
  }

  getDocumentMask(type: Document['type']): string {
    if (type === 'CPF') {
      return '000.000.000-00';
    }
    if (type === 'RG') {
      return '00.000.000-A';
    }
    return '';
  }
}
