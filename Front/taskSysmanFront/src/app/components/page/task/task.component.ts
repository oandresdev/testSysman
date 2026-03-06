// src/app/components/page/task/tasks.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TaskRepository } from '../../../core/repositories/task.repository';
import { Task } from '../../../interface/Task';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TasksComponent implements OnInit {

  tasks: Task[] = [];
  newTask: Task = {
    taskId: 0,
    title: '',
    description: '',
    completed: false,
    createdAt: '',
    updatedAt: null
  };
  editingTask: Task | null = null;
  showModal = false;

  searchTerm: string = '';

  isLoading = false;

  constructor(private taskRepo: TaskRepository) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.isLoading = true;
    this.taskRepo.getAll().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar tareas:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar',
          text: 'No se pudieron obtener las notas. Intenta más tarde.',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.newTask = {
      taskId: 0,
      title: '',
      description: '',
      completed: false,
      createdAt: '',
      updatedAt: null
    };
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.editingTask = { ...task };
    this.newTask = { ...task };
    this.showModal = true;
  }

  saveTask(): void {
    if (!this.newTask.title?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El título no puede estar vacío',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (this.editingTask) {
      this.taskRepo.update(this.newTask).subscribe({
        next: (updatedTask) => {
          this.loadTasks();
          Swal.fire({
            icon: 'success',
            title: '¡Actualizada!',
            text: 'La nota ha sido modificada correctamente',
            timer: 1800,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            timerProgressBar: true
          });
          this.closeModal();
        },
        error: (err) => {
          console.error('[UPDATE] Error al guardar:', err);
          this.showError('No se pudo actualizar la nota. Intenta nuevamente.');
        }
      });
    } else {
      const taskToCreate = {
        title: this.newTask.title.trim(),
        description: this.newTask.description?.trim() || '',
        completed: false
      };

      this.taskRepo.create(taskToCreate).subscribe({
        next: (createdTask) => {
          this.loadTasks();
          Swal.fire({
            icon: 'success',
            title: '¡Creada!',
            text: 'La nota ha sido guardada exitosamente',
            timer: 1800,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            timerProgressBar: true
          });
          this.closeModal();
        },
        error: (err) => {
          console.error('[CREATE] Error al guardar:', err);
          this.showError('No se pudo crear la nota. Verifica tu conexión o intenta más tarde.');
        }
      });
    }
  }

  toggleComplete(task: Task): void {
    task.completed = !task.completed;
    this.taskRepo.update(task).subscribe({
      next: async (updatedTask) => {
        this.loadTasks();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: updatedTask.completed ? 'success' : 'info',
          title: updatedTask.completed ? '¡Completada!' : 'Marcada como pendiente',
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
        });
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado de la nota',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar nota?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    this.taskRepo.delete(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.showSuccess('¡Eliminada!', 'La nota ha sido borrada.');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.showError('No se pudo eliminar la nota.');
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.newTask = {
      taskId: 0,
      title: '',
      description: '',
      completed: false,
      createdAt: '',
      updatedAt: null
    };
    this.editingTask = null;
  }

  private showSuccess(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#4f46e5',
      timer: 2200,
      showConfirmButton: false
    });
  }

  private showError(text: string): void {
    Swal.fire({
      icon: 'error',
      title: '¡Ups!',
      text,
      confirmButtonColor: '#4f46e5'
    });
  }

  get filteredTasks(): Task[] {
    if (!this.searchTerm?.trim()) {
      return this.tasks;
    }

    const term = this.searchTerm.trim().toLowerCase();

    return this.tasks.filter(task =>
      task.title.toLowerCase().includes(term) ||
      (task.description?.toLowerCase().includes(term) ?? false)
    );
  }
}