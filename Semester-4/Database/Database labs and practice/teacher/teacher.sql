use school;
CREATE TABLE teacher (
    id_no VARCHAR(30) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    fathername VARCHAR(30) NOT NULL,
    age INT CHECK(age >= 25),
    c_no VARCHAR(11) NOT NULL,
    gender VARCHAR(10) CHECK(gender IN ('Male', 'Female'))
);
INSERT INTO teacher VALUES
('t_id_1', 'Muhammad Fida', 'Fida Ali', 25, '12334', 'Male'),
('t_id_2', 'Jamshad Khan', 'Muhammad Yaqoob', 30, '12334', 'Male'),
('t_id_3', 'Yasmeen Jameel', 'Afzal Jameel', 28, '456462', 'Female'),
('t_id_4', 'Ahmed Ali', 'Ali Jan', 31, '4545', 'Male');

select * from teacher;
