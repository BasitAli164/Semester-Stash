create database school;
use school;
create table record(
    enrollment_no varchar(30) primary key
);
INSERT INTO record (enrollment_no)
VALUES
    ("t_id_1"),("t_id_2"),("t_id_3"),("t_id_4"), 
    ("s_id_1"), ("s_id_2"),("s_id_3"),("s_id_4"),
    ("w_id_1"),("w_id_2"),("w_id_3"),("w_id_4");
select * from record;
