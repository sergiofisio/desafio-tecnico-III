import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PatientList } from './patient-list';
import { PaginatedPatients } from '../../models/patient.model';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { Patient } from '../../services/patient';

const mockPatientService = jasmine.createSpyObj('PatientService', ['getPatients', 'deletePatient']);
const mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error']);

describe('PatientListComponent', () => {
  let component: PatientList;
  let fixture: ComponentFixture<PatientList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientList, RouterTestingModule],
      providers: [
        { provide: Patient, useValue: mockPatientService },
        { provide: ToastrService, useValue: mockToastrService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading state and then display patients on success', () => {
    const mockResponse: PaginatedPatients = {
      data: [{ id: '1', name: 'John Doe', birthDate: '1990-01-01', documents: [] }],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
    mockPatientService.getPatients.and.returnValue(of(mockResponse));

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Carregando...');

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.patients.length).toBe(1);
    expect(compiled.textContent).toContain('John Doe');
  });

  it('should show error message when service fails', () => {
    mockPatientService.getPatients.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.error).not.toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Falha ao carregar pacientes.');
  });
});
