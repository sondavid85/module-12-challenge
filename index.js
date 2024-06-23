const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'employee_tracker'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
  promptUser();
});

function promptUser() {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'View employees by Manager',
      'Add Department',
      'Add Role',
      'Add Employee',
      'Update Employee Role',
      'Exit'
    ]
  }).then((answer) => {
    switch (answer.action) {
      case 'View All Departments':
        viewAllDepartments();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'View employees by Manager':
        viewEmployeesByManager();
        break;
      case 'Add Department':
        addDepartment();
        break;
      case 'Add Role':
        addRole();
        break;
      case 'Add Employee':
        addEmployee();
        break;
      case 'Update Employee Role':
        updateEmployeeRole();
        break;
      case 'View employees by Manager':
        viewEmployeesByManager();
        break;
      case 'Exit':
        connection.end();
        break;
    }
  });
}

function viewEmployeesByManager() {
    // Query to get all managers
    const query = `
      SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS name
      FROM employee e
      WHERE e.id in (
        select manager_id
        from employee e
        where manager_id is not null
      )
    `;
    
    connection.query(query, (err, managers) => {
      if (err) throw err;
      
      // Prompt user to select a manager
      inquirer.prompt([
        {
          name: 'managerId',
          type: 'list',
          choices: managers.map(manager => ({ name: manager.name, value: manager.id })),
          message: 'Select a manager to view their employees:'
        }
      ]).then(answer => {
        const query = `
          SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary
          FROM employee e
          LEFT JOIN role ON e.role_id = role.id
          LEFT JOIN department ON role.department_id = department.id
          WHERE e.manager_id = ?
        `;
        
        connection.query(query, [answer.managerId], (err, employees) => {
          if (err) throw err;
          
          console.table(employees);
          promptUser(); // Call your function to prompt the user again
        });
      });
    });
  }  

function viewAllDepartments() {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}

function viewAllRoles() {
  const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    LEFT JOIN department ON role.department_id = department.id
  `;
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}

function viewAllEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id
  `;
  connection.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
}



function addDepartment() {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  }).then((answer) => {
    connection.query('INSERT INTO department SET ?', { name: answer.name }, (err) => {
      if (err) throw err;
      console.log('Department added successfully.');
      promptUser();
    });
  });
}

function addRole() {
  connection.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary of the role:'
      },
      {
        name: 'department_id',
        type: 'list',
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        })),
        message: 'Select the department for the role:'
      }
    ]).then((answers) => {
      connection.query('INSERT INTO role SET ?', answers, (err) => {
        if (err) throw err;
        console.log('Role added successfully.');
        promptUser();
      });
    });
  });
}

function addEmployee() {
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;
    connection.query('SELECT * FROM employee', (err, employees) => {
      if (err) throw err;
      inquirer.prompt([
        {
          name: 'first_name',
          type: 'input',
          message: 'Enter the first name of the employee:'
        },
        {
          name: 'last_name',
          type: 'input',
          message: 'Enter the last name of the employee:'
        },
        {
          name: 'role_id',
          type: 'list',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          })),
          message: 'Select the role for the employee:'
        },
        {
          name: 'manager_id',
          type: 'list',
          choices: [{ name: 'None', value: null }].concat(employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))),
          message: 'Select the manager for the employee:'
        }
      ]).then((answers) => {
        connection.query('INSERT INTO employee SET ?', answers, (err) => {
          if (err) throw err;
          console.log('Employee added successfully.');
          promptUser();
        });
      });
    });
  });
}

function updateEmployeeRole() {
  connection.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;
    connection.query('SELECT * FROM role', (err, roles) => {
      if (err) throw err;
      inquirer.prompt([
        {
          name: 'employee_id',
          type: 'list',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          })),
          message: 'Select the employee to update:'
        },
        {
          name: 'role_id',
          type: 'list',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          })),
          message: 'Select the new role for the employee:'
        }
      ]).then((answers) => {
        connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [answers.role_id, answers.employee_id], (err) => {
          if (err) throw err;
          console.log('Employee role updated successfully.');
          promptUser();
        });
      });
    });
  });
}