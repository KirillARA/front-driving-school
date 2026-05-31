import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-data-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DragDropModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
  template: `
    <div mat-dialog-title cdkDrag cdkDragRootElement=".mat-mdc-dialog-container" class="dialog-header">
      <h2>{{ data.mode === 'add' ? 'Добавление' : 'Редактирование' }}</h2>
      <div cdkDragHandle class="drag-handle">⋮⋮</div>
    </div>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form">
        <div *ngFor="let field of data.fields" class="field-container">
          <ng-container *ngIf="isSelectField(field); else inputField">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ field }}</mat-label>
              <mat-select [formControlName]="field">
                <mat-option *ngFor="let option of selectOptions[field]" [value]="option.value">
                  {{ option.label }}
                </mat-option>
              </mat-select>
              <mat-spinner *ngIf="selectLoading[field]" diameter="20" class="spinner"></mat-spinner>
            </mat-form-field>
          </ng-container>

          <ng-template #inputField>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ field }}</mat-label>
              <input matInput 
                     [formControlName]="field" 
                     [mask]="getMaskForField(field)" 
                     [placeholder]="getMaskPlaceholder(field)"
                     [dropSpecialCharacters]="false" 
                     [showMaskTyped]="false" />
            </mat-form-field>
          </ng-template>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отмена</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid || isSaving">
        Сохранить
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header { display: flex; justify-content: space-between; align-items: center; cursor: grab; padding: 16px 24px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
    .dialog-header:active { cursor: grabbing; }
    .drag-handle { font-size: 24px; cursor: move; user-select: none; }
    .dialog-content { max-height: 70vh; overflow-y: auto; padding: 16px 24px; }
    .field-container { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .spinner { position: absolute; right: 12px; top: 12px; }
  `]
})
export class DataFormDialog implements OnInit {
  form!: FormGroup;
  isSaving = false;

  private compositeId: string | null = null;
  private singleId: number | null = null;

  selectOptions: { [key: string]: { value: string; label: string }[] } = {};
  selectLoading: { [key: string]: boolean } = {};

  private fieldMasks: Record<string, Record<string, string>> = {
    vehicles: { госномер: 'A 000 AA 00' },
    employees: { паспорт: '0000 000000' },
    students: { паспорт: '0000 000000' },
  };

  private entitySelectConfig: Record<string, Record<string, { apiUrl: string; labelField: string; valueField?: string }>> = {
    'theory-lessons': {
      'группа': { apiUrl: 'groups', labelField: 'название' },
      'преподаватель': { apiUrl: 'employees', labelField: 'фио' },
    },
    'driving-lessons': {
      'ученик': { apiUrl: 'students', labelField: 'фио' },
      'инструктор': { apiUrl: 'employees', labelField: 'фио' },
      'автомобиль': { apiUrl: 'vehicles', labelField: 'госномер' },
    },
    'students': {
      'группа': { apiUrl: 'groups', labelField: 'название' },
      'тариф': { apiUrl: 'tariffs', labelField: 'название' },
      'инструктор': { apiUrl: 'employees', labelField: 'фио' },
    },
    'groups': {
      'категория': { apiUrl: 'license-categories', labelField: 'название' },
    },
    'tariffs': {
      'категория': { apiUrl: 'license-categories', labelField: 'название' },
    },
    'vehicles': {
      'категория': { apiUrl: 'license-categories', labelField: 'название' },
    },
    'exams': {
      'категория': { apiUrl: 'license-categories', labelField: 'название' },
    },
    'exam-results': {
      'ученик': { apiUrl: 'students', labelField: 'фио' },
      'экзамен': { apiUrl: 'exams', labelField: 'категория' },
    },
    'discount-tariffs': {
      'скидкаНазвание': { apiUrl: 'discounts', labelField: 'название' },
      'тарифНазвание': { apiUrl: 'tariffs', labelField: 'название' },
    },
    'employee-categories': {
      'сотрудникФИО': { apiUrl: 'employees', labelField: 'фио' },
      'категорияНазвание': { apiUrl: 'license-categories', labelField: 'название' },
    },
    'student-assignments': {
      'ученикФИО': { apiUrl: 'students', labelField: 'фио' },
      'сотрудникФИО': { apiUrl: 'employees', labelField: 'фио' },
    },
  };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<DataFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { entity: string; mode: 'add' | 'edit'; record?: any; fields: string[]; compositeId?: string; singleId?: number },
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    console.log('DataFormDialog инициализирован:', this.data.entity, 'поля:', this.data.fields);

    this.compositeId = this.data.compositeId || null;
    this.singleId = this.data.singleId || null;

    const group: any = {};
    for (const field of this.data.fields) {
      group[field] = [this.data.record?.[field] || ''];
    }
    this.form = this.fb.group(group);
    await this.loadSelectOptions();

    if (this.data.entity === 'exams') {
      const typeControl = this.form.get('тип');
      const transmissionControl = this.form.get('коробка_передач');
      if (typeControl && transmissionControl) {
        const updateTransmissionState = () => {
          if (typeControl.value === 'теория') {
            transmissionControl.setValue(null);
            transmissionControl.disable();
          } else {
            transmissionControl.enable();
            if (!transmissionControl.value) {
              transmissionControl.setValue('механика');
            }
          }
        };
        typeControl.valueChanges.subscribe(() => updateTransmissionState());
        updateTransmissionState();
      }
    }

    if (this.data.mode === 'edit') {
      if (this.data.entity === 'exam-results') {
        this.form.get('ученик')?.disable();
        this.form.get('экзамен')?.disable();
        this.form.get('датаПопытки')?.disable();
      }
      if (this.data.entity === 'student-assignments') {
        this.form.get('ученикФИО')?.disable();
        this.form.get('сотрудникФИО')?.disable();
        this.form.get('датаЗакрепления')?.disable();
      }
      if (this.data.entity === 'employee-categories') {
        this.form.get('сотрудникФИО')?.disable();
        this.form.get('категорияНазвание')?.disable();
      }
      if (this.data.entity === 'discount-tariffs') {
        this.form.get('скидкаНазвание')?.disable();
        this.form.get('тарифНазвание')?.disable();
      }
    }

    this.cdr.detectChanges();
  }

  isSelectField(field: string): boolean {
    const configForEntity = this.entitySelectConfig[this.data.entity];
    const isDynamic = !!(configForEntity && configForEntity[field]);
    const staticEnumFields: Record<string, string[]> = {
      groups: ['статус'],
      exams: ['тип', 'коробка_передач'],
      'exam-results': ['результат'],
      tariffs: ['коробка_передач'],
      vehicles: ['коробка_передач'],
      employees: ['роль'],
    };
    const isStatic = staticEnumFields[this.data.entity]?.includes(field) || false;
    return isDynamic || isStatic;
  }

  getMaskForField(field: string): string | null {
    const explicitMask = this.fieldMasks[this.data.entity]?.[field];
    if (explicitMask) return explicitMask;

    const lowerField = field.toLowerCase();
    if (lowerField.includes('телефон')) return '0 000 000 00 00';
    if (lowerField.includes('паспорт')) return '0000 000000';
    if (lowerField.includes('госномер')) return 'A 000 AA 00';
    if (lowerField.includes('дата')) return '0000-00-00';
    if (lowerField.includes('время')) return '00:00';
    return null;
  }

  getMaskPlaceholder(field: string): string {
    const mask = this.getMaskForField(field);
    if (mask === '0000-00-00') return 'гггг-мм-дд';
    if (mask === 'A 000 AA 00') return 'A 123 BC 77';
    if (mask === '0000 000000') return '1234 567890';
    if (mask === '00:00') return 'чч:мм';
    if (field.toLowerCase().includes('телефон')) return '+7 (123) 456-78-90';
    return '';
  }

  private async loadSelectOptions() {
    const config = this.entitySelectConfig[this.data.entity];
    if (config) {
      for (const [field, cfg] of Object.entries(config)) {
        this.selectLoading[field] = true;
        try {
          const items = await firstValueFrom(this.api.getList(cfg.apiUrl));
          this.selectOptions[field] = items.map((item: any) => ({
            value: item[cfg.valueField || cfg.labelField],
            label: item[cfg.labelField],
          }));
          console.log(`Загружено ${items.length} опций для поля ${field}`);
        } catch (err: any) {
          console.error(`Ошибка загрузки списка для поля ${field}:`, err);
          this.selectOptions[field] = [];
          this.snackBar.open(`Не удалось загрузить список для поля ${field}`, 'Закрыть', { duration: 3000 });
        } finally {
          this.selectLoading[field] = false;
          this.cdr.detectChanges();
        }
      }
    }

    if (this.data.entity === 'employees' && this.data.fields.includes('роль')) {
      this.selectOptions['роль'] = [
        { value: 'администратор', label: 'администратор' },
        { value: 'директор', label: 'директор' },
        { value: 'инструктор', label: 'инструктор' },
        { value: 'преподаватель', label: 'преподаватель' },
      ];
    }
    if (this.data.entity === 'groups' && this.data.fields.includes('статус')) {
      this.selectOptions['статус'] = [
        { value: 'forming', label: 'формируется' },
        { value: 'studying', label: 'обучается' },
        { value: 'graduated', label: 'выпущена' },
      ];
    }
    if (this.data.entity === 'exams' && this.data.fields.includes('тип')) {
      this.selectOptions['тип'] = [
        { value: 'теория', label: 'теория' },
        { value: 'вождение', label: 'вождение' },
      ];
    }
    if (this.data.entity === 'exam-results' && this.data.fields.includes('результат')) {
      this.selectOptions['результат'] = [
        { value: 'сдал', label: 'сдал' },
        { value: 'не_сдал', label: 'не сдал' },
      ];
    }
    const transmissionEntities = ['tariffs', 'vehicles', 'exams'];
    if (transmissionEntities.includes(this.data.entity) && this.data.fields.includes('коробка_передач')) {
      this.selectOptions['коробка_передач'] = [
        { value: 'механика', label: 'Механика' },
        { value: 'автомат', label: 'Автомат' },
      ];
    }

    if (this.data.entity === 'exam-results' && this.data.fields.includes('экзамен')) {
      this.selectLoading['экзамен'] = true;
      try {
        const exams = await firstValueFrom(this.api.getList('exams'));
        this.selectOptions['экзамен'] = exams.map((exam: any) => ({
          value: `${exam.категория} (${exam.тип})`,
          label: `${exam.категория} (${exam.тип})`,
        }));
        console.log('Загружены экзамены для поля экзамен');
      } catch (err) {
        console.error('Ошибка загрузки экзаменов:', err);
        this.selectOptions['экзамен'] = [];
      } finally {
        this.selectLoading['экзамен'] = false;
        this.cdr.detectChanges();
      }
    }
  }

  private getErrorMessage(err: any): string {
    if (!err) return 'Неизвестная ошибка';
    if (typeof err.error === 'string') return err.error;
    if (err.error?.error && typeof err.error.error === 'string') return err.error.error;
    if (err.error?.title) return err.error.title;
    if (err.error?.message) return err.error.message;
    if (err.message) return err.message;
    return 'Неизвестная ошибка';
  }

  onSave() {
    if (this.form.invalid) return;
    this.isSaving = true;
    const formValue = this.form.value;

    if (this.data.entity === 'exam-results' && formValue['результат'] === 'не_сдал') {
      formValue['результат'] = 'не сдал';
    }

    if (this.data.mode === 'add') {
      this.api.add(this.data.entity, formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('Ошибка добавления:', err);
          this.isSaving = false;
          this.cdr.detectChanges();
          const msg = this.getErrorMessage(err);
          this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', { duration: 5000 });
        }
      });
    } else {
      const updated = { ...this.data.record, ...formValue };
      if (this.compositeId) {
        this.api.updateComposite(this.data.entity, this.compositeId, updated).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            console.error('Ошибка обновления (составной ключ):', err);
            this.isSaving = false;
            this.cdr.detectChanges();
            const msg = this.getErrorMessage(err);
            this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', { duration: 5000 });
          }
        });
      } else if (this.singleId) {
        this.api.update(this.data.entity, this.singleId, updated).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            console.error('Ошибка обновления (обычный ключ):', err);
            this.isSaving = false;
            this.cdr.detectChanges();
            const msg = this.getErrorMessage(err);
            this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', { duration: 5000 });
          }
        });
      } else {
        const idKey = Object.keys(this.data.record).find(k => k.toLowerCase().includes('id'));
        if (!idKey) {
          this.snackBar.open('Не найден идентификатор записи', 'Закрыть', { duration: 3000 });
          this.isSaving = false;
          return;
        }
        const id = this.data.record[idKey];
        this.api.update(this.data.entity, id, updated).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            console.error('Ошибка обновления:', err);
            this.isSaving = false;
            this.cdr.detectChanges();
            const msg = this.getErrorMessage(err);
            this.snackBar.open(`Ошибка: ${msg}`, 'Закрыть', { duration: 5000 });
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}