import { log } from './log.js'
import global from "./configure/global.js"
import utils from "./utils.js"


export default function() {
   try {
      Promise.all(Object.values(global.dir.out).map( path => utils.exportJSON([], path) )) 
   }
   catch (err) {
      log(`ERROR: Error when initializing`)
      log(err)
   }
}