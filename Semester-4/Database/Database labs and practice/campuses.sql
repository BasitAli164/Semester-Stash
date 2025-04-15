use UOBS;
create table Campuses
(
id int unique not null,
c_name varchar(200) not null,
c_location text not null,
c_incharge varchar(100) not null 
); 
select * from Campuses;
