create database Uni;
use uni;
create table university(
serial_no int not null auto_increment unique,
enroll_no varchar(30)primary key);
create table student(
reg_no varchar(30)primary key,foreign key(reg_no)references university(enroll_no),
name varchar(30)not null,
fname varchar(30)not null,
date_of_joinning date);
