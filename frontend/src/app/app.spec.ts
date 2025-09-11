import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';
import { Auth } from './auth/services/auth';

describe('AppComponent', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let authService: Auth;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule, RouterTestingModule],
      providers: [Auth],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    authService = TestBed.inject(Auth);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the navbar when user is authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).not.toBeNull();
    expect(compiled.querySelector('a.font-bold')?.textContent).toContain('Mobilemed');
  });

  it('should NOT render the navbar when user is not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).toBeNull();
  });
});
