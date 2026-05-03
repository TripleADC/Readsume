import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { DisplayNameGetModel } from '../model/display-name.get-model';
import { DisplayNamePostModel } from '../model/display-name.post-model';

import { ApiPostResponseModel } from '../../../shared/model/general/api.post-response-model';
import { ApiGetModel } from '../../../shared/model/general/api.get-model';
import { ApiGetModelSingle } from '../../../shared/model/general/api.get-model.single';

@Injectable({
  providedIn: 'root',
})
export class DisplayNameService 
{
  private httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getDisplayNameOptions(): Observable<DisplayNameGetModel[]>
  {
    return this.httpClient.get<ApiGetModel<DisplayNameGetModel>>(`${environment.apiUrl}/displayNames`)
      .pipe(
        map(x => x.data),
        catchError((err: HttpErrorResponse) => 
        { 
          return throwError(() => err);
        })
      );
  }

  postDisplayName(display: DisplayNamePostModel): Observable<string>
  {
    return this.httpClient.post<ApiPostResponseModel>(`${environment.apiUrl}/users/display`, display)
      .pipe(
        map(x => x.msg),
        catchError((err: HttpErrorResponse) => 
        { 
          return throwError(() => err);
        })
      );
  }
}
