import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Task } from '../interface/Task';
import { TaskService } from './task.services';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTasks: Task[] = [
    { taskId: 1, title: 'Tarea 1', description: 'Desc 1', completed: false, createdAt: '', updatedAt: null },
    { taskId: 2, title: 'Tarea 2', description: 'Desc 2', completed: true, createdAt: '', updatedAt: null }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todas las tareas', () => {
    service.getAll().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('debería obtener una tarea por id', () => {
    const taskId = 1;

    service.getById(taskId).subscribe(task => {
      expect(task).toEqual(mockTasks[0]);
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks[0]);
  });

  it('debería crear una nueva tarea', () => {
    const newTask = { title: 'Nueva', description: 'Desc', completed: false };

    service.create(newTask).subscribe(task => {
      expect(task.taskId).toBe(3);
      expect(task.title).toBe('Nueva');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);

    req.flush({ ...newTask, taskId: 3, createdAt: '', updatedAt: null });
  });

  it('debería actualizar una tarea', () => {
    const updatedTask = { ...mockTasks[0], title: 'Actualizada' };

    service.update(updatedTask).subscribe(task => {
      expect(task.title).toBe('Actualizada');
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${updatedTask.taskId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTask);
    req.flush(updatedTask);
  });

  it('debería eliminar una tarea', () => {
    const taskId = 1;

    service.delete(taskId).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('debería alternar el estado de completada de una tarea', () => {
    const taskId = 1;

    service.toggleComplete(taskId, true).subscribe(task => {
      expect(task.completed).toBeTrue();
      expect(task.title).toBe(mockTasks[0].title);
    });

    const reqGet = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}`);
    expect(reqGet.request.method).toBe('GET');
    reqGet.flush(mockTasks[0]);

    const reqUpdate = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}`);
    expect(reqUpdate.request.method).toBe('PUT');
    expect(reqUpdate.request.body.completed).toBeTrue();
    reqUpdate.flush({ ...mockTasks[0], completed: true });
  });
});
