package com.taskSysman.service;

import com.taskSysman.interfaces.ITask;
import com.taskSysman.mapper.TaskMapper;
import com.taskSysman.model.Task;
import com.taskSysman.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements ITask {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public List<TaskMapper> getAllTasks() {
        return taskRepository.getAllTasks();
    }

    @Override
    public TaskMapper getTaskById(Long id) {
        return taskRepository.getTaskById(id);
    }

    @Override
    public Long createTask(Task task) {
        return taskRepository.createTask(task);
    }

    @Override
    public void updateTask(Long id, Task task) {
        task.setTaskId(id);
        taskRepository.updateTask(task);
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteTask(id);
    }
}