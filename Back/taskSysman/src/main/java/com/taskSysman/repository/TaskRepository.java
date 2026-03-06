package com.taskSysman.repository;

import com.taskSysman.mapper.TaskMapper;
import com.taskSysman.model.Task;
import org.hibernate.dialect.OracleTypes;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TaskRepository {

    private final DataSource dataSource;

    public TaskRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<TaskMapper> getAllTasks() {

        List<TaskMapper> tasks = new ArrayList<>();
        String sql = "{ call TASK_PKG.GET_ALL_TASKS(?) }";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.registerOutParameter(1, OracleTypes.CURSOR);
            stmt.execute();

            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {
                while (rs.next()) {
                    tasks.add(mapResultSetToTask(rs));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener tareas", e);
        }

        return tasks;
    }

    public TaskMapper getTaskById(Long taskId) {

        String sql = "{ call TASK_PKG.GET_TASK_BY_ID(?, ?) }";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.setLong(1, taskId);
            stmt.registerOutParameter(2, OracleTypes.CURSOR);

            stmt.execute();

            try (ResultSet rs = (ResultSet) stmt.getObject(2)) {
                if (rs.next()) {
                    return mapResultSetToTask(rs);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener la tarea por id", e);
        }

        return null;
    }

    public Long createTask(Task task) {

        String sql = "{ call TASK_PKG.CREATE_TASK(?, ?, ?) }";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.setString(1, task.getTitle());
            stmt.setString(2, task.getDescription());
            stmt.registerOutParameter(3, Types.NUMERIC);

            stmt.execute();

            return stmt.getLong(3);

        } catch (SQLException e) {
            throw new RuntimeException("Error al crear la tarea", e);
        }
    }

    public void updateTask(Task task) {

        String sql = "{ call TASK_PKG.UPDATE_TASK(?, ?, ?, ?) }";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.setLong(1, task.getTaskId());
            stmt.setString(2, task.getTitle());
            stmt.setString(3, task.getDescription());
            stmt.setInt(4, task.getCompleted() != null && task.getCompleted() ? 1 : 0);

            stmt.execute();

        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar la tarea", e);
        }
    }

    public void deleteTask(Long taskId) {

        String sql = "{ call TASK_PKG.DELETE_TASK(?) }";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.setLong(1, taskId);
            stmt.execute();

        } catch (SQLException e) {
            throw new RuntimeException("Error al eliminar la tarea", e);
        }
    }

    private TaskMapper mapResultSetToTask(ResultSet rs) throws SQLException {

        TaskMapper task = new TaskMapper();

        task.setTaskId(rs.getLong("TASK_ID"));
        task.setTitle(rs.getString("TITLE"));
        task.setDescription(rs.getString("DESCRIPTION"));
        task.setCompleted(rs.getInt("COMPLETED") == 1);

        Timestamp createdTs = rs.getTimestamp("CREATED_AT");
        if (createdTs != null) {
            task.setCreatedAt(createdTs.toLocalDateTime());
        }

        Timestamp updatedTs = rs.getTimestamp("UPDATED_AT");
        if (updatedTs != null) {
            task.setUpdatedAt(updatedTs.toLocalDateTime());
        }

        return task;
    }
}
