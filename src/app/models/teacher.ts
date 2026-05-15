export interface Teacher {
  id_преподавателя: number;
  id_сотрудника: number;
  образование: string;
  стаж_преподавания?: number;
  специализация?: string;
}