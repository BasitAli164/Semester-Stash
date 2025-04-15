create database university;
use university;
create table student
(
id int not null unique check (id>=0),
name varchar(100) not null,
email varchar(100) not null unique,
phoneNo integer(20),
address text,
dob date,
gender enum('m','f','o'),
status boolean
);
select * from student;

insert into student values 
(1,"Basit","Basit@gmail.com",03419468,"Kushmarah Gound","2005-03-01",'m',1);
insert into student values (2,"Muhammad ali","muhammad@gmail.com",1234567890,"Gound","2007-01-01",'m',0);
insert into student values (-0,"Kubra Batool","Kubra@gmail.com",1234567890,"Skardu","2018-02-14",'f',1);
select * from student;
insert into student values
(3,"Sakina Batool","Sakina@gmail.com",343434,"Nanooo","2010-10-23",'f',0),
(4.3,"Khatija Batool", "Khatija@gamil.com",34431,"Gound la","2030-12-30",'f',1);
select * from student where address="Skardu";
select * from student where id>1 and id<=3;
select * from student where not id>=3;
select * from student where id=1 or id=2;
select * from student where id in(2,4,0);
select * from student where name like "%l";
select * from student where dob between "2006-01-01" and "2012-12-12";
select * from student where dob not between "2006-01-01" and "2012-12-12";
select * from student order by status desc;
select * from student order by status asc;
select * from student order by id asc;
select distinct status from student ;
select distinct status from student order by status asc;

select * from student limit 2 offset 2;
select * from student limit 3 offset 3;
select * from student order by id desc limit 2 offset 1;

select * from student;
select count(id) from student where status=1;
select sum(id) from student where status=1;
select avg(id) from student;
select sum(id) from student;
select count(id) from student;
select max(id) from student where status=1;
select min(id) from student where status=0;
update student set name="Apo ali" where id=1;
update student set status=4 where id=1;
update student set status=2 where id>2;
delete from student where id=1;