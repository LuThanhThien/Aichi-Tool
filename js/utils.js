const config = require('./config')
const fs = require('fs')

// redirect to main page
async function redirectMain(page) {
   await page.goto(config.mainPageUrl)
   await page.waitForNavigation()
}

function makeDir(path) {
   if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true }, (err) => {
         if (err) {
            console.log(err)
         } else {
            console.log(`Folder '${path}' created successfully.`)
         }
      })
   }   
}

async function captureHTML(page, name='page.mhtml') {  
   try {  
     const data = await page.content()
     fs.writeFileSync(name, data)
   } 
   catch (err) { console.error(err) } 
 }

 function stringToDate(stringDate = null) {
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


function getJSTDateTime() {
   const currentDate = new Date()
   const jstOptions = { timeZone: 'Asia/Tokyo' }
   let currentJSTDateStr = currentDate.toLocaleString('ja-JP', jstOptions)
   let [date, time] = currentJSTDateStr.split(' ')
   let [ year, month, day] = date.split('/')
   let [hour, minute, second] = time.split(':')
   let currentJSTDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
   return currentJSTDate
}

function isPast(stringDate=null) {
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
   const targetDate = new Date(Date.UTC(year, month, day, hour, minute))
   
   const currentDate = new Date()
   const jstOptions = { timeZone: 'Asia/Tokyo' }
   let currentJSTDateStr = currentDate.toLocaleString('ja-JP', jstOptions)
   let [JSTdate, JSTtime] = currentJSTDateStr.split(' ')
   let [JSTyear, JSTmonth, JSTday] = JSTdate.split('/')
   let [JSThour, JSTminute, JSTsecond] = JSTtime.split(':')
   let currentJSTDate = new Date(Date.UTC(JSTyear, JSTmonth - 1, JSTday, JSThour, JSTminute, JSTsecond))
   return targetDate.getTime() < currentJSTDate.getTime()
}


module.exports = {
   redirectMain,
   makeDir,
   captureHTML,
   isPast,
   stringToDate,
   getJSTDateTime,
 }

 
// const targetDate = '2023年12月07日 16時30分'
// const result = stringToDate(targetDate)
// const isPat = isPast(targetDate)
// console.log(isPat)
 
// logging(null, "START")