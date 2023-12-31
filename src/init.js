import dir from "./configure/dir.js"
import { log } from "./log.js"
import utils from "./utils.js"

export default function() {
   try {
      Promise.all(Object.values(dir.out).map( path => utils.exportJSON([], path) )) 
   }
   catch (err) {
      log(`ERROR: Error when initializing`)
      log(err)
   }
}