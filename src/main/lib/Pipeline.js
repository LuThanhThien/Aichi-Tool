import { log } from '../../log.js'
import Pipes from './Pipes.js'

class Pipeline {
   /**
    * @param {Pipes} pipes 
    */
   constructor (pipes = []) {
      this.pipeline = pipes.constructor === Pipes ? pipes : new Pipes(pipes)
      // console.log(this.pipeline)
      this.log = []
   }
   
   add(method) {
      // console.log(method + " has type of " + typeof method)
      switch (typeof method) {
         case 'object':
            if (method.constructor === Array || method.constructor === Pipes) {
               let newPipeline = new Pipeline()
               newPipeline.addAll(method.constructor === Pipes ? method : new Pipes(method))
               this.pipeline.push(async() => newPipeline.run())
            }
            else if (method.constructor === Pipeline || method.constructor === Recurrence) {
               this.pipeline.push(async() => method.run(this))
            }
            break;
         default:
            this.pipeline.push(method)
            break;
      }  
   }

   /**
    * @param {Array} methods 
    */
   addAll(methods) {
      for (let method of methods) {
         this.add(method)
      }
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

class Recurrence{
   constructor(delay = 500) {
      this.delay = delay
      this.pipeline = null
   }

   
   /**
    * @param {Pipeline} pipeline
   */
   async run(pipeline) {
      await new Promise(resolve => setTimeout(resolve, this.delay))
      this.pipeline = pipeline
      await this.pipeline.run()
   }
}



export default { Pipeline, Recurrence }
 