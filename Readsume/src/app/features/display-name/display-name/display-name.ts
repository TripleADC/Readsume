import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { DisplayNameGetModel } from '../model/display-name.get-model';

import { ToastService } from '../../../shared/service/toast-service';
import { DisplayNameService } from '../service/display-name.service';
import { ErrorParsingService } from '../../../shared/service/error-parsing-service';
import { AuthService } from '@auth0/auth0-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-display-name',
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './display-name.html',
  styleUrl: './display-name.css',
})
export class DisplayName 
{
  number_id: string = "";

  displayNameForm = new FormGroup({
    animalId: new FormControl<number>(1, { validators: [Validators.required]}),
  });

  displayNameOptions : DisplayNameGetModel[] = [];

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private toastService = inject(ToastService);
  private displayNameService = inject(DisplayNameService);
  private errorParsingService = inject(ErrorParsingService);
  private authService = inject(AuthService);

  ngOnInit()
  {
    this.getNumberId();
    this.getDisplayNameOptions();
  }

  getNumberId()
  {
    this.authService.user$
      .pipe(
        filter(user => !!user)
      )
      .subscribe(user => {
        const auth0Id = user?.sub;
        this.number_id = auth0Id!.split("|")[1].slice(0, 7);
      });
  }

  getDisplayNameOptions()
  {
    this.displayNameService.getDisplayNameOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.displayNameOptions = data;
        },
        error: (error: HttpErrorResponse) =>
        {
          this.toastService.error(this.errorParsingService.parseError(error));
        }
      });
  }

  postDisplayName()
  {
    if (this.displayNameForm.get("animalId")!.value == null)
    {
      return;
    }

    const newDisplayName = {
      animalId: this.displayNameForm.get("animalId")!.value!,
    }

    this.displayNameService.postDisplayName(newDisplayName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toastService.success(data);
          this.router.navigate(['/home']);
        },
        error: (error: HttpErrorResponse) =>
        {
          this.toastService.error(this.errorParsingService.parseError(error));
        }
      })
  }
}
