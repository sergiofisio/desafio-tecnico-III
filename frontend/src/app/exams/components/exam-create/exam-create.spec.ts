import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExamCreate } from './exam-create';
import { StateTransfer } from '../../../shared/services/state-transfer';

describe('ExamCreateComponent', () => {
  let component: ExamCreate;
  let fixture: ComponentFixture<ExamCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamCreate, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: StateTransfer, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
