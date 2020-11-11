const inquirer = require("inquirer");
const { connect } = require("./lib/connection");
const connection = require("./lib/connection");

//available roles
var roleList = [];
connection.query("SELECT title FROM role", function (err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
        roleList.push(results[i].title)
    }
    return roleList;
});

//manager list
var managerList;
var managerRoleId = [];
var managerNameList = [];
var managerOptions = [];
function getManagerList() {
    connection.query("SELECT * FROM role WHERE title = 'Sales Lead' OR title = 'Lead Engineer' OR title = 'Account manager' OR title = 'Legal Team Lead'", function (err, results) {
        if (err) throw err;

        // find out the role id of each manager positions
        managerRoleId = [];
        for (const { id: n } of results) {
            managerRoleId.push(n)
        };

        //find out who are the managers
        var sql = `SELECT * FROM employee WHERE role_id IN (${managerRoleId})`;
        connection.query(sql, function (err, results) {
            if (err) throw err;
            managerNameList = [];
            managerOptions = [];
            managerList = results;
            for (var i = 0; i < managerList.length; i++) {
                managerNameList.push(managerList
                [i].first_name + " " + managerList[i].last_name)
            };
            managerOptions = [...managerNameList];
            managerOptions.push("null")
        })
    })
}

//employee list
var employeeList;
var employeeNameList = [];
function getEmployeeList() {
    connection.query("SELECT * FROM employee", function (err, results) {
        //console.log(45)
        //console.log(results)
        if (err) throw err;
        employeeNameList = [];
        employeeList = results;
        for (var i = 0; i < employeeList.length; i++) {
            employeeNameList.push(employeeList[i].first_name + " " + employeeList[i].last_name)
        };
        //console.log(employeeNameList)
        return employeeNameList;
    })
}

userInput()

//main menu
function mainMenu() {
    return inquirer
        .prompt([
            {
                name: "menu",
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
                    "Exit"
                ]
            }
        ])
};

//prompt for input
async function userInput() {
    await getEmployeeList();
    await getManagerList();


    const { menu } = await mainMenu();
    switch (menu) {
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
        case "Exit":
            connection.end()
            break;
    }
}

//function text validation
function textValidation(input) {
    if (input === "") {
        console.log(" Please enter a valid text!");
        return false;
    }
    return true;
}

//find out the id of selected manager
var managerId;
function getManagerId(manager) {
    for (var i = 0; i < managerList.length; i++) {
        var managerName = managerList[i].first_name + " " + managerList[i].last_name
        if (managerName === manager) {
            return managerId = managerList[i].id
        }
    }
}

//find out the id of selected employee
var employeeId;
function getEmployeeId(employee) {
    for (var i = 0; i < employeeList.length; i++) {
        var employeeName = employeeList[i].first_name + " " + employeeList[i].last_name
        if (employeeName === employee) {
            return employeeId = employeeList[i].id
        }
    }
}

// find out the id of selected role
async function getRoleId(employee) {
    return new Promise((res, rej) => {
        connection.query("SELECT * FROM role", function (err, results) {
            if (err) rej(err);

            for (var i = 0; i < results.length; i++) {
                if (employee === results[i].title) {
                    res(results[i].id)
                }
            }
            rej("Invalid id")
        }
        );
    });
}

// function view all employees
function viewAllEmployees() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        console.log("----------------------------------------------------------------------")
        console.table(results)
        userInput()
    });
};

// function view all employees by department
function viewAllEmployeesByDepartment() {
    //pick department
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        return inquirer
            .prompt([
                {
                    name: "byDepartment",
                    type: "rawlist",
                    message: "Which department would you like to view?",
                    choices: function () {
                        var departments = [];
                        for (var i = 0; i < results.length; i++) {
                            departments.push(results[i].department_name);
                        };
                        return departments
                    }
                }
            ]).then(function (answer) {
                var department = answer.byDepartment;

                //find the department id of selected department
                var sql = "SELECT * FROM department WHERE department_name = ?";
                connection.query(sql, department, function (err, results) {
                    if (err) throw err;
                    var departmentId = results[0].id

                    //use department id to identify roles
                    var sql = "SELECT * FROM role WHERE department_id = ?";
                    connection.query(sql, departmentId, function (err, results) {
                        if (err) throw err;

                        //use role id to indentify employees by department
                        var roleIdList = []

                        for (const { id } of results) {
                            roleIdList.push(id)
                        }
                        var sql = `SELECT * FROM employee WHERE role_id IN (${roleIdList})`;
                        connection.query(sql, function (err, results) {
                            if (err) throw err;
                            console.log("----------------------------------------------------------------------")
                            console.log("Department: " + department)
                            console.table(results)
                            userInput()
                        });
                    });
                });
            });
    });
};

// function view all employees by manager
function viewAllEmployeesByManager() {

    //pick manager
    return inquirer
        .prompt([
            {
                name: "manager",
                type: "rawlist",
                message: "Please choose one manager from the following list",
                choices: managerNameList
            }
        ]).then(function (answer) {
            var byManager = answer.manager;

            getManagerId(byManager)

            // find out the employees supervised by the selected manager
            var sql = "SELECT * FROM employee WHERE manager_id = ?"
            connection.query(sql, managerId, function (err, results) {
                if (err) throw err;
                console.log("----------------------------------------------------------------------")
                console.log("Manager: " + byManager)
                console.table(results)
                userInput()
            })
        });

};

//function add employee
function addEmployee() {
    return inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "Please enter first name",
                validate: textValidation
            },
            {
                name: "lastName",
                type: "input",
                message: "Please enter last name",
                validate: textValidation
            },
            {
                name: "role",
                type: "rawlist",
                message: "Please select a role",
                choices: roleList
            },
            {
                name: "managerAssign",
                type: "rawlist",
                message: "Please assign a manager",
                choices: managerOptions
            }
        ]).then(async function (answer) {

            const newEmployeeRoleId = await getRoleId(answer.role);

            if (answer.managerAssign != "null") {
                getManagerId(answer.managerAssign)
            } else {
                managerId = null
            }

            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: newEmployeeRoleId,
                    manager_id: managerId
                },
                function (err) {
                    if (err) throw err;
                    console.log("New Employee Added")
                    userInput()
                })
        })
}

//function delete employee
function removeEmployee() {
    return inquirer
        .prompt([
            {
                name: "selectEmployee",
                type: "rawlist",
                message: "Please select an employee from the following list",
                choices: employeeNameList
            }
        ]).then(function (answer) {

            getEmployeeId(answer.selectEmployee)

            var sql = "DELETE FROM employee WHERE id = ?";
            connection.query(sql, employeeId, function (err, result) {
                if (err) throw err;
                console.log(answer.selectEmployee + " removed")
                userInput()
            })
        })
}

// function update employee role
function updateEmployeeRole() {
    return inquirer
        .prompt([
            {
                name: "selectEmployee",
                type: "rawlist",
                message: "Please select an employee from the following list",
                choices: employeeNameList
            },
            {
                name: "selectRole",
                type: "rawlist",
                message: "Please select a new role from the following list",
                choices: roleList
            }
        ]).then(async function (answer) {
            getEmployeeId(answer.selectEmployee)
            try {
                const employeeNewRoleId = await getRoleId(answer.selectRole);
                var sql = `UPDATE employee SET role_id = ${employeeNewRoleId} WHERE id = ${employeeId}`;
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(answer.selectEmployee + " has been assigned to " + answer.selectRole)
                    userInput()
                })
            } catch (err) {
                console.log("error caught")
            }
        })
}

// function update employee manager
function updateEmployeeManager() {
    return inquirer
        .prompt([
            {
                name: "selectEmployee",
                type: "rawlist",
                message: "Please select an employee from the following list",
                choices: employeeNameList
            },
            {
                name: "selectManager",
                type: "rawlist",
                message: "Please select a new manager from the following list",
                choices: managerOptions
            }
        ]).then(async function (answer) {
            getEmployeeId(answer.selectEmployee)
            if (answer.selectManager != "null") {
                getManagerId(answer.selectManager)
            } else {
                managerId = null
            }
            var sql = `UPDATE employee SET manager_id = ${managerId} WHERE id = ${employeeId}`;
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log(answer.selectEmployee + " has been assigned a new manager ")
                userInput()
            })


        })
}