create table semester_2(
reg_no varchar(30)primary key,foreign key(reg_no)references student (reg_no),
obtained_mark int not null,
total_mark int not null ,
per float default(obtained_mark/total_mark*100),
gpa float default(per/100*4));
insert into semester_2(reg_no,obtained_mark,total_mark)values
("2019-UOBS-582",470,600),("2019-UOBS-583",556,600),("2019-UOBS-580",345,600),
("2019-UOBS-111",343,600),("2019-UOBS-561",453,600),("2019-UOBS-568",543,600),("2019-UOBS-567",543,600);
