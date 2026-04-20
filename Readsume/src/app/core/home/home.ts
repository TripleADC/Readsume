import { Component,signal, inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly title = signal('Readsume');
  protected readonly window = window;
  protected auth = inject(AuthService);

  // constructor(private router : Router){};
}
