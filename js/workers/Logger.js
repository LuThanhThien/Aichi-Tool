var util = require('util');
const fs = require('fs');
const config = require('../config');
const utils = require('../utils');
const path = require('path');
const logPath = `./log/${config.DateCombined.thisDate}`;

// create logger
function logger() {
   // init logger
   initLogger()
   // create log txt file
   var log_file = fs.createWriteStream(logPath + `/${config.DateCombined.thisTimeLog}.log`, {flags : 'w'})
   var log_stdout = process.stdout
   const originalConsoleLog = console.log;
   // override console.log
   console.log = function(d,log=true) { //
      if (log) {
         log_file.write(util.format(d) + '\n')
      }
      log_stdout.write(util.format(d) + '\n')
   }
}

// for logging info
function logging(account=null, text=null, log=true) {
   const now = new Date();
   let dateString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

   if (text !== null) {
      if (account === null) {
         console.log(`[${dateString}] [MAIN] ${text}`, log);
      }
      else {
         console.log(`[${dateString}] [${account.username}] ${text}`, log);
      }
   } 
   else {
      console.log(`[${dateString}] [MAIN]`, log);
   }
}

function cleanLog(n) {
   // keep only n latest log files (include current log file)
   fs.readdir(logPath, (err, files) => {
      if (err) throw err;
      // Sort the files by modified time
      files.sort((a, b) => {
         return fs.statSync(path.join(logPath, a)).mtime.getTime() - 
              fs.statSync(path.join(logPath, b)).mtime.getTime();
      });
      num_files = n - 1
      // If there are more than 10 files
      if (files.length > num_files) {
         // Remove the oldest files
         for (let i = 0; i < files.length - (num_files); i++) {
            if (files[i].endsWith('.log')) {
               fs.unlink(path.join(logPath, files[i]), err => {
                  if (err) throw err;
               });
            }
         }
      }
   });
}

// make dirs for log
function initLogger(){
   utils.makeDir(logPath)
   cleanLog(10)
   // make dir for each account to capture html or screenshot
   for (acc of config.accounts) {
      utils.makeDir(logPath + `/${acc.username}`)
   }
}


module.exports = {
   logger,
   logging,
   logPath,
}
// console.log(`[${dateString}] [MAIN] [START]`)

// module.exports = {
//    DateComponents,
//    DateCombined,
//    logPath
// }
