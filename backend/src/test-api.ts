import { exec } from 'child_process';
exec('curl -s http://localhost:5000/api/v1/settings', (err, stdout, stderr) => {
  console.log(stdout);
});
