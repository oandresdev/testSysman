/* ============================================================
 TABLA TASKS
============================================================ */

CREATE TABLE TASKS (
    TASK_ID     NUMBER PRIMARY KEY,
    TITLE       VARCHAR2(100) NOT NULL,
    DESCRIPTION VARCHAR2(4000),
    COMPLETED   NUMBER(1,0) DEFAULT 0 NOT NULL,
    CREATED_AT  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    UPDATED_AT  TIMESTAMP
);


/* ============================================================
  SECUENCIA
============================================================ */

CREATE SEQUENCE TASK_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;


/* ============================================================
  TRIGGER PARA AUTO-GENERAR TASK_ID
============================================================ */

CREATE OR REPLACE TRIGGER TRG_TASKS_BI
BEFORE INSERT ON TASKS
FOR EACH ROW
BEGIN
    IF :NEW.TASK_ID IS NULL THEN
        SELECT TASK_SEQ.NEXTVAL
        INTO :NEW.TASK_ID
        FROM DUAL;
    END IF;
END;
/


/* ============================================================
 TRIGGER PARA UPDATED_AT
============================================================ */

CREATE OR REPLACE TRIGGER TRG_TASKS_BU
BEFORE UPDATE ON TASKS
FOR EACH ROW
BEGIN
    :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/


/* ============================================================
 PACKAGE SPEC
============================================================ */

CREATE OR REPLACE PACKAGE TASK_PKG AS

    PROCEDURE GET_ALL_TASKS (
        p_cursor OUT SYS_REFCURSOR
    );

    PROCEDURE GET_TASK_BY_ID (
        p_task_id IN TASKS.TASK_ID%TYPE,
        p_cursor  OUT SYS_REFCURSOR
    );

    PROCEDURE CREATE_TASK (
        p_title       IN TASKS.TITLE%TYPE,
        p_description IN TASKS.DESCRIPTION%TYPE,
        p_task_id     OUT TASKS.TASK_ID%TYPE
    );

    PROCEDURE UPDATE_TASK (
        p_task_id     IN TASKS.TASK_ID%TYPE,
        p_title       IN TASKS.TITLE%TYPE,
        p_description IN TASKS.DESCRIPTION%TYPE,
        p_completed   IN TASKS.COMPLETED%TYPE
    );

    PROCEDURE DELETE_TASK (
        p_task_id IN TASKS.TASK_ID%TYPE
    );

END TASK_PKG;
/


/* ============================================================
 PACKAGE BODY
============================================================ */

CREATE OR REPLACE PACKAGE BODY TASK_PKG AS

    PROCEDURE GET_ALL_TASKS (
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT *
            FROM TASKS
            ORDER BY CREATED_AT DESC;
    END GET_ALL_TASKS;


    PROCEDURE GET_TASK_BY_ID (
        p_task_id IN TASKS.TASK_ID%TYPE,
        p_cursor  OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT *
            FROM TASKS
            WHERE TASK_ID = p_task_id;
    END GET_TASK_BY_ID;


    PROCEDURE CREATE_TASK (
        p_title       IN TASKS.TITLE%TYPE,
        p_description IN TASKS.DESCRIPTION%TYPE,
        p_task_id     OUT TASKS.TASK_ID%TYPE
    ) IS
    BEGIN
        INSERT INTO TASKS (TITLE, DESCRIPTION)
        VALUES (p_title, p_description)
        RETURNING TASK_ID INTO p_task_id;
    END CREATE_TASK;


    PROCEDURE UPDATE_TASK (
        p_task_id     IN TASKS.TASK_ID%TYPE,
        p_title       IN TASKS.TITLE%TYPE,
        p_description IN TASKS.DESCRIPTION%TYPE,
        p_completed   IN TASKS.COMPLETED%TYPE
    ) IS
    BEGIN
        UPDATE TASKS
        SET TITLE       = p_title,
            DESCRIPTION = p_description,
            COMPLETED   = p_completed
        WHERE TASK_ID = p_task_id;
    END UPDATE_TASK;


    PROCEDURE DELETE_TASK (
        p_task_id IN TASKS.TASK_ID%TYPE
    ) IS
    BEGIN
        DELETE FROM TASKS
        WHERE TASK_ID = p_task_id;
    END DELETE_TASK;

END TASK_PKG;
/
