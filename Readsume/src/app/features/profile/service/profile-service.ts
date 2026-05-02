import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ProfilePostModel } from '../model/profile.post-model';
import { ApiPostResponseModel } from '../../../shared/model/general/api.post-response-model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService 
{
  private httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/resume`;

  postResume(resume: ProfilePostModel): Observable<string>
  { 
    const formData = new FormData();

    formData.append('file', resume.resumePdf);
    formData.append('fieldIds', resume.resumeFields.join(","));

    return this.httpClient.post<ApiPostResponseModel>(`${environment.apiUrl}/resumes`, formData)
      .pipe(
        map(x => x.msg),
        catchError((err: HttpErrorResponse) => 
        { 
          return throwError(() => err);
        })
      );
  }
}
