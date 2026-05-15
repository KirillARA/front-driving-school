export type GroupStatus = 'forming' | 'studying' | 'graduated';

export interface Group {
  id: number;
  Название: string;
  Категория: string;
  ДатаНачала: string;
  ДатаОкончания?: string | null;
  МаксУчеников: number;
  ТекущУчеников: number;
  Статус: string;
}