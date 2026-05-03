import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';

import { ResumeMeGetModel } from '../model/resume.me.get-model';

import { ToastService } from '../../../shared/service/toast-service';
import { ProfileService } from '../service/profile.service';
import { ErrorParsingService } from '../../../shared/service/error-parsing-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile 
{
  resumes : ResumeMeGetModel[] = [];

  private router = inject(Router);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private errorParsingService = inject(ErrorParsingService);
  private destroyRef = inject(DestroyRef);

  ngOnInit()
  {
    this.getMyResumes();
  }

  getMyResumes()
  {
    this.profileService.getMyResumes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => 
        {
          this.resumes = data;
        },
        error: (error: HttpErrorResponse) =>
        {
          this.toastService.error(this.errorParsingService.parseError(error));
        }
      })
  }
}
