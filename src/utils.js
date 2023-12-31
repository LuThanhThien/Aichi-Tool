import config from './configure/config.js'
import dir from './configure/dir.js'
import { writeFileSync, writeFile, readFileSync } from 'fs'
import { log } from './log.js'

// redirect to main page
async function redirectMain(page) {
   await page.goto(config.URLs.mainUrl)
   await page.waitForNavigation()
}


async function captureHTML(page, name='page.mhtml') {  
   try {  
     const data = await page.content()
     writeFileSync(name, data)
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


async function reloadPage(page, maxDepth=100) {
   let retryCount = 0
   while (retryCount < maxDepth || maxDepth == 0) {
         try {
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
            return true  // Exit the loop if reloading is successful
         } catch (err) {
            log(`ERROR: Cannot reload page - Retry ${retryCount + 1}/${maxDepth}`)
            log(err)
            retryCount++
         }
   }
   log(`Max retries reached. Reload page - FAILED`)
   return false
}


async function navigateTo(page, url, maxDepth=100) {
   let retryCount = 0
   while (retryCount < maxDepth || maxDepth == 0) {
         try {
            await page.goto(url)
            log(`Navigate to ${url} - SUCCESS`, null, false)
            return true  // Exit the loop if navigating is successful
         } catch (err) {
            log(`ERROR: Cannot navigate to ${url} - Retry ${retryCount + 1}/${maxDepth}`)
            log(err)
            retryCount++
         }
   }
   log(`Max retries reached. Navigate to ${url} - FAILED`)
   return false

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


// API for interact between workers
function exportJSON(disForms, path=dir.out.json.OfferList) {
   let json = JSON.stringify(disForms, null, 2) // The third argument (2) is for indentation
   writeFile(path, json, 'utf8', (err) => {
      if (err) {
         log("ERROR: Cannot write JSON data to " + path)
         console.error(err)
      }
   })
   // logger.log("JSON data has been written to " + path)
}

function importJSON(path=dir.out.jsonFormList) {
   try {
      const jsonString = readFileSync(path, 'utf8')
      const jsonObject = JSON.parse(jsonString) 
      // logger.log('Received JSON file successfully')
      return jsonObject
   }
   catch(err) {
      log('ERROR: Cannot read JSON file or JSON file is empty')
      // console.error(err)
      return []
   }
}


function exists(path) {
   try {
     // Check if the file or folder exists
     fs.accessSync(path);
     return true;
   } catch (err) {
     // The file or folder does not exist
     return false;
   }
 }

export default {
   redirectMain,
   captureHTML,
   reloadPage, navigateTo,
   stringToDate, isPast, getJSTDateTime,
   exportJSON, importJSON, exists,
 }

 
// const targetDate = '2023年12月07日 16時30分'
// const result = stringToDate(targetDate)
// const isPat = isPast(targetDate)
// logger.log(isPat)
 
// log(null, "START")