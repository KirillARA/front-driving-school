import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule],
  templateUrl: './sidebar-menu.html',
  styleUrls: ['./sidebar-menu.css']
})
export class SidebarMenu {
  tables = [
    { label: 'Сотрудники', id: 'employees' },
    { label: 'Категории прав', id: 'license-categories' },
    { label: 'Группы', id: 'groups' },
    { label: 'Тарифы', id: 'tariffs' },
    { label: 'Ученики', id: 'students' },
    { label: 'Транспорт', id: 'vehicles' },
    { label: 'Теоретические занятия', id: 'theory-lessons' },
    { label: 'Практические занятия', id: 'driving-lessons' },
    { label: 'Экзамены', id: 'exams' },
    { label: 'Результаты экзаменов', id: 'exam-results' },
    { label: 'Скидки', id: 'discounts' },
    { label: 'Скидки на тарифы', id: 'discount-tariffs' },
    { label: 'Закрепление учеников', id: 'student-assignments' },
    { label: 'Принадлежность сотрудников', id: 'employee-categories' }
  ];

  views = [
    { label: 'Информация об учениках', id: 'students_info' },
    { label: 'Расписание вождения', id: 'driving_schedule' },
    { label: 'Сводка по группам', id: 'groups_summary' },
    { label: 'Результаты экзаменов', id: 'exam_results' }
  ];

  constructor(private state: StateService) {}

  selectTable(tableId: string) {
    this.state.setCurrentTable(tableId);
  }

  selectView(viewId: string) {
    this.state.setCurrentView(viewId);
  }
}