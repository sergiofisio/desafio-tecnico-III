import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';

import { PatientCreate } from './patient-create';
import { provideNgxMask } from 'ngx-mask';

describe('PatientCreateComponent', () => {
  let component: PatientCreate;
  let fixture: ComponentFixture<PatientCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientCreate, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: ToastrService, useValue: {} }, provideNgxMask()],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
