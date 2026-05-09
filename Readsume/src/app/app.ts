import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

import { ToastComponent } from './shared/components/toast-component/toast-component';

import { initFlowbite } from 'flowbite';
import { ConfirmModal } from "./shared/components/confirm-modal/confirm-modal";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    ToastComponent,
    ConfirmModal
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Readsume');
  protected readonly window = window;
  protected auth = inject(AuthService);

  ngOnInit(): void {
    initFlowbite();
  }
}
