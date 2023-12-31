
class Pipes extends Array {
   /**
    * @param {Array} pipes 
    */
   constructor(pipes) {
      super()
      this.push(...pipes)
   }

   /**
    * @param {Array} pipes 
    */
   addAll(pipes) {
      this.push(...pipes)
   }
}

export default Pipes