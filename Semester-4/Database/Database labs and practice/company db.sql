create database company;
use company;
create table employee
(
id int not null  unique auto_increment,
name varchar(100) not null ,
fname varchar(100) not null,
dob date,
gender enum("m","f","o"),
city varchar(100),
designation enum("HR","manager","CEO","developer"),
status boolean default 1,
primary key(id)
);
use company;
insert into employee values
(2,"Sakina","ali","1990-10-21",'f','baltistan','HR',1);

select * from employee;

insert into employee values
(4,"khatija",'ali',"2016-01-20",'f',"Gound","CEO",1);


select * from employee;
insert into employee values
(5,"Muhammad","Ali","2007-12-31",'m','GB',"HR",1);
select * from employee;


select * from employee where id=3;
select * from employee where id>=2;
select * from employee where id>=3 and id<=4;

select * from employee where id=1 or name="sakina";

select * from employee where id in(1,4,2);

select * from employee where name like "b%";
select * from employee where fname like "_p%";
select * from employee where city like "__s%";
select * from employee;
select * from employee where city like "_a%";
use company;

select * from  employee where id between 3 and 5;