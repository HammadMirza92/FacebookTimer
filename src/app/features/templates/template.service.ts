import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Template } from '../../core/models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor(private apiService: ApiService) { }

  getTemplates(): Observable<Template[]> {
    return this.apiService.get<Template[]>('templates');
  }

  getTemplate(id: number): Observable<Template> {
    return this.apiService.get<Template>(`templates/${id}`);
  }

  getTemplatesByCategory(category: string): Observable<Template[]> {
    return this.apiService.get<Template[]>(`templates/category/${category}`);
  }
}
