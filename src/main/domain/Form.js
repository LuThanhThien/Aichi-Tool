
class Form {
   /**
    * @param {string} title            
    * @param {string} status
    * @param {string} startDate
    * @param {string} endDate
    * @param {bigint} templateSeq
    * @param {string} link
    * @param {boolean} isAvailable
    * @param {boolean} isPast
    * @param {bigint} distance
   */
   constructor(title ='title',
               status ='status', 
               startDate = '2000年1月1日 00時00分', 
               endDate = '2000年1月1日 00時00分', 
               templateSeq = 0, 
               link = 'link', 
               isAvailable = false, 
               isPast = false) {
      this.title = title
      this.status = status
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
      let [year, month, day] = date.split('/')
      let [hour, minute, second] = time.split(':')
      let currentJSTDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
      return currentJSTDate
   }
}

export default Form

