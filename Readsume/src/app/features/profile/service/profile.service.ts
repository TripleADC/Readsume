import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ResumePostModel } from '../model/resume.post-model';
import { ResumeMeGetModel } from '../model/resume.me.get-model';

import { ApiGetModel } from '../../../shared/model/general/api.get-model';
import { ApiPostResponseModel } from '../../../shared/model/general/api.post-response-model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService 
{
  private httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}`;

  getMyResumes(): Observable<ResumeMeGetModel[]>
  {
    return this.httpClient.get<ApiGetModel<ResumeMeGetModel>>(`${environment.apiUrl}/resumes/me`)
      .pipe(
        map(x => x.data),
        catchError((err: HttpErrorResponse) => 
        { 
          return throwError(() => err);
        })
      );
  }

  postResume(resume: ResumePostModel): Observable<string>
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
