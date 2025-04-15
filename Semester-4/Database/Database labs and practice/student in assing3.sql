CREATE TABLE student (
    id_no VARCHAR(30) PRIMARY KEY,
    FOREIGN KEY (id_no) REFERENCES record(enrollment_no),
    name VARCHAR(30) NOT NULL,
    fathername VARCHAR(30) NOT NULL,
    dob DATE,
    contact_no VARCHAR(11) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female'))
);
INSERT INTO student VALUES
('s_id_1', 'Irfan Ali', 'Rehmat Ali', '2002-10-24', '12334', 'Male'),
('s_id_2', 'Bahadur Ali', 'Rehmat Ali', '2002-10-24', '12334', 'Male'),
('s_id_3', 'Shahnawaz Ali', 'Muhammad Salman', '1999-07-21', '3456345', 'Male'),
('s_id_4', 'Alina Ahmed', 'Ahmed Hassan', '1998-10-24', '4545', 'Female');

select * from student;

