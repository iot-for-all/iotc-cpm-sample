'use strict';
const exec = require('child_process').exec;
const path = require('path');

switch (process.platform) {
    case 'darwin':
        exec('pod install', { cwd: path.join(__dirname, 'ios') }, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
            }
            if (stderr) {
                console.error(stderr);
            }
            if (stdout) {
                console.log(stdout);
            }
        });
        break;
    default:
        break;
}