package com.taskSysman.interfaces;
import com.taskSysman.mapper.TaskMapper;
import com.taskSysman.model.Task;

import java.util.List;

public interface ITask
{
    List<TaskMapper> getAllTasks();

    TaskMapper getTaskById(Long id);

    Long createTask(Task task);

    void updateTask(Long id, Task task);

    void deleteTask(Long id);
}