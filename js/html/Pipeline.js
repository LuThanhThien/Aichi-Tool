const logger = require('../workers/Logger')

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
            logger.log(`ERROR while executing Pipeline:`)
            console.error(error)
            this.log.push(error.message)
         }
      }
   }
}


module.exports = Pipeline