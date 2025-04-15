create table student(
reg_no varchar(30)primary key,
name varchar(30)not null,
fname varchar(30)not null,
gender varchar(10)not null,
age int check(age>=18)not null);


insert into student values(
"2019-uobs-583","Irfan Ali","Rehmat Ali","Male",19),("2019-uobs-582","Bahadur Ali","Rehmat Ali","Male",23),
("2019-uobs-510","Sajjad Ali","M Hussain","Male",20),("2019-uobs-580","Alima Ali"," Ali Khan","Female",19),
("2019-uobs-511","Jameel Ahmed","Yaqoob qurashi","Male",25),("2019-uobs-568","Shahnawz Ali","Salman Ali","Male",24),
("2019-uobs-575","Murtaza Ali","Rehmat Ali","Male",26),("2019-uobs-500","Munawar Ali","Abbas Ali","Male",19);
select * from student;
