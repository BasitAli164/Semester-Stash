CREATE TABLE w_salary_detail (
    id_no VARCHAR(30),
    FOREIGN KEY (id_no) REFERENCES worker(id_no),
    month_no INT NOT NULL CHECK (month_no <= 12 AND month_no >= 1),
    total_salary INT NOT NULL
);
INSERT INTO w_salary_detail (id_no, month_no, total_salary) VALUES
    ('w_id_1', 1, 22222),('w_id_2', 1, 34000),('w_id_3', 1, 34522),('w_id_4', 1, 22303),
    ('w_id_1', 2, 31222),('w_id_2', 2, 34000),('w_id_3', 2, 34522),('w_id_4', 2, 22303),
    ('w_id_1', 3, 22222),('w_id_2', 3, 34000),('w_id_3', 3, 34522),('w_id_4', 3, 22303),
    ('w_id_1', 4, 24324),('w_id_2', 4, 34400),('w_id_3', 4, 34522),('w_id_4', 4, 22303);
select * from w_salary_detail;
