create table final_degree(
reg_no varchar(30)unique not null,
foreign key(reg_no) references semester_1(reg_no),
foreign key(reg_no) references semester_2(reg_no),
foreign key(reg_no) references semester_3(reg_no),
foreign key(reg_no) references semester_4(reg_no),
foreign key(reg_no) references semester_5(reg_no),
foreign key(reg_no) references semester_6(reg_no),
foreign key(reg_no) references semester_7(reg_no),
foreign key(reg_no) references semester_8(reg_no),
passing_out_date datetime default (now()),
university_name varchar(100) not null default"University Of Baltistan Skardu"
);
insert into final_degree(reg_no)values
("2019-UOBS-111"),("2019-UOBS-580"),("2019-UOBS-582"),("2019-UOBS-583"),("2019-UOBS-568");
