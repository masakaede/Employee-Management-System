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
var managerNameList = [];
var managerOptions = [];
connection.query("SELECT * FROM role WHERE title = 'Sales Lead' OR title = 'Lead Engineer' OR title = 'Account manager' OR title = 'Legal Team Lead'", function (err, results) {
    if (err) throw err;

    // find out the role id of each manager positions
    var managerRoleId = [];
    for (const { id: n } of results) {
        managerRoleId.push(n)
    };

    //find out who are the managers
    var sql = `SELECT * FROM employee WHERE role_id IN (${managerRoleId})`;
    connection.query(sql, function (err, results) {
        if (err) throw err;
        managerList = results;
        for (var i = 0; i < managerList.length; i++) {
            managerNameList.push(managerList[i].first_name + " " + managerList[i].last_name)
        };
        managerOptions = [...managerNameList];
        managerOptions.push("null")
        return managerNameList
    })
})

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
                    "Exit"
                ]
            }
        ])
};

//prompt for input
async function userInput() {
    console.log(26)
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

var roleId;
async function getRoleId(answer) {
    let roleId = null;
    return new Promise((res, rej) => {
        connection.query("SELECT * FROM role", function (err, results) {
            if (err) rej(err);

            for (var i = 0; i < results.length; i++) {
                if (answer.role === results[i].title) {
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
            //find out the id of selected role
            const newEmployeeRoleId = await getRoleId(answer);

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
