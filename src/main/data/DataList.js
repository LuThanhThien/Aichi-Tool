import map from '../../resources/static/map.js'
import utils from '../../utils.js'
import {log } from '../../log.js'

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
         log(`ERROR: Cannot find data class name ${DataClass.name} in map`)
         return null
      }
      else {
         log(`ERROR: Data class is undefined`)
         return null
      }
   } 
}

export default DataList

