package com.taskSysman;

import com.taskSysman.mapper.TaskMapper;
import com.taskSysman.model.Task;
import com.taskSysman.repository.TaskRepository;
import org.hibernate.dialect.OracleTypes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskRepository - Tests exhaustivos contra procedimientos PL/SQL")
class TaskRepositoryTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @Mock
    private CallableStatement callableStatement;

    @Mock
    private ResultSet resultSet;

    @Captor
    private ArgumentCaptor<Integer> intCaptor;

    @BeforeEach
    void setUp() throws SQLException {
        when(dataSource.getConnection()).thenReturn(connection);
        taskRepository = new TaskRepository(dataSource);
    }

    private TaskRepository taskRepository;

    // ───────────────────────────────────────────────
    // getAllTasks()
    // ───────────────────────────────────────────────

    @Test
    @DisplayName("getAllTasks → devuelve lista vacía cuando cursor viene vacío")
    void getAllTasks_emptyResult() throws SQLException {
        when(connection.prepareCall(anyString())).thenReturn(callableStatement);
        when(callableStatement.getObject(1)).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false);

        List<TaskMapper> tasks = taskRepository.getAllTasks();

        assertThat(tasks).isEmpty();

        verify(callableStatement).registerOutParameter(1, OracleTypes.CURSOR);
        verify(callableStatement).execute();
        verify(resultSet).close();
        verify(callableStatement).close();
    }

    @Test
    @DisplayName("getAllTasks → mapea correctamente varios registros")
    void getAllTasks_mapsMultipleRowsCorrectly() throws SQLException {
        when(connection.prepareCall(anyString())).thenReturn(callableStatement);
        when(callableStatement.getObject(1)).thenReturn(resultSet);

        // Simulamos 2 filas
        when(resultSet.next()).thenReturn(true, true, false);

        // Configuramos getXxx() usando doReturn para evitar sobrescritura
        doReturn(100L, 101L).when(resultSet).getLong("TASK_ID");
        doReturn("Comprar leche", "Reunión equipo").when(resultSet).getString("TITLE");
        doReturn("Entera y sin lactosa", "Sprint planning").when(resultSet).getString("DESCRIPTION");
        doReturn(0, 1).when(resultSet).getInt("COMPLETED");
        doReturn(Timestamp.valueOf("2025-06-10 14:30:00"), Timestamp.valueOf("2025-06-11 09:15:00"))
                .when(resultSet).getTimestamp("CREATED_AT");
        doReturn(null, Timestamp.valueOf("2025-06-11 10:00:00"))
                .when(resultSet).getTimestamp("UPDATED_AT");

        List<TaskMapper> tasks = taskRepository.getAllTasks();

        assertThat(tasks).hasSize(2);

        TaskMapper t1 = tasks.get(0);
        assertThat(t1.getTaskId()).isEqualTo(100L);
        assertThat(t1.getTitle()).isEqualTo("Comprar leche");
        assertThat(t1.getCompleted()).isFalse();
        assertThat(t1.getCreatedAt()).isEqualTo(LocalDateTime.of(2025, 6, 10, 14, 30));
        assertThat(t1.getUpdatedAt()).isNull();

        TaskMapper t2 = tasks.get(1);
        assertThat(t2.getTaskId()).isEqualTo(101L);
        assertThat(t2.getCompleted()).isTrue();
    }

    @Test
    @DisplayName("getAllTasks → propaga RuntimeException cuando falla la llamada")
    void getAllTasks_throwsRuntimeOnSQLException() throws SQLException {
        when(connection.prepareCall(anyString())).thenThrow(new SQLException("ORA-12345: fallo simulado"));

        assertThatThrownBy(() -> taskRepository.getAllTasks())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error al obtener tareas")
                .hasCauseInstanceOf(SQLException.class);
    }

    // ───────────────────────────────────────────────
    // getTaskById()
    // ───────────────────────────────────────────────

    @Test
    @DisplayName("getTaskById → retorna null cuando no existe el registro")
    void getTaskById_notFound_returnsNull() throws SQLException {
        when(connection.prepareCall(anyString())).thenReturn(callableStatement);
        when(callableStatement.getObject(2)).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false);

        TaskMapper task = taskRepository.getTaskById(999L);

        assertThat(task).isNull();

        verify(callableStatement).setLong(1, 999L);
        verify(callableStatement).registerOutParameter(2, OracleTypes.CURSOR);
    }

    @Test
    @DisplayName("getTaskById → mapea correctamente todos los campos incluyendo timestamps")
    void getTaskById_mapsFullTask() throws SQLException {
        when(connection.prepareCall(anyString())).thenReturn(callableStatement);
        when(callableStatement.getObject(2)).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true);

        doReturn(42L).when(resultSet).getLong("TASK_ID");
        doReturn("Terminar tests").when(resultSet).getString("TITLE");
        doReturn("Cobertura > 90%").when(resultSet).getString("DESCRIPTION");
        doReturn(1).when(resultSet).getInt("COMPLETED");
        doReturn(Timestamp.valueOf("2025-03-01 08:00:00")).when(resultSet).getTimestamp("CREATED_AT");
        doReturn(Timestamp.valueOf("2025-03-05 18:45:00")).when(resultSet).getTimestamp("UPDATED_AT");

        TaskMapper task = taskRepository.getTaskById(42L);

        assertThat(task).isNotNull();
        assertThat(task.getTaskId()).isEqualTo(42L);
        assertThat(task.getCompleted()).isTrue();
        assertThat(task.getUpdatedAt()).isEqualTo(LocalDateTime.of(2025, 3, 5, 18, 45));
    }

    // ───────────────────────────────────────────────
    // createTask()
    // ───────────────────────────────────────────────

    @Test
    @DisplayName("createTask → retorna el ID generado y envía parámetros correctamente")
    void createTask_returnsGeneratedId() throws SQLException {
        Task task = new Task();
        task.setTitle("Nueva tarea");
        task.setDescription("Descripción importante");

        when(connection.prepareCall(anyString())).thenReturn(callableStatement);
        when(callableStatement.getLong(3)).thenReturn(777L);

        Long generatedId = taskRepository.createTask(task);

        assertThat(generatedId).isEqualTo(777L);

        verify(callableStatement).setString(1, "Nueva tarea");
        verify(callableStatement).setString(2, "Descripción importante");
        verify(callableStatement).registerOutParameter(3, Types.NUMERIC);
        verify(callableStatement).execute();
    }

    // ───────────────────────────────────────────────
    // updateTask()
    // ───────────────────────────────────────────────

    @Test
    @DisplayName("updateTask → convierte boolean a 1/0 correctamente")
    void updateTask_completedBooleanToInt() throws SQLException {
        Task task = new Task();
        task.setTaskId(88L);
        task.setTitle("Tarea actualizada");
        task.setCompleted(true);

        when(connection.prepareCall(anyString())).thenReturn(callableStatement);

        taskRepository.updateTask(task);

        verify(callableStatement).setInt(4, 1);

        // Caso false
        task.setCompleted(false);
        taskRepository.updateTask(task);

        verify(callableStatement, times(2)).setInt(eq(4), intCaptor.capture());
        assertThat(intCaptor.getAllValues()).containsExactly(1, 0);
    }

    // ───────────────────────────────────────────────
    // deleteTask()
    // ───────────────────────────────────────────────

    @Test
    @DisplayName("deleteTask → llama al procedimiento con el id correcto")
    void deleteTask_callsProcedure() throws SQLException {
        when(connection.prepareCall(anyString())).thenReturn(callableStatement);

        taskRepository.deleteTask(555L);

        verify(callableStatement).setLong(1, 555L);
        verify(callableStatement).execute();
    }

    @Test
    @DisplayName("deleteTask → lanza excepción cuando falla la BD")
    void deleteTask_throwsOnSQLException() throws SQLException {
        when(connection.prepareCall(anyString())).thenThrow(new SQLException("ORA-02292: integridad referencial"));

        assertThatThrownBy(() -> taskRepository.deleteTask(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Error al eliminar la tarea");
    }
}