create table semester_4(
reg_no varchar(30)primary key,foreign key(reg_no)references student (reg_no),
obtained_mark int not null,
total_mark int not null ,
per float default(obtained_mark/total_mark*100),
gpa float default(per/100*4));
insert into semester_4(reg_no,obtained_mark,total_mark)values
("2019-UOBS-582",567,600),("2019-UOBS-583",567,600),("2019-UOBS-111",543,600),
("2019-UOBS-580",465,600),("2019-UOBS-568",553,600),("2019-UOBS-581",345,600);
