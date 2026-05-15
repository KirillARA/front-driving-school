export type ExamResultStatus = 'сдал' | 'не сдал';

export interface ExamResult {
  Ученик: string;
  Экзамен: string;       
  ДатаПопытки: string;
  Результат: string;
}