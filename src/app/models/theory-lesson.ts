export interface TheoryLesson {
  id_теорзан: number;
  id_группы: number;
  id_преподавателя: number;
  тема: string;
  дата: string;
  время_начала: string;
  время_окончания: string;
  аудитория?: string;
  номер_занятия?: number;
}