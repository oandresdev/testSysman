import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { TaskRepository } from '../core/repositories/task.repository';
import { Task } from '../interface/Task';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends TaskRepository {

  private apiUrl = 'http://localhost:8080/api/tasks';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
      // 'Authorization': 'Bearer ' 
    })
  };

  constructor(private http: HttpClient) {
    super();
  }

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getById(id: number): Observable<Task> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Task>(url);
  }

  create(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, this.httpOptions);
  }

  update(task: Task): Observable<Task> {
    const url = `${this.apiUrl}/${task.taskId}`;
    return this.http.put<Task>(url, task, this.httpOptions);
  }

  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  toggleComplete(id: number, completed: boolean): Observable<Task> {
    return this.getById(id).pipe(
      map(existingTask => ({
        ...existingTask,
        completed,
        updatedAt: new Date().toISOString()
      })),
      switchMap(updatedTask => this.update(updatedTask))
    );
  }
}