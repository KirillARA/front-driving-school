import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-right-actions',
  standalone: true,          
  imports: [CommonModule, MatButtonModule],
  templateUrl: './right-actions.html',      
  styleUrls: ['./right-actions.css']      
})
export class RightActions {
  views = [
    'Информация об учениках',
    'Расписание вождения',
    'Сводка по группам',
    'Результаты экзаменов'
  ];
}