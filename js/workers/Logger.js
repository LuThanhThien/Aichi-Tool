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
function logging(startTime, account=null, text=null, log=true) {
   if (startTime === 0 && text === null && account === null) {
      return 0;
   }
   const endTime = performance.now();
   const elapsedTime = (endTime - startTime) / 1000;
   const roundedElapsedTime = elapsedTime.toFixed(2); // Round up to 4 decimal places
   const dateString = `${config.DateComponents.year}-${config.DateComponents.month}-${config.DateComponents.date} ${config.DateComponents.hours}:${config.DateComponents.minutes}:${config.DateComponents.seconds}`;

   if (text !== null) {
      if (account === null) {
         console.log(`[${dateString}] [${roundedElapsedTime}s] [MAIN] ${text}`, log);
      }
      else {
         console.log(`[${dateString}] [${roundedElapsedTime}s] [${account.username}] ${text}`, log);
      }
   } 
   else {
      console.log(`[${dateString}] [${roundedElapsedTime}s] [MAIN]`, log);
   }
   return endTime;
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
