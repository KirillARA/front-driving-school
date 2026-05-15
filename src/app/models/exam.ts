export type ExamType = 'теория' | 'вождение';

export interface Exam {
  id: number;
  Категория: string;
  Тип: string;
}