import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5044/api';

  // Маппинг ключей меню -> названия контроллеров API
  private entityMap: Record<string, string> = {
    'employees': 'employees',
    'license-categories': 'license-categories',
    'groups': 'groups',
    'tariffs': 'tariffs',
    'students': 'students',
    'vehicles': 'vehicles',
    'theory-lessons': 'theory-lessons',
    'driving-lessons': 'driving-lessons',
    'exams': 'exams',
    'exam-results': 'exam-results',
    'discounts': 'discounts',
    'discount-tariffs': 'discount-tariffs',
    'student-assignments': 'student-assignments',
    'employee-categories': 'employee-categories'
  };

  constructor(private http: HttpClient) {}

  /**
   * Получить название сущности для API
   */
  private getEntityName(entityKey: string): string {
    return this.entityMap[entityKey] || entityKey;
  }

  /**
   * GET список
   * Поддерживает query filters
   */
  getList(entityKey: string, filters?: any): Observable<any[]> {
    const entity = this.getEntityName(entityKey);
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/${entity}`, { params });
  }

  /**
   * GET по ID (обычный числовой идентификатор)
   */
  getById(entityKey: string, id: number): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.get<any>(`${this.baseUrl}/${entity}/${id}`);
  }

  /**
   * POST (создание)
   */
  add(entityKey: string, item: any): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.post<any>(`${this.baseUrl}/${entity}`, item);
  }

  /**
   * PUT (обновление с обычным числовым идентификатором)
   */
  update(entityKey: string, id: number, item: any): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.put<any>(`${this.baseUrl}/${entity}/${id}`, item);
  }

  /**
   * DELETE (обычный числовой идентификатор)
   */
  delete(entityKey: string, id: number): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.delete<any>(`${this.baseUrl}/${entity}/${id}`);
  }

  /**
   * Удаление записи с составным ключом
   * @param entityKey – ключ сущности (например, 'employee-categories')
   * @param compositeId – строка составного ключа, разделённая слэшами (например, "5/2" или "10/3/2024-06-15")
   */
  deleteComposite(entityKey: string, compositeId: string): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.delete<any>(`${this.baseUrl}/${entity}/${compositeId}`);
  }

  /**
   * Обновление записи с составным ключом (необходимо для student-assignments)
   * @param entityKey – ключ сущности
   * @param compositeId – строка составного ключа
   * @param item – обновлённые данные
   */
  updateComposite(entityKey: string, compositeId: string, item: any): Observable<any> {
    const entity = this.getEntityName(entityKey);
    return this.http.put<any>(`${this.baseUrl}/${entity}/${compositeId}`, item);
  }

  
  getView(viewName: string, filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/views/${viewName}`, { params });
  }
}