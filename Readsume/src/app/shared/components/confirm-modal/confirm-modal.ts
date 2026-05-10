import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { ConfirmModalService } from '../../service/confirm-modal-service';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal 
{
  confirmModalService = inject(ConfirmModalService);

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmModalService.confirm();
  }

  onCancel() {
    this.confirmModalService.cancel();
  }
}
