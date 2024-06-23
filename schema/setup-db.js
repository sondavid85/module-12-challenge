require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const schemaPath = path.resolve(__dirname, 'schema.sql');

// Correctly format the path for Windows
const formattedSchemaPath = schemaPath.replace(/\\/g, '\\\\');

const command = `mysql -u ${dbUser} -p${dbPassword} < ${formattedSchemaPath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
