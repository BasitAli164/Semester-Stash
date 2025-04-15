CREATE TABLE w_attendance_detail (
    id_no VARCHAR(30),
    FOREIGN KEY (id_no) REFERENCES worker(id_no),
    a_date DATETIME NOT NULL DEFAULT NOW()
);
INSERT INTO w_attendance_detail (id_no) VALUES
    ('w_id_1'),('w_id_2'),
    ('w_id_3'),('w_id_4');
select * from w_attendance_detail;
