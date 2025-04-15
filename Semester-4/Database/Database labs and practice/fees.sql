CREATE TABLE s_fees_detail (
    id_no VARCHAR(30),
    FOREIGN KEY (id_no) REFERENCES student(id_no),
    month_no INT NOT NULL CHECK (month_no <= 12 AND month_no >= 1),
    total_amount INT NOT NULL
);
INSERT INTO s_fees_detail VALUES
('s_id_1', 1, 12000), ('s_id_1', 2, 34000), ('s_id_1', 3, 34200),
('s_id_2', 1, 12000), ('s_id_2', 2, 34000), ('s_id_2', 3, 34200),
('s_id_3', 1, 12000), ('s_id_3', 2, 34000), ('s_id_3', 3, 34200),
('s_id_4', 1, 12000), ('s_id_4', 2, 34000), ('s_id_4', 3, 34200);

select * from  s_fees_detail;
