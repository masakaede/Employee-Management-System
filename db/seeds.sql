INSERT INTO department (department_name) VALUES ("Sales");
INSERT INTO department (department_name) VALUES ("Engineering");
INSERT INTO department (department_name) VALUES ("Finance");
INSERT INTO department (department_name) VALUES ("Legal");

INSERT INTO role (title, salary, department_id) VALUES ("Sales Lead", 100000, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Salesperson", 80000, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Lead Engineer", 150000, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Software Engineer", 120000, 2);
INSERT INTO role (title, salary, department_id) VALUES ("Account Manager", 150000, 3);
INSERT INTO role (title, salary, department_id) VALUES ("Accountant", 125000, 3);
INSERT INTO role (title, salary, department_id) VALUES ("Legal Team Lead", 250000, 4);
INSERT INTO role (title, salary, department_id) VALUES ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Troy","Grigg", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Raymond", "Brown", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Stella", "Smith", 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Kai", "Wang", 4, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Greg", "Shaw", 4,3);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Lubi", "Watson", 4,3);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Bill", "Gates", 5, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Riley", "Cresswell",6,7);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Libby", "Chang", 7, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Jerry", "Ito", 8 , 9);

select * from department;
select * from employee;
select * from role;
