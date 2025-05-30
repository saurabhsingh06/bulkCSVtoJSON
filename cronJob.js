const child_process = require('child_process');
const path = require('path');

let start = Date.now();
const maxExecutionSecond = 60; // 2min
let i = 1;
async function runJob() {
    while (true) {
      console.log("Job start: ", i, "");

      // Creating child_process and running importCSV file
      const processchild = child_process.spawn('node', [path.join('__dirname', '/jobs/importCSV.js')], {
        detached: true,
        stdio: 'ignore'
      })
      console.log("Process ID: ", processchild.pid);
      await new Promise((res) => setTimeout(res, maxExecutionSecond * 1000));


      if (Date.now() - start < (maxExecutionSecond * 1000) - 10000 || true) {
        break;
      }
      i++;
      start = Date.now();
    }
}

runJob();