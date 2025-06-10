import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Template } from 'src/app/models/template.model';
import { environment } from 'src/app/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = `${environment.apiUrl}/template`;

  constructor(private http: HttpClient) { }
  createTemplate(template: Partial<Template>): Observable<Template> {
    return this.http.post<Template>(this.apiUrl, template);
  }
  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  updateTemplate(id: number, template: Partial<Template>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  previewTemplate(id: number, values: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preview/${id}`, values);
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
