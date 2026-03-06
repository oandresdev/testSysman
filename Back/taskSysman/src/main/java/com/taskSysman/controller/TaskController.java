package com.taskSysman.controller;

import com.taskSysman.interfaces.ITask;
import com.taskSysman.mapper.TaskMapper;
import com.taskSysman.model.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final ITask taskService;

    public TaskController(ITask taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskMapper>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskMapper> getTaskById(@PathVariable Long id) {

        TaskMapper task = taskService.getTaskById(id);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<Long> createTask(@RequestBody Task task) {

        Long taskId = taskService.createTask(task);

        return ResponseEntity.ok(taskId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTask(
            @PathVariable Long id,
            @RequestBody Task task) {

        taskService.updateTask(id, task);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }
}