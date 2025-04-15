CREATE TABLE t_attendance_detail (
    id_no VARCHAR(30),
    a_date DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_no) REFERENCES teacher(id_no)
);
INSERT INTO t_attendance_detail (id_no) VALUES
('t_id_1'),('t_id_2'),('t_id_3'),('t_id_4');

select * from t_attendance_detail;

