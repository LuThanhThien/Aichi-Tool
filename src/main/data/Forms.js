import dir from '../../resources/static/dir.js'

class Form{
   constructor (title, status, startDate, endDate, templateSeq, link, isAvailable, isPast) {
      this.title = title
      this.status =  status
      this.startDate = startDate
      this.endDate = endDate
      this.templateSeq = templateSeq
      this.link = link
      this.isAvailable = isAvailable
      this.isPast = isPast
      let thisStartDate = this._stringToDate(this.startDate)
      this.distance = (thisStartDate - this._getJSTDateTime())
   }

   _stringToDate(stringDate = null) {
      if (stringDate === null) {
         return false
      }
   
      // preprocessing date string
      const matchDate = stringDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日 (\d{2})時(\d{2})分/)
      const year = parseInt(matchDate[1], 10)
      const month = parseInt(matchDate[2], 10) - 1 // JavaScript months are 0-indexed
      const day = parseInt(matchDate[3], 10)
      const hour = parseInt(matchDate[4], 10)
      const minute = parseInt(matchDate[5], 10)
      
      // get target and current date time
      const targetDate = new Date(Date.UTC(year, month, day, hour, minute))
   
      return targetDate
   }
   
   _getJSTDateTime() {
      const currentDate = new Date()
      const jstOptions = { timeZone: 'Asia/Tokyo' }
      let currentJSTDateStr = currentDate.toLocaleString('ja-JP', jstOptions)
      let [date, time] = currentJSTDateStr.split(' ')
      let [ year, month, day] = date.split('/')
      let [hour, minute, second] = time.split(':')
      let currentJSTDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
      return currentJSTDate
   }
}


class FormList extends Array {
   constructor() {
      super()
   }

   /**
   * @param {Form} form
   */
   add(form) {
      this.push(form)
   }

   /**
   * @param {Array<Form>} forms
   */
   addAll(forms) {
      this.push(...forms)
   }

   /**
   * @param {String} field
   * @param {String} value
   */
   filterExact(field='title', value) {
      return this.filter(form => form[field] == value)
   }

   /**
    * @param {String} field
    * @param {String} value
    */
   filterInclude(field='title', value) {
      return this.filter(form => form[field].includes(value))
   }

   /**
    * @param {String} field
    * @param {Array<String>} values
    */
   filterAll(field='title', values) {
      return this.filter(form => values.includes(form[field]))
   }

   getAvailable() {
      return this.filter(form => form.isAvailable)
   }

   getPast() {
      return this.filter(form => form.isPast)
   }

   toJSONFile() {
      utils.exportJSON(this, dir.out.json.formList.path)
   }

}

class FormStatus {
   /**
    * @param {Form} form   
    */ 
   constructor(form) {
      this.templateSeq = form.templateSeq
      this.busy = false
      this.filled = false
   }
}



class FormStatusList extends Array {
   constructor() {
      super()
   }

   /**
    * @param {FormStatus} formStatus
    */
   add(formStatus) {
      this.push(formStatus)
   }

   /**
    * @param {Array<FormStatus>} formStatuses
    */
   addAll(formStatuses) {
      this.push(...formStatuses)
   }

   /**
    * @param {String} field
    * @param {String} value
    */
   filterExact(field='templateSeq', value) {
      return this.filter(formStatus => formStatus[field] == value)
   }

   /**
    * @param {String} field
    * @param {String} value
    */
   filterInclude(field='templateSeq', value) {
      return this.filter(formStatus => formStatus[field].includes(value))
   }

   /**
    * @param {String} field
    * @param {Array<String>} values
    */
   filterAll(field='templateSeq', values) {
      return this.filter(formStatus => values.includes(formStatus[field]))
   }

   getBusy() {
      return this.filter(formStatus => formStatus.busy)
   }

   getFilled() {
      return this.filter(formStatus => formStatus.filled)
   }

   toJSONFile() {
      utils.exportJSON(this, dir.out.json.formStatus.path)
   }

}

export default {Form, FormStatus, FormList, FormStatusList}
