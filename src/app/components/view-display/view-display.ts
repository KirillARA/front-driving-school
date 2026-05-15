import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-view-display',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './view-display.html',
  styleUrls: ['./view-display.css']
})
export class ViewDisplay {
  displayedColumns = ['fullName', 'group', 'instructor', 'phone'];
  dataSource = [
    { fullName: 'Иванов Иван', group: 'Группа B-2024', instructor: 'Петров П.П.', phone: '89001234567' },
    { fullName: 'Петрова Анна', group: 'Группа B-2024', instructor: 'Сидоров С.С.', phone: '89112345678' }
  ];
}
