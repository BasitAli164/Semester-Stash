use college;
drop table student;
create table City(
id int not null unique auto_increment,
cityName text,
primary key(id)
);

create table student
(
id int not null unique auto_increment,
name varchar(100),
age int ,
city int not null,
primary key(id),
foreign key(city) references City(id)
);

insert into City values
(1,"Skardu"),(2,"Gilgit"),(3,"Astor");
insert into City values
(4,"Khapuloo"),(5,"Skardu"),(6,"Skardu");
select * from City;
insert into student values
(1,"Basit",23,2),
(2,"Muhammad",18,4),
(3,"Sakina",13,3);
select * from student;
insert into student values (4,"kubra",10,5);

select * from student inner join City on student.city=City.id;
select * from student join City on student.city=City.id;