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

        case "Exit":
            connection.end()
            break;
    }
}

// function view all employees
function viewAllEmployees() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        console.table(results)
        userInput()
    })
}

// function view all employees by department
function viewAllEmployeesByDepartment() {
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
                var sql = "SELECT * FROM department WHERE department_name = ?";
                connection.query(sql, department, function (err, results) {
                    if (err) throw err;
                    var parse = JSON.parse(JSON.stringify(results));
                    var departmentId = parse[0].id
                    var sql = "SELECT * FROM role WHERE department_id = ?";
                    connection.query(sql, departmentId, function (err, results) {
                        if (err) throw err;
                        var parse = JSON.parse(JSON.stringify(results));
                        var roleId = []

                        for (const { id: n } of parse) {
                            roleId.push(n)
                        }

                        var sql = `SELECT * FROM employee WHERE role_id IN (${roleId})`;
                        connection.query(sql, function (err, results) {
                            if (err) throw err;
                            var parse = JSON.parse(JSON.stringify(results));
                            console.table(parse)
                            userInput()
                        })
                    })
                })
            })
    })
}
