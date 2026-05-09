import { Component, Input, DestroyRef, inject, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';

import { ResumeMeGetModel } from '../model/resume.me.get-model';

import { ToastService } from '../../../shared/service/toast-service';
import { ProfileService } from '../service/profile.service';
import { ConfirmModalService } from '../../../shared/service/confirm-modal-service';
import { ErrorParsingService } from '../../../shared/service/error-parsing-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-resume-preview-component',
  imports: [],
  templateUrl: './resume-preview-component.html',
  styleUrl: './resume-preview-component.css',
})
export class ResumePreviewComponent 
{
  @Input() resumeToDisplay!: ResumeMeGetModel;

  private toastService = inject(ToastService);
  private profileService = inject(ProfileService);
  private confirmModalService = inject(ConfirmModalService);
  private errorParsingService = inject(ErrorParsingService);

  private destroyRef = inject(DestroyRef);

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['resumeToDisplay'])
    {
      this.resumeToDisplay = changes['resumeToDisplay'].currentValue;
    }
  }

  async toggleResume()
  {
    const messageToUse = this.resumeToDisplay.public == true ? "Are you sure you want to make this resume private?" : "Are you sure you want to make this resume public?";

    const confirmed : boolean = await this.confirmModalService.open({ message: messageToUse });

    if (confirmed)
    {
      this.profileService.toggleResume(this.resumeToDisplay.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => 
          {
            this.toastService.show(data);
          },
          error: (error: HttpErrorResponse) =>
          {
            this.toastService.error(this.errorParsingService.parseError(error));
          }
        })
    }
  }

  async deleteResume()
  {
    const confirmed : boolean = await this.confirmModalService.open({ 
      message: "Are you sure you want to delete this resume?",
      warning: "This action can not be undone"
    });

    if (confirmed)
    {
      this.profileService.deleteResume(this.resumeToDisplay.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => 
          {
            this.toastService.show(data);
          },
          error: (error: HttpErrorResponse) =>
          {
            this.toastService.error(this.errorParsingService.parseError(error));
          }
        })
    }
  }
}
