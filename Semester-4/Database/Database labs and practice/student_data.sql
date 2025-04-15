create database student_data;
use student_data;
create table  student_profile
(
s_rollno int not null unique,
s_name varchar(100),
s_email varchar(150),
s_marks integer,
s_department varchar(100)
);
insert into student_profile values
(1,"Basit Ali","Basit@gmail.com",12,"Computer Science"),
(2,"Muhammad ali","Muhammad@gmail.com",56,"English"),
(3,"Sakina Batool","Sakina@gmail.com",90,"Zoology"),
(4,"Kubra Batool","Kubra@gmail.com",63,"Education"),
(5,"Khatija Batool","Khatija@gmail.com",45,"BBA");

select * from student_profile;

insert into student_profile values
(6,"Ali","Ali@gmail.com",58,"SE"),
(7,"Safia","Safia@gmail.com",34,"SE"),
(8,"Marzia","marzia@gmail.com",64,"SE");

update student_profile set s_department="AI" where s_rollno=1 or s_rollno=2;

select * from student_profile;


select s_email from student_profile where s_marks<55 or s_marks>66;

select s_name as Student_Name ,s_marks as Student_marks from student_profile order by Student_marks asc;

create table Employee
(
ename varchar(100),
ecity text
);

insert into Employee values
("Basit Ali","Skardu"),
("Muhammad","Khapulo"),
("Sakina","Kharmang"),
("Ali","Astor"),
("Safia","Gilgit"),
("Khadija","Skardu"),
("kubra","Kharmang"),
("Marzia","Astor");

select * from Employee;

select distinct ecity as Employee_City from Employee order by ecity asc;












