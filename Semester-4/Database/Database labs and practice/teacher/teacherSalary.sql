CREATE TABLE t_salary_detail (
    id_no VARCHAR(30),
    month_no INT NOT NULL CHECK(month_no <= 12 AND month_no >= 1),
    total_salary INT NOT NULL,
    FOREIGN KEY (id_no) REFERENCES teacher(id_no)
);
INSERT INTO t_salary_detail VALUES
('t_id_1', 1, 37000),('t_id_1', 2, 38000),('t_id_1', 3, 39000),
 ('t_id_2', 1, 23466), ('t_id_2', 2, 65444), ('t_id_2', 3, 39000), 
('t_id_3', 1, 123123), ('t_id_3', 2, 22425), ('t_id_3', 3, 23453),
 ('t_id_4', 1, 23423), ('t_id_4', 2, 32457), ('t_id_4', 3, 23452);
 
 select * from t_salary_detail;
