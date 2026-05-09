import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal 
{
  @Input() message : string = 'Are you sure?';
  @Input() warning : string = '';
  @Input() confirmLabel : string = 'Confirm';
  @Input() cancelLabel : string = 'Cancel';

  @Input() isOpen = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
