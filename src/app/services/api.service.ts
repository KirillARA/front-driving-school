import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5044/api';

  // Маппинг английских ключей (из меню) в русские названия контроллеров
  private entityMap: Record<string, string> = {
  'employees': 'Сотрудник',
  'license-categories': 'Категория_прав',
  'groups': 'Группа',
  'tariffs': 'Тариф',
  'students': 'Ученик',
  'vehicles': 'Транспорт',
  'theory-lessons': 'Теоретическое_занятие',
  'driving-lessons': 'Практическое_занятие',
  'exams': 'Экзамен',
  'exam-results': 'Результаты_экзаменов',
  'discounts': 'Скидка',
  'discount-tariffs': 'Скидка_тарифы',
  'student-assignments': 'Закрепление_учеников',
  'employee-categories': 'Принадлежность_сотрудников'
};

  private getEntityName(entityKey: string): string {
    return this.entityMap[entityKey] || entityKey;
  }

  constructor(private http: HttpClient) {}

  getList(entityKey: string, filters?: any): Observable<any[]> {
    const entity = this.getEntityName(entityKey);
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value);
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/${entity}`, { params });
  }

  getById(entityKey: string, id: number): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.get<any>(`${this.baseUrl}/${entity}/${id}`);
  }

  add(entityKey: string, item: any): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.post<any>(`${this.baseUrl}/${entity}`, item);
  }

  update(entityKey: string, id: number, item: any): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.put<any>(`${this.baseUrl}/${entity}/${id}`, item);
  }

  delete(entityKey: string, id: number): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.delete<any>(`${this.baseUrl}/${entity}/${id}`);
  }

  getView(viewName: string, filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value) params = params.set(key, value);
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/views/${viewName}`, { params });
  }
}