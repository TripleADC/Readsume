import { Injectable, signal } from '@angular/core';

interface ConfirmOptions {
  message?: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService 
{
  isOpen = signal(false);
  options : ConfirmOptions = {};

  private resolveFn?: (value: boolean) => void;

  open(options: ConfirmOptions): Promise<boolean> 
  {
    this.options = {
      message: options.message ?? 'Are you sure?',
      confirmLabel: options.confirmLabel ?? 'Confirm',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      warning: options.warning,
    };
    
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm() {
    this.resolveFn?.(true);
    this.close();
  }

  cancel() {
    this.resolveFn?.(false);
    this.close();
  }

  private close() {
    this.isOpen.set(false);
    this.resolveFn = undefined;
  }
}
