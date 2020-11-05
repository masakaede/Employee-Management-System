const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Masakaede19&&",
    database: "employeeManagement_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

function start() {
    inquirer
        .prompt({
            name: "start",
            type: "list",
            message: "what would you like to do?",
            choices: [
                "View All Employees",
                "View All Employees By Department",
                "View All Employees By Manager",
                "Add Employee",
                "Remove Employee",
                "Update Employee Role",
                "Update Employee Manager",
                "View All Roles",
                "Add Role",
                "Remmove Role"
            ]
        }).then(function (answer) {
            switch (answer) {
                case "View All Employees":
                    viewAllEmployees()
                    break;
                case "View All Employees By Department":
                    viewAllEmployeesByDepartment()
                    break;
                case "View All Employees By Manager":
                    viewAllEmployeesByManager()
                    break;
                case "Add Employee":
                    addEmployee()
                    break;
                case "Remove Employee":
                    removeEmployee()
                    break;
                case "Update Employee Role":
                    updateEmployeeRole()
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager()
                    break;
                case "View All Roles":
                    viewAllRoles()
                    break;
                case "Add Role":
                    addRole()
                    break;
                case "Remmove Role":
                    removeRole()
            }
        })
}

