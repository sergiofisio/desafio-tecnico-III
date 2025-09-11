import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Exam } from './exam';

describe('ExamService', () => {
  let service: Exam;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Exam],
    });
    service = TestBed.inject(Exam);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
