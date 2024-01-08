require('dotenv').config();
const { exec } = require('child_process');

const command = process.argv[2]; // The argument passed to the script

let commandToRun = '';

switch (command) {
  case 'open':
    commandToRun = 'START_SERVER_AND_TEST_INSECURE=1 start-server-and-test start:test https://0.0.0.0:3030 cy:open';
    break;
  case 'run':
    commandToRun = 'START_SERVER_AND_TEST_INSECURE=1 start-server-and-test start:test https://0.0.0.0:3030 cy:run';
    break;
  default:
    console.error('Invalid argument. Use "open" or "run".');
    process.exit(1);
}

exec(commandToRun, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
