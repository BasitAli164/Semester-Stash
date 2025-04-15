use UOBS;
create table Students
(
std_id int not null unique,
std_name varchar(100),
std_email varchar(80),
std_address text,
std_department varchar(150)
);
select * from Students;

insert into students values
(1,"Basit Ali","Basit@gmail.com","Skardu","Computer Science"),
(2,"Muhammad ali","Muhammad@gmail.com","Gilgit","English"),
(3,"Sakina Batool","Sakina@gmail.com","Khapulo","Zoology"),
(4,"Kubra Batool","Kubra@gmail.com","Kharmang","Education"),
(5,"Khatija Batool","Khatija@gmail.com","Shigar","BBA");

select * from students;


delete   from students where std_id=5;


select * from students;

update students set std_name="Irfan" where std_id=3;

select * from students;









