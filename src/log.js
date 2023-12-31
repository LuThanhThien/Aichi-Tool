import { format } from 'util';
import { existsSync, mkdirSync, createWriteStream, readdir, statSync, unlink } from 'fs';
import config from './configure/config.js';
import { join } from 'path';
const logPath = `./log/${config.DateCombined.thisDate}`;


function makeDir(path) {
   if (!existsSync(path)) {
      mkdirSync(path, { recursive: true }, (err) => {
         if (err) {
            console.log(err)
         } else {
            console.log(`Folder '${path}' created successfully.`)
         }
      })
   }   
}

// create logger
function logger() {
   // init logger
   initLogger()
   // create log txt file
   var log_file = createWriteStream(logPath + `/${config.DateCombined.thisTimeLog}.log`, {flags : 'w'})
   var log_stdout = process.stdout
   // override console.log
   console.log = function(d,log=true) { //
      if (log) {
         log_file.write(format(d) + '\n')
      }
      log_stdout.write(format(d) + '\n')
   }
   console.error = function(d,log=true) { //
      if (log) {
         log_file.write(format(d) + '\n')
      }
      log_stdout.write(format(d) + '\n')
   }
}

// for logging info
function log(text=null, account=null, log=true) {
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
   readdir(logPath, (err, files) => {
      if (err) throw err;
      // Sort the files by modified time
      files.sort((a, b) => {
         return statSync(join(logPath, a)).mtime.getTime() - 
              statSync(join(logPath, b)).mtime.getTime();
      });
      const num_files = n - 1
      // If there are more than 10 files
      if (files.length > num_files) {
         // Remove the oldest files
         for (let i = 0; i < files.length - (num_files); i++) {
            if (files[i].endsWith('.log')) {
               unlink(join(logPath, files[i]), err => {
                  if (err) throw err;
               });
            }
         }
      }
   });
}

// make dirs for log
function initLogger(){
   makeDir(logPath)
   cleanLog(10)
   // make dir for each account to capture html or screenshot
   for (const acc of config.accounts) {
      makeDir(logPath + `/${acc.username}`)
   }
}


export {
   logger,
   log, 
   logPath,
   makeDir,
}

