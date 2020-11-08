const inquirer = require("inquirer");
const connection = require("./lib/connection");

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

        case "Exit":
            connection.end()
            break;
    }
}

// function view all employees
function viewAllEmployees() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        console.log("----------------------------------------------------------------------")
        console.table(results)
        userInput()
    })
}

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
                        }
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
                        var roleId = []

                        for (const { id: n } of results) {
                            roleId.push(n)
                        }
                        var sql = `SELECT * FROM employee WHERE role_id IN (${roleId})`;
                        connection.query(sql, function (err, results) {
                            if (err) throw err;
                            console.log("----------------------------------------------------------------------")
                            console.log("Department: " + department)
                            console.table(results)
                            userInput()
                        })
                    })
                })
            })
    })
}

// function view all employees by manager
function viewAllEmployeesByManager() {
    var sql = "SELECT * FROM role WHERE title = 'Sales Lead' OR title = 'Lead Engineer' OR title = 'Account manager' OR title = 'Legal Team Lead'";
    connection.query(sql, function (err, results) {
        if (err) throw err;

        // find out the role id of each manager positions
        var roleId = [];
        for (const { id: n } of results) {
            roleId.push(n)
        };

        //find out who are the managers
        var sql = `SELECT * FROM employee WHERE role_id IN (${roleId})`;
        connection.query(sql, function (err, results) {
            if (err) throw err;
            var managerList = results;

            //pick manager
            return inquirer
                .prompt([
                    {
                        name: "manager",
                        type: "rawlist",
                        message: "Please choose one manager from the following list",
                        choices: function () {
                            var managers = []
                            for (var i = 0; i < managerList.length; i++) {
                                managers.push(managerList[i].first_name + " " + managerList[i].last_name)
                            }
                            return managers
                        }
                    }
                ]).then(function (answer) {
                    var byManager = answer.manager;

                    //find out the id of selected manager
                    var managerId;
                    for (var i = 0; i < managerList.length; i++) {
                        var managerName = managerList[i].first_name + " " + managerList[i].last_name
                        if (managerName === byManager) {
                            managerId = managerList[i].id
                        }
                    }

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
        });
    });

};



