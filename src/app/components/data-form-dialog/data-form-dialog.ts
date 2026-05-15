import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-data-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Добавление' : 'Редактирование' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" *ngFor="let field of data.fields" class="full-width">
          <mat-label>{{ field }}</mat-label>
          <input matInput [formControlName]="field">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отмена</button>
      <button mat-raised-button color="primary" (click)="onSave()">Сохранить</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; margin-bottom: 16px; }']
})
export class DataFormDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<DataFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { entity: string; mode: 'add' | 'edit'; record?: any; fields: string[] }
  ) {
    const group: any = {};
    this.data.fields.forEach(f => {
      group[f] = [this.data.record?.[f] || ''];
    });
    this.form = this.fb.group(group);
  }

  onSave() {
    if (this.form.invalid) return;
    const formValue = this.form.value;
    if (this.data.mode === 'add') {
        this.api.add(this.data.entity, formValue).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Ошибка добавления:', err)
        });
    } else {
        // 🔥 Объединяем исходную запись с изменениями из формы
        const updated = { ...this.data.record, ...formValue };
        const idKey = Object.keys(this.data.record).find(k => k.includes('id'));
        if (!idKey) {
            console.error('Не найден идентификатор в записи', this.data.record);
            return;
        }
        const id = this.data.record[idKey];
        this.api.update(this.data.entity, id, updated).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Ошибка обновления:', err)
        });
    }
}

  onCancel() {
    this.dialogRef.close(false);
  }
}