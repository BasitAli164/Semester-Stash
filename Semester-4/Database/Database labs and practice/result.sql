CREATE TABLE s_result_detail (
    id_no VARCHAR(30),
    FOREIGN KEY (id_no) REFERENCES student(id_no),
    exam_name VARCHAR(30) NOT NULL,
    total_marks INT CHECK (total_marks >= 1),
    obtained_marks INT,
    percentage INT DEFAULT ((obtained_marks / total_marks) * 100)
);
INSERT INTO s_result_detail (id_no, exam_name, total_marks, obtained_marks) VALUES
('s_id_1', 'Mid-Term', 500, 350),
('s_id_1', 'Final-Term', 500, 400),
('s_id_2', 'Mid-Term', 500, 432),
('s_id_2', 'Final-Term', 500, 345),
('s_id_3', 'Mid-Term', 500, 345),
('s_id_3', 'Final-Term', 500, 345),
('s_id_4', 'Mid-Term', 500, 345),
('s_id_4','Final-Term',500,342);

select * from s_result_detail;
