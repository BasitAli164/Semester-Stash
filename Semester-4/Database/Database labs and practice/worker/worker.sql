use school;
CREATE TABLE worker (
    id_no VARCHAR(30) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    fathername VARCHAR(30) NOT NULL,
    age INT CHECK (age >= 25),
    c_no VARCHAR(11) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female'))
);
INSERT INTO worker (id_no, name, fathername, age, c_no, gender) VALUES
    ('w_id_1', 'Fida Ali', 'Ali', 25, '12334', 'Male'),
    ('w_id_2', 'Usman Ali', 'Muhammad Yaqoob', 30, '12334', 'Male'),
    ('w_id_3', 'Jameel', 'Afzal Jameel', 28, '45642', 'Male'),
    ('w_id_4', 'Qurban Ali', 'Ali Jan', 31, '4545', 'Male');
select * from worker;
