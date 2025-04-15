create database school;
use school;
create table teacher
(
id int not null unique ,
name varchar(100) not null,
age tinyint check (age>17) not null,
gender enum ('m','f','o'),
phoneNumber integer(15) not null 

);
insert into teacher values
(1,"Basit Ali",20,'m',034194689),
(2,"Muhammad Ali",19,'m',034754955),
(3,"Sakina Batool",25,'f',034051418),
(4,"Kubra Batool",22,'f',035552866),
(5,"Khatija Batool",23,'f',035542141);
insert into teacher values 
(6,"Ali",45,'m',1234567890),
(7,"safia",40,'f',132547698);
select * from teacher;
select id ,name as teacherName from teacher;
select * from teacher where id>2;
select id from teacher where id<5;
select * from teacher where age>2 && age<22;
select * from teacher where age>23 || age<10;
select * from teacher where not age>=23;
select * from teacher where age in(20,23,21,19);
select * from teacher where name like "b%";
select * from teacher where name like "b_s%";
select * from teacher where name like "%l";
select * from teacher where name like "__s%";
select * from teacher where name like "A%_i";
select * from teacher where name like "__k%i";
select * from teacher where name like "%s%";
select * from teacher where name like "s%a";
select * from teacher where age between 20 and 30;
select * from teacher where age not between 10 and 30;
select * from teacher where age between 30 and 50;

use school;
select * from teacher;
select * from teacher order by  age asc;
select * from teacher order by name desc;
select distinct age from teacher;
insert into teacher values
(8,"Sibtain",20,'m',3243243),
(9,"Hassnain",22,'m',43434);
select * from teacher;
select distinct gender from teacher;
select distinct age from teacher;
select distinct age from teacher order by age asc;
select count(age) from teacher where age>30;
select count(age) from teacher where age>20;
select sum(age) from teacher;
select min(age) from teacher;
select max(age) from teacher;
select avg(age) from teacher;
select count(age) from teacher;
select * from teacher;
select * from teacher limit 3;
select * from teacher limit 2 offset 5;
select * from teacher limit 4 offset 2;
select * from teacher limit 3 offset 6;
