### Schema
CREATE DATABASE employeeManagement_db;
USE employeeManagement_db;

CREATE TABLE department
(
	id int NOT NULL AUTO_INCREMENT,
	department_name varchar(30) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE role
(
	id int NOT NULL AUTO_INCREMENT,
	title varchar(30) NOT NULL,
	salary decimal(10, 2) NOT NULL,
	department_id int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee
(
	id int NOT NULL AUTO_INCREMENT,
	first_name varchar(30) NOT NULL,
	last_name varchar(30) NOT NULL,
    role_id int NOT NULL,
    manager_id int,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);