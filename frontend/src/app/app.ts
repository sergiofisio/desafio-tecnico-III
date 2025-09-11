import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './auth/services/auth';
import { ButtonComponent } from './shared/components/button/button';
import { routeAnimations } from '../animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ButtonComponent],
  templateUrl: './app.html',
  animations: [routeAnimations],
})
export class App {
  protected readonly title = 'MOBILEMED';

  constructor(public authService: Auth) {}

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
