import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ProfilePostModel } from '../model/profile.post-model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService 
{
  private httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/resume`;

  postResume(resume: ProfilePostModel) 
  { 
    const formData = new FormData();

    formData.append('file', resume.resumePdf);
    formData.append('fieldIds', resume.resumeFields.join(","));

    return this.httpClient.post(`${environment.apiUrl}/resumes`, formData)
      .pipe(
        catchError((err) => {
          return throwError(() => new Error(err.error.msg));
        })
      );
  }
}
