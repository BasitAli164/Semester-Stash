create database university;
use university;
create table student
(
id int unique not null ,
name varchar(100),
fName varchar(100),
age int check(age>18),
gender enum('m','f','o'),
address text ,
dob date,
fee integer,
attendence boolean default  0
);

insert into student values
(1,"Basit Ali","Ali",20,'m',"Skardu","2005-11-11",22800,0),
(2,"Muhammd Ali","Ali",19,'m',"Gilgit","2007-03-01",20800,0),
(3,"Anmool Zehra","Zahid",21,'f',"Skardu","2009-03-01",21800,1),
(4,"Toqeer ","Ghulam",24,'m',"Kharmang","2009-03-01",10800,0),
(5,"Shahid Hussain","Muhammad Hussain",23,'m',"Khapulo","2004-03-01",22800,0),
(6,"Zeeshan Haider","Fida Hussain",23,'m',"Roundu","2002-03-01",29800,1),
(7,"Amin","Hassan",28,'f',"Kharmang","2009-03-01",24800,0),
(8,"Khadija Batool ","Ali",28,'f',"Skardu","2005-03-01",22800,1),
(9,"Safia","Hassan Ali",30,'f',"Skardu","1985-03-01",25800,0),
(10,"Kubra Batool",20,'m',"Skardu","2005-03-11",22800),
(11,"Ali","Zaman",'m',"Skardu","1975-03-01",18800,1),
(12,"Sadaqat ","Ali hussain",20,'m',"Khapulo","2005-03-01",22800,0),
(13,"Kumail","Muhammad Abbas",25,'m',"Shigar","2003-03-01",27800,1),
(14,"Shazia Kazim","Kazim Ali",26,'m',"shigar","2005-03-01",26800,1),
(15,"Kaniz fatima","Muhammad",27,'m',"Skardu","1990-03-01",33800,0);
use university;
select * from student;
select id from student;
select id, name,age from student;
select id from student where id>4;
select * from student where id>5;
select * from student where id=7;
select * from student where id<2;
select * from student where id<=5;
select * from student where id>=13;
select * from student where id>=2 and id<=8;
select * from student where id=2 and id=9; -- this is wrong because you check only on id not two--  
select * from student where id=2 or id=4;
select * from student where id=2 or id=20;
select * from student where  not id=4;
select * from student where not id>=13;
select * from student where not id<=12;
select * from student where id in(2,4,6);
select * from student where age in(20,19,25);
select * from student where name like "a%";
select * from student where name like "__i%";
select * from student where fee like "_1_0%0";
select * from student where age like "2%";
select * from student where age between 21 and 23;
select * from student where age not between 10 and 23;
select * from student order by age asc;
select * from student order by name desc;
select distinct  age from student   ;
select distinct age from student order by age asc;
select * from student limit 5;
select * from student limit 2 offset 5;
select * from student limit 5 offset 9;
select * from student order by age desc;
select distinct age from student order by age asc;
select * from student limit 4 offset 5;
use university;
select count(id) from student where fee>24000;
select count(id) from student;
select count(age) from student where age>23;
select * from student;
select count(gender) from student where gender="f";
select sum(fee) from student ;
select sum(fee) from student where fee>24000;
select sum(fee) from student where fee>20000 and fee<22000;
select avg(fee) from student;
select avg(fee) from student where fee>25000;
select max(fee) from student;
select max(fee) from student where fee<21000;
select min(fee) from student;
select min(fee) from student where fee>20000 and fee<25000;
update student set age=345 where id=2;
select * from student;
 update student set name="Ali Hussain" where id=2;
delete from student where id=2;
rollback;
update student set name="Hassnain" where id=4;
delete from student where id=9;
update student set name="Ali Hussain " where id =1;
delete from student where id=1;
update student set age=90 where id=7;
insert into student values (
9,"Basit ","ali",44,'m','khapulo','2008-08-23',44345,0
);
update student set name="sakina" where id=2;
select * from student;
delete from student where id=2;
update student set age=909 where id=3;





