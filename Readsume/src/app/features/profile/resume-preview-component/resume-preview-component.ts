import { Component, Input, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';

import { ResumeMeGetModel } from '../model/resume.me.get-model';

import { ToastService } from '../../../shared/service/toast-service';
import { ProfileService } from '../service/profile.service';
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
  @Input() resumeToDisplay!: ResumeMeGetModel
}
