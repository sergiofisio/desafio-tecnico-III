import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './auth/services/auth';
import { ButtonComponent } from './shared/components/button/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ButtonComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'MOBILEMED';

  constructor(public authService: Auth) {}
}
