import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning';
 
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastOptions {
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService 
{
  readonly toasts = signal<Toast[]>([]);
 
  private nextId = 0;
 
  show(message: string, options: ToastOptions = { type: 'error', duration: 6000 }): number 
  {
    const id = this.nextId++;
 
    this.toasts.update((current) => [...current, { id, message, type: options.type, duration: options.duration }]);
 
    if (options?.duration > 0) {
      setTimeout(() => this.dismiss(id), options.duration);
    }
 
    return id;
  }
 
  success(message: string, duration = 6000) 
  {
    return this.show(message, { type: 'success', duration });
  }
 
  error(message: string, duration: number = 10000) 
  {
    return this.show(message, { type: 'error', duration });
  }
 
  warning(message: string, duration: number = 10000) 
  {
    return this.show(message, { type: 'warning', duration });
  }
 
  dismiss(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
 
  clear() {
    this.toasts.set([]);
  }
}
