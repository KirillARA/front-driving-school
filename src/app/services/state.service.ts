// state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StateService {
  private currentTypeSubject = new BehaviorSubject<'table' | 'view'>('table');
  currentType$ = this.currentTypeSubject.asObservable();

  private currentIdSubject = new BehaviorSubject<string>('');
  currentId$ = this.currentIdSubject.asObservable();

  setCurrentTable(tableId: string) {
    this.currentTypeSubject.next('table');   // обязательно установить тип 'table'
    this.currentIdSubject.next(tableId);
}

  setCurrentView(viewName: string) {
    this.currentTypeSubject.next('view');
    this.currentIdSubject.next(viewName);
  }
}