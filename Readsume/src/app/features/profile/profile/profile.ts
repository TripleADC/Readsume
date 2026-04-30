import { Component, inject, DestroyRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProfileService } from '../service/profile-service';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile 
{
  pdfForm = new FormGroup({
    resumePdf: new FormControl<File | null>(null, { validators: [Validators.required]})
  });
  
  pdfSrc: string | undefined = undefined;

  constructor(private router : Router){};

  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  onFileSelected(event: Event)
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0)
    {
      const file = input.files[0];
      this.pdfForm.patchValue({ resumePdf: file });
      this.pdfSrc = URL.createObjectURL(file);
    }
  }

  submitResume()
  {
    if (this.pdfForm.get("resumePdf")!.value == null)
    {
      // TENTATIVE -- add a toast component later in shared
      return;
    }

    const newResume = {
      resumePdf: this.pdfForm.get("resumePdf")!.value!
    }

    this.profileService.postResume(newResume)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log("pdf uploaded!");
        },
        error: () =>
        {
          console.log("pdf unsuccessful");
        }
      })
  }
}
