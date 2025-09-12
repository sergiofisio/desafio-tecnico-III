import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Patient } from './patient';
import { PaginatedPatients, PatientModel } from '../models/patient.model';
import { environment } from '../../../environments/environment';

describe('PatientService', () => {
  let service: Patient;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/patients`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Patient],
    });
    service = TestBed.inject(Patient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPatients', () => {
    it('should send a GET request to the correct URL with pagination params', () => {
      const mockResponse: PaginatedPatients = {
        data: [{ id: '1', name: 'John Doe', birthDate: '1990-01-01', documents: [] }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      service.getPatients(1, 10).subscribe((response) => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('John Doe');
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createPatient', () => {
    it('should send a POST request with the patient payload', () => {
      const newPatient: Partial<PatientModel> = { name: 'Jane Doe', birthDate: '1992-05-20' };
      const mockResponse: PatientModel = { id: '2', ...newPatient, documents: [] } as PatientModel;

      service.createPatient(newPatient).subscribe((response) => {
        expect(response.id).toBe('2');
        expect(response.name).toBe('Jane Doe');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPatient);
      req.flush(mockResponse);
    });
  });
});
