export interface Task {
  taskId: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string | null;
}