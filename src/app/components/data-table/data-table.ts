import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { Subscription, of, combineLatest } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { DataFormDialog } from '../data-form-dialog/data-form-dialog';

interface FilterField {
  label: string;
  key: string;
  dataField: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

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
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css']
})
export class DataTable implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  currentType: 'table' | 'view' = 'table';
  currentId: string = '';
  data: any[] = [];
  private allData: any[] = [];
  displayedColumns: string[] = [];
  quickFilter: string = '';

  filters: any = {};
  filterFields: FilterField[] = [];
  uniqueValues: { [key: string]: string[] } = {};

  // Сущности, для которых редактирование запрещено
  noEditEntities = ['exam-results', 'student-assignments', 'employee-categories', 'discount-tariffs'];

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
      this.setupFilters();
      
      if (id && id !== '') {
        this.loadData();
      } else {
        this.data = [];
        this.allData = [];
        this.displayedColumns = [];
        this.cdr.detectChanges();
      }
    });
  }

  setupFilters() {
    if (this.currentType !== 'table') {
      this.filterFields = [];
      this.filters = {};
      return;
    }

    switch (this.currentId) {
      case 'employees':
        this.filterFields = [
          { label: 'ФИО', key: 'lastName', dataField: 'фио', type: 'text' },
          { label: 'Телефон', key: 'phone', dataField: 'телефон', type: 'text' },
          { 
            label: 'Роль', key: 'role', dataField: 'роль', type: 'select',
            options: [
              { value: 'администратор', label: 'администратор' },
              { value: 'директор', label: 'директор' },
              { value: 'инструктор', label: 'инструктор' },
              { value: 'преподаватель', label: 'преподаватель' }
            ]
          }
        ];
        break;

      case 'students':
        this.filterFields = [
          { label: 'ФИО', key: 'fullName', dataField: 'фио', type: 'text' },
          { label: 'Телефон', key: 'phone', dataField: 'телефон', type: 'text' },
          { label: 'Группа', key: 'group', dataField: 'группа', type: 'text' },
          { label: 'Тариф', key: 'tariff', dataField: 'тариф', type: 'text' },
          { label: 'Инструктор', key: 'instructor', dataField: 'инструктор', type: 'text' }
        ];
        break;

      case 'groups':
        this.filterFields = [
          { label: 'Название', key: 'name', dataField: 'название', type: 'text' },
          { 
            label: 'Статус', key: 'status', dataField: 'статус', type: 'select',
            options: [
              { value: 'forming', label: 'формируется' },
              { value: 'studying', label: 'обучается' },
              { value: 'graduated', label: 'выпущена' }
            ]
          },
          { label: 'Категория', key: 'category', dataField: 'категория', type: 'text' }
        ];
        break;

      case 'tariffs':
        this.filterFields = [
          { label: 'Название', key: 'name', dataField: 'название', type: 'text' },
          { label: 'Мин. стоимость', key: 'minPrice', dataField: '', type: 'number' },
          { label: 'Макс. стоимость', key: 'maxPrice', dataField: '', type: 'number' },
          { label: 'Мин. часов', key: 'minHours', dataField: '', type: 'number' },
          { label: 'Макс. часов', key: 'maxHours', dataField: '', type: 'number' },
          { label: 'Категория', key: 'category', dataField: 'категория', type: 'text' },
          { 
            label: 'Коробка передач', key: 'transmission', dataField: 'коробка_передач', type: 'select',
            options: [
              { value: 'механика', label: 'Механика' },
              { value: 'автомат', label: 'Автомат' }
            ]
          }
        ];
        break;

      case 'vehicles':
        this.filterFields = [
          { label: 'Марка', key: 'mark', dataField: 'марка', type: 'text' },
          { label: 'Модель', key: 'model', dataField: 'модель', type: 'text' },
          { label: 'Категория', key: 'category', dataField: 'категория', type: 'text' },
          { 
            label: 'Коробка передач', key: 'transmission', dataField: 'коробка_передач', type: 'select',
            options: [
              { value: 'механика', label: 'Механика' },
              { value: 'автомат', label: 'Автомат' }
            ]
          }
        ];
        break;

      case 'theory-lessons':
        this.filterFields = [
          { label: 'Группа', key: 'group', dataField: 'группа', type: 'text' },
          { label: 'Преподаватель', key: 'teacher', dataField: 'преподаватель', type: 'text' },
          { label: 'Дата от', key: 'dateFrom', dataField: '', type: 'date' },
          { label: 'Дата до', key: 'dateTo', dataField: '', type: 'date' }
        ];
        break;

      case 'driving-lessons':
        this.filterFields = [
          { label: 'Ученик', key: 'student', dataField: 'ученик', type: 'text' },
          { label: 'Инструктор', key: 'instructor', dataField: 'инструктор', type: 'text' },
          { label: 'Автомобиль', key: 'vehicle', dataField: 'автомобиль', type: 'text' },
          { label: 'Дата от', key: 'dateFrom', dataField: '', type: 'date' },
          { label: 'Дата до', key: 'dateTo', dataField: '', type: 'date' }
        ];
        break;

      case 'exams':
        this.filterFields = [
          { label: 'Категория', key: 'category', dataField: 'категория', type: 'text' },
          { 
            label: 'Тип', key: 'type', dataField: 'тип', type: 'select',
            options: [
              { value: 'теория', label: 'теория' },
              { value: 'вождение', label: 'вождение' }
            ]
          },
          { 
            label: 'Коробка передач', key: 'transmission', dataField: 'коробка_передач', type: 'select',
            options: [
              { value: 'механика', label: 'Механика' },
              { value: 'автомат', label: 'Автомат' }
            ]
          }
        ];
        break;

      case 'exam-results':
        this.filterFields = [
          { label: 'Ученик', key: 'student', dataField: 'ученик', type: 'text' },
          { label: 'Экзамен', key: 'exam', dataField: 'экзамен', type: 'text' },
          { 
            label: 'Результат', key: 'result', dataField: 'результат', type: 'select',
            options: [
              { value: 'сдал', label: 'сдал' },
              { value: 'не_сдал', label: 'не сдал' }
            ]
          },
          { label: 'Дата от', key: 'dateFrom', dataField: '', type: 'date' },
          { label: 'Дата до', key: 'dateTo', dataField: '', type: 'date' }
        ];
        break;

      case 'discounts':
        this.filterFields = [
          { label: 'Название', key: 'name', dataField: 'название', type: 'text' },
          { label: 'Мин. процент', key: 'minPercent', dataField: '', type: 'number' },
          { label: 'Макс. процент', key: 'maxPercent', dataField: '', type: 'number' }
        ];
        break;

      case 'discount-tariffs':
        this.filterFields = [
          { label: 'Скидка', key: 'discount', dataField: 'скидка', type: 'text' },
          { label: 'Тариф', key: 'tariff', dataField: 'тариф', type: 'text' },
          { label: 'Дата от', key: 'dateFrom', dataField: '', type: 'date' },
          { label: 'Дата до', key: 'dateTo', dataField: '', type: 'date' }
        ];
        break;

      case 'employee-categories':
        this.filterFields = [
          { label: 'Сотрудник', key: 'employee', dataField: 'сотрудникФИО', type: 'text' },
          { label: 'Категория', key: 'category', dataField: 'категорияНазвание', type: 'text' }
        ];
        break;

      case 'student-assignments':
        this.filterFields = [
          { label: 'Ученик', key: 'student', dataField: 'ученикФИО', type: 'text' },
          { label: 'Инструктор', key: 'instructor', dataField: 'сотрудникФИО', type: 'text' },
          { label: 'Дата от', key: 'dateFrom', dataField: '', type: 'date' },
          { label: 'Дата до', key: 'dateTo', dataField: '', type: 'date' }
        ];
        break;

      default:
        this.filterFields = [];
    }

    this.filters = {};
    this.filterFields.forEach(f => this.filters[f.key] = '');
  }
  loadData() {
    const activeFilters: any = {};
    for (const key in this.filters) {
      const val = this.filters[key];
      if (val !== null && val !== undefined && val !== '') {
        activeFilters[key] = val;
      }
    }

    const request = this.currentType === 'table'
      ? this.api.getList(this.currentId, activeFilters)
      : this.api.getView(this.currentId);

    request.pipe(
      catchError(err => {
        console.error(err);
        this.snackBar.open('Ошибка загрузки данных', 'OK', { duration: 3000 });
        return of([]);
      })
    ).subscribe(data => {
      this.allData = data;
      this.data = [...data];
      this.updateDisplayedColumns(data);
      this.updateUniqueValues(data);
      this.cdr.detectChanges();
    });
  }

  private updateDisplayedColumns(data: any[]) {
    this.displayedColumns = data?.length
      ? Object.keys(data[0]).filter(k => !k.toLowerCase().includes('id'))
      : [];
  }

  private updateUniqueValues(data: any[]) {
    const map: any = {};
    for (const field of this.filterFields) {
      if (field.type === 'text' && field.dataField) {
        const set = new Set<string>();
        data.forEach(row => {
          const val = row[field.dataField];
          if (val !== null && val !== undefined && val !== '') {
            set.add(String(val));
          }
        });
        map[field.key] = Array.from(set).sort();
      }
    }
    this.uniqueValues = map;
  }

  applyQuickFilter() {
    const q = this.quickFilter.toLowerCase().trim();
    if (!q) {
      this.data = [...this.allData];
      return;
    }
    this.data = this.allData.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  }

  applyFilters() {
    this.loadData();
  }

  resetFilters() {
    for (const field of this.filterFields) {
      this.filters[field.key] = '';
    }
    this.loadData();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(DataFormDialog, {
      width: '600px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'resizable-dialog',
      data: { entity: this.currentId, mode: 'add', fields: this.displayedColumns }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editRow(row: any) {
    if (this.noEditEntities.includes(this.currentId)) {
      this.snackBar.open('Редактирование недоступно. Удалите и создайте заново.', 'OK', { duration: 3000 });
      return;
    }

    let compositeId = null;
    let singleId = null;

    if (this.currentId === 'employee-categories') {
      const employeeId = row.сотрудникId;
      const categoryId = row.категорияId;
      if (!employeeId || !categoryId) {
        this.snackBar.open('Не найден идентификатор сотрудника или категории', 'OK', { duration: 3000 });
        return;
      }
      compositeId = `${employeeId}/${categoryId}`;
    } 
    else if (this.currentId === 'student-assignments') {
      const studentId = row.ученикId;
      const employeeId = row.сотрудникId;
      const assignmentDate = row.датаЗакрепления;
      if (!studentId || !employeeId || !assignmentDate) {
        this.snackBar.open('Не найден составной идентификатор закрепления', 'OK', { duration: 3000 });
        return;
      }
      const dateStr = typeof assignmentDate === 'string' ? assignmentDate : new Date(assignmentDate).toISOString().split('T')[0];
      compositeId = `${studentId}/${employeeId}/${dateStr}`;
    }
    else if (this.currentId === 'exam-results') {
      const studentId = row.ученикId;
      const examId = row.экзаменId;
      const attemptDate = row.датаПопытки;
      if (!studentId || !examId || !attemptDate) {
        this.snackBar.open('Не найден составной идентификатор результата экзамена', 'OK', { duration: 3000 });
        return;
      }
      const dateStr = typeof attemptDate === 'string' ? attemptDate : new Date(attemptDate).toISOString().split('T')[0];
      compositeId = `${studentId}/${examId}/${dateStr}`;
    }
    else if (this.currentId === 'discount-tariffs') {
      const discountId = row.скидкаId;
      const tariffId = row.тарифId;
      if (!discountId || !tariffId) {
        this.snackBar.open('Не найден составной идентификатор скидки на тариф', 'OK', { duration: 3000 });
        return;
      }
      compositeId = `${discountId}/${tariffId}`;
    }
    else {
      const idKey = Object.keys(row).find(k => k.toLowerCase().includes('id'));
      if (!idKey) {
        this.snackBar.open('Не найден идентификатор записи', 'OK', { duration: 3000 });
        return;
      }
      singleId = row[idKey];
    }

    const dialogRef = this.dialog.open(DataFormDialog, {
      width: '600px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'resizable-dialog',
      data: {
        entity: this.currentId,
        mode: 'edit',
        record: row,
        fields: this.displayedColumns,
        compositeId: compositeId,
        singleId: singleId
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  deleteRow(row: any) {
    if (this.currentId === 'student-assignments') {
      const studentId = row.ученикId;
      const employeeId = row.сотрудникId;
      const assignmentDate = row.датаЗакрепления;
      if (!studentId || !employeeId || !assignmentDate) {
        this.snackBar.open('Не найден составной идентификатор закрепления', 'OK', { duration: 3000 });
        return;
      }
      const dateStr = typeof assignmentDate === 'string' ? assignmentDate : new Date(assignmentDate).toISOString().split('T')[0];
      if (confirm('Удалить запись?')) {
        this.api.deleteComposite(this.currentId, `${studentId}/${employeeId}/${dateStr}`)
          .pipe(catchError(err => {
            this.snackBar.open(`Ошибка: ${err.message}`, 'OK', { duration: 5000 });
            return of(null);
          }))
          .subscribe(() => this.loadData());
      }
      return;
    }

    if (this.currentId === 'employee-categories') {
      const employeeId = row.сотрудникId;
      const categoryId = row.категорияId;
      if (!employeeId || !categoryId) {
        this.snackBar.open('Не найден идентификатор сотрудника или категории', 'OK', { duration: 3000 });
        return;
      }
      if (confirm('Удалить запись?')) {
        this.api.deleteComposite(this.currentId, `${employeeId}/${categoryId}`)
          .pipe(catchError(err => {
            this.snackBar.open(`Ошибка: ${err.message}`, 'OK', { duration: 5000 });
            return of(null);
          }))
          .subscribe(() => this.loadData());
      }
      return;
    }

    if (this.currentId === 'exam-results') {
      const studentId = row.ученикId;
      const examId = row.экзаменId;
      const attemptDate = row.датаПопытки;
      if (!studentId || !examId || !attemptDate) {
        this.snackBar.open('Не найден составной идентификатор результата экзамена', 'OK', { duration: 3000 });
        return;
      }
      const dateStr = typeof attemptDate === 'string' ? attemptDate : new Date(attemptDate).toISOString().split('T')[0];
      if (confirm('Удалить запись?')) {
        this.api.deleteComposite(this.currentId, `${studentId}/${examId}/${dateStr}`)
          .pipe(catchError(err => {
            this.snackBar.open(`Ошибка: ${err.message}`, 'OK', { duration: 5000 });
            return of(null);
          }))
          .subscribe(() => this.loadData());
      }
      return;
    }

    if (this.currentId === 'discount-tariffs') {
      const discountId = row.скидкаId;
      const tariffId = row.тарифId;
      if (!discountId || !tariffId) {
        this.snackBar.open('Не найден составной идентификатор скидки на тариф', 'OK', { duration: 3000 });
        return;
      }
      if (confirm('Удалить запись?')) {
        this.api.deleteComposite(this.currentId, `${discountId}/${tariffId}`)
          .pipe(catchError(err => {
            this.snackBar.open(`Ошибка: ${err.message}`, 'OK', { duration: 5000 });
            return of(null);
          }))
          .subscribe(() => this.loadData());
      }
      return;
    }

    const idKey = Object.keys(row).find(k => k.toLowerCase().includes('id'));
    if (!idKey) {
      this.snackBar.open('Не найден идентификатор', 'OK', { duration: 3000 });
      return;
    }
    const id = row[idKey];
    if (confirm(`Удалить запись ${id}?`)) {
      this.api.delete(this.currentId, id)
        .pipe(catchError(err => {
          this.snackBar.open(`Ошибка: ${err.message}`, 'OK', { duration: 5000 });
          return of(null);
        }))
        .subscribe(() => this.loadData());
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  getSectionTitle(): string {
    const titles: Record<string, string> = {
      'employees': 'Сотрудники',
      'license-categories': 'Категории прав',
      'groups': 'Группы',
      'tariffs': 'Тарифы',
      'students': 'Ученики',
      'vehicles': 'Транспорт',
      'theory-lessons': 'Теоретические занятия',
      'driving-lessons': 'Практические занятия',
      'exams': 'Экзамены',
      'exam-results': 'Результаты экзаменов',
      'discounts': 'Скидки',
      'discount-tariffs': 'Скидки на тарифы',
      'student-assignments': 'Закрепление учеников',
      'employee-categories': 'Принадлежность сотрудников'
    };
    return titles[this.currentId] || this.currentId;
  }
}