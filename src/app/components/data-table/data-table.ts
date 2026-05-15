import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, of, combineLatest } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { DataFormDialog } from '../data-form-dialog/data-form-dialog';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css']
})
export class DataTable implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;
  currentType: 'table' | 'view' = 'table';
  currentId: string = '';
  entityName: string = '';
  data: any[] = [];
  displayedColumns: string[] = [];
  quickFilter: string = '';

  filters: any = {};
  filterFields: string[] = [];

  constructor(
    private api: ApiService,
    private state: StateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.subscription = combineLatest([
      this.state.currentType$,
      this.state.currentId$
    ]).subscribe(([type, id]) => {
      this.currentType = type;
      this.currentId = id;
      if (type === 'table') {
        this.entityName = this.mapTableToEntity(id);
      } else {
        this.entityName = id;
      }
      this.setupFilters();
      this.loadData();
    });
  }

  mapTableToEntity(table: string): string {
    const map: Record<string, string> = {
      'employees': 'Сотрудник',
      'teachers': 'Преподаватель',
      'instructors': 'Инструктор',
      'license-categories': 'Категория_прав',
      'groups': 'Группа',
      'students': 'Ученик',
      'vehicles': 'Транспорт',
      'theory-lessons': 'Теоретическое_занятие',
      'driving-lessons': 'Практическое_занятие',
      'exams': 'Экзамен',
      'instructor-categories': 'ПринадлежностьИнструктора',
      'exam-results': 'РезультатыЭкзамена',
      'vehicle-assignments': 'ЗакреплениеТранспорта'
    };
    return map[table] || table;
  }

  setupFilters() {
    if (this.currentType === 'table') {
      switch (this.currentId) {
        case 'students':
          this.filterFields = ['фио', 'телефон'];
          this.filters = { фио: '', телефон: '' };
          break;
        case 'groups':
          this.filterFields = ['название', 'статус'];
          this.filters = { название: '', статус: '' };
          break;
        case 'teachers':
          this.filterFields = ['фио', 'специализация'];
          this.filters = { фио: '', специализация: '' };
          break;
        case 'instructors':
          this.filterFields = ['номер_в_у'];
          this.filters = { номер_в_у: '' };
          break;
        default:
          this.filterFields = [];
          this.filters = {};
      }
    } else {
      this.filterFields = [];
      this.filters = {};
    }
  }

  loadData() {
    const request = this.currentType === 'table'
      ? this.api.getList(this.entityName, this.filters)
      : this.api.getView(this.entityName);

    request.pipe(
      catchError(err => {
        console.error('Ошибка загрузки данных:', err);
        return of([]);
      })
    ).subscribe(data => {
      this.data = data;
      if (data.length) {
        this.displayedColumns = Object.keys(data[0]).filter(col => !col.includes('id'));
      } else {
        this.displayedColumns = [];
      }
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    if (this.currentType === 'table') this.loadData();
  }

  resetFilters() {
    if (this.currentType === 'table') {
      for (let field of this.filterFields) {
        this.filters[field] = '';
      }
      this.loadData();
    }
  }

  applyQuickFilter() {
    if (!this.quickFilter.trim()) {
      this.loadData();
      return;
    }
    const source = this.currentType === 'table'
      ? this.api.getList(this.entityName, this.filters)
      : this.api.getView(this.entityName);

    source.subscribe(data => {
      this.data = data.filter(row =>
        JSON.stringify(row).toLowerCase().includes(this.quickFilter.toLowerCase())
      );
      this.cdr.detectChanges();
    });
  }

  openAddDialog() {
    if (this.currentType !== 'table') return;
    const dialogRef = this.dialog.open(DataFormDialog, {
      width: '500px',
      data: { entity: this.entityName, mode: 'add', fields: this.displayedColumns }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editRow(row: any) {
    if (this.currentType !== 'table') return;
    const dialogRef = this.dialog.open(DataFormDialog, {
      width: '500px',
      data: { entity: this.entityName, mode: 'edit', record: row, fields: this.displayedColumns }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  deleteRow(row: any) {
    if (this.currentType !== 'table') return;
    const idKey = Object.keys(row).find(k => k.includes('id'));
    if (!idKey) {
      this.snackBar.open('Не найден идентификатор', 'Закрыть', { duration: 3000 });
      return;
    }
    const id = row[idKey];
    // Формируем понятное описание
    const previewCols = this.displayedColumns.slice(0, 3);
    const parts = previewCols.map(col => `${col}: ${row[col]}`).join(', ');
    const description = parts || `ID: ${id}`;
    if (confirm(`Удалить запись: ${description}?`)) {
      this.api.delete(this.entityName, id).pipe(
        catchError(err => {
          this.snackBar.open(`Ошибка: ${err.message || 'Неизвестная ошибка'}`, 'Закрыть', { duration: 5000 });
          return of(null);
        })
      ).subscribe(() => this.loadData());
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}