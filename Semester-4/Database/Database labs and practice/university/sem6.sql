create table semester_6(
reg_no varchar(30)primary key,foreign key(reg_no)references student (reg_no),
obtained_mark int not null,
total_mark int not null ,
per float default(obtained_mark/total_mark*100),
gpa float default(per/100*4));
insert into semester_6(reg_no,obtained_mark,total_mark)values
("2019-UOBS-582",453,600),("2019-UOBS-583",564,600),
("2019-UOBS-111",564,600),("2019-UOBS-580",342,600),("2019-UOBS-568",345,600);
