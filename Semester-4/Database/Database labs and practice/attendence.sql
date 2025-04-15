CREATE TABLE s_attendance_detail (
    id_no VARCHAR(30),
    FOREIGN KEY (id_no) REFERENCES student(id_no),
    a_date DATETIME NOT NULL DEFAULT NOW()
);
INSERT INTO s_attendance_detail (id_no) VALUES
('s_id_1'), ('s_id_2'), ('s_id_3'), ('s_id_4');

select * from  s_attendance_detail;

