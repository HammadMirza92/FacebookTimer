import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { Template } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = `${environment.apiUrl}/template`;

  constructor(private http: HttpClient) { }

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getTemplateById(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
