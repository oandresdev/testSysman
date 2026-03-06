import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { TasksComponent } from './task.component';
import { TaskRepository } from '../../../core/repositories/task.repository';
import { Task } from '../../../interface/Task';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskRepoMock: jasmine.SpyObj<TaskRepository>;

  const mockTasks: Task[] = [
    { taskId: 1, title: 'Task 1', description: 'Desc 1', completed: false, createdAt: '', updatedAt: null },
    { taskId: 2, title: 'Task 2', description: 'Desc 2', completed: true, createdAt: '', updatedAt: null }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TaskRepository', ['getAll', 'create', 'update', 'delete']);
    spy.getAll.and.returnValue(of(mockTasks));
    spy.create.and.returnValue(of({ ...mockTasks[0], taskId: 3 }));
    spy.update.and.returnValue(of(mockTasks[1]));
    spy.delete.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        { provide: TaskRepository, useValue: spy }
      ]
    }).compileComponents();

    taskRepoMock = TestBed.inject(TaskRepository) as jasmine.SpyObj<TaskRepository>;
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;

    // Mock global Swal.fire
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));

    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las tareas al inicializar', () => {
    component.ngOnInit();
    expect(taskRepoMock.getAll).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
  });

  it('debería abrir el modal de creación', () => {
    component.openCreateModal();
    expect(component.showModal).toBeTrue();
    expect(component.editingTask).toBeNull();
    expect(component.newTask.title).toBe('');
  });

  it('debería abrir el modal de edición', () => {
    component.openEditModal(mockTasks[0]);
    expect(component.showModal).toBeTrue();
    expect(component.editingTask?.taskId).toBe(1);
    expect(component.newTask.title).toBe('Task 1');
  });

  it('no debería guardar una tarea con título vacío', () => {
    component.newTask.title = '';
    component.saveTask();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'warning',
      title: 'Campo requerido'
    }));
  });

  it('debería crear una nueva tarea', fakeAsync(() => {
    component.newTask.title = 'Nueva Tarea';
    component.newTask.description = 'Desc';
    component.editingTask = null;

    component.saveTask();
    tick();

    expect(taskRepoMock.create).toHaveBeenCalledWith({
      title: 'Nueva Tarea',
      description: 'Desc',
      completed: false
    });
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: '¡Creada!'
    }));
  }));

  /* it('debería actualizar una tarea existente', fakeAsync(() => {
    component.newTask = { ...mockTasks[0], title: 'Tarea Actualizada' };
    component.editingTask = { ...mockTasks[0] };

    component.saveTask();
    tick();

    expect(taskRepoMock.update).toHaveBeenCalledWith(component.newTask);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: '¡Actualizada!'
    }));
  })); */

  it('debería alternar el estado de completada de la tarea', fakeAsync(() => {
    const task = { ...mockTasks[0] };
    component.toggleComplete(task);
    tick();
    expect(taskRepoMock.update).toHaveBeenCalledWith(jasmine.objectContaining({ completed: true }));
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: '¡Completada!'
    }));
  }));

  it('debería eliminar la tarea tras la confirmación', fakeAsync(() => {
    component.deleteTask(1);
    tick();
    expect(taskRepoMock.delete).toHaveBeenCalledWith(1);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: '¡Eliminada!'
    }));
  }));

  it('debería filtrar las tareas por término de búsqueda', () => {
    component.searchTerm = 'Task 1';
    const filtered = component.filteredTasks;
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Task 1');
  });
});