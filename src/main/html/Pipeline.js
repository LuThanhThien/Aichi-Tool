import { log } from '../../log.js'

class Pipeline {
   constructor () {
      this.pipeline = []
      this.log = []
   }
   
   

   add(method) {
      this.pipeline.push(method)
   }

   addAll(methods) {
      this.pipeline.push(...methods)
   }

   async run() {
      for (let method of this.pipeline) {
         try {
            await method.call(this)
            this.log.push('passed')
         } catch (error) {
            log(`ERROR while executing Pipeline:`)
            console.error(error)
            this.log.push(error.message)
         }
      }
   }
}


export default Pipeline