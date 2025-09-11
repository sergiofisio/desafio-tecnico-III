import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { StateTransfer } from '../../../shared/services/state-transfer';
import { PatientDetail } from '../patient-detail/patient-detail';

describe('PatientDetailComponent', () => {
  let component: PatientDetail;
  let fixture: ComponentFixture<PatientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetail, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ToastrService, useValue: {} },
        { provide: StateTransfer, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
