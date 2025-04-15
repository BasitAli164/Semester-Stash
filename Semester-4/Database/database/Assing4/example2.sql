create database example_2;
use example_2;
create table student(
reg_no varchar(20)primary key,
name varchar(30),
fname varchar(30));
create table subject(
sub_id int primary key,
sub_name varchar(30));
create table help(
id int,foreign key(id)references subject(sub_id),
stu_reg_no varchar(30),foreign key(stu_reg_no) references student(reg_no));
