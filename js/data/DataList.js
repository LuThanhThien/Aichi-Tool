const map = require('../configure/map')
const utils = require('../utils')
const logger = require('../workers/Logger')
const { Form, FormStatus } = require('./Forms')
const { Account } = require('./Account')

class DataList extends Array {
   constructor() {
      super()
   }

   /**
    * @param {Object} Object
    */
   add(Object) {
      this.push(Object)
   }

   /**
    * @param {Array<Object>} Objects
    */
   addAll(Objects) {
      this.push(...Objects)
   }

   /**
    * @param {Array<Object>} Objects
    */
   replaceAll(Objects) {
      this.splice(0, this.length)
      this.push(...Objects)
   }

   /**
    * @param {String} field
    * @param {String} value
    */
   filterExact(field, value) {
      return this.filter(Data => Data[field] == value)
   }

   /**
    * @param {String} field
    * @param {String} value
    */
   filterInclude(field, value) {
      return this.filter(Data => Data[field].includes(value))
   }

   /**
    * @param {String} field
    * @param {Array<String>} values
    */
   filterAll(field, values) {
      return this.filter(Data => values.includes(Data[field]))
   }

   toJSONFile(DataClass) {
      utils.exportJSON(this, this._getJSONPath(DataClass))
   }

   /**
   ** @param {Function} DataClass
   */
   _getJSONPath(DataClass) {
      const path = map[DataClass.name]
      if (path) {
         return path
      }
      else if (DataClass.name) {
         logger.log(`ERROR: Cannot find data class name ${DataClass.name} in map`)
         return null
      }
      else {
         logger.log(`ERROR: Data class is undefined`)
         return null
      }
   } 
}

module.exports = DataList

