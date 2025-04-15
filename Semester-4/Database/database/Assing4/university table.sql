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
create table stu_result_detail(
reg_no varchar(30)primary key,foreign key(reg_no)references student(reg_no),
semester_no int,
gpa int,
cgpa int);
create table stu_fees_detail(
reg_no varchar(30)primary key,foreign key(reg_no)references student(reg_no),
month_no int not null check(month_no >=1  && month_no <=12),
total_amount int);
create table teacher(
enroll_no varchar(30)primary key,foreign key(enroll_no)references university(enroll_no),
name varchar(30)not null,
fname varchar(30)not null,
joinning_date date,
age int not null check(age>=20));
create table tea_salary_detail(
enroll_no varchar(30)primary key,foreign key(enroll_no)references teacher(enroll_no),
month_no int not null check(month_no>=1 && month_no <=12),
total_salary int);
create table tea_offer_course(
enroll_no varchar(30) primary key,foreign key(enroll_no)references teacher(enroll_no),
course_name varchar(30) not null,
semester_no int,
department varchar(20));

