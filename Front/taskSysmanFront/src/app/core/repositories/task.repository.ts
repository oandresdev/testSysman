import { Observable } from 'rxjs';
import { Task } from '../../interface/Task';

export abstract class TaskRepository {
  abstract getAll(): Observable<Task[]>;

  abstract getById(id: number): Observable<Task>;

  abstract create(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Observable<Task>;

  abstract update(task: Task): Observable<Task>;

  abstract delete(id: number): Observable<void>;

  abstract toggleComplete(id: number, completed: boolean): Observable<Task>;
}