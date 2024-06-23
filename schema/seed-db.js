require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'employee_tracker'
});

// Connect to the database
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
  seedDatabase();
});

// Function to seed the database
function seedDatabase() {
  const seedQuery = `
    INSERT INTO department (name) 
    VALUES
        ('Engineering'), 
        ('Sales'), 
        ('Finance'), 
        ('Legal');

    INSERT INTO role (title, salary, department_id) 
    VALUES
        ('Software Engineer', 80000, 1),
        ('Sales Lead', 100000, 2),
        ('Accountant', 70000, 3),
        ('Lawyer', 120000, 4);

    INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, NULL),
    ('Michael', 'Johnson', 3, NULL),
    ('Sarah', 'Brown', 4, NULL),
    ('Jim', 'Green', 1, 1),
    ('Dwight', 'Schrute', 2, 2);
  `;

  connection.query(seedQuery, (err, results) => {
    if (err) throw err;
    console.log('Database seeded successfully.');
    connection.end();
  });
}
