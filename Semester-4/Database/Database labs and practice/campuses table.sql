use UOBS;
create table Campuses
(
id int unique not null,
c_name varchar(200) not null,
c_location text not null,
c_incharge varchar(100) not null 
); 
select * from Campuses;

insert into Campuses values
(1,"Main","Hussian-Abad","404 error"),
(2,"Anchan","Olding","Imtiaz Ahmed"),
(3,"City","Hassan coloni Chowk","404 error"),
(4,"Sundus","Sundus ","404 error");

select * from Campuses;

