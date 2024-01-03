// Description: This file contains the functions that are used to manage the forms.
import { writeFile, readFileSync } from 'fs'  
import config from '../configure/config.js'
import global from '../configure/global.js'
import utils from '../utils.js'
import { log as _log, logPath as _logPath } from '../log.js'
import 'fs'
const args = config.args
const URLs = config.URLs
const fake = config.fake



async function filter(page, account, keyword=args.keyword) {

   try {
      if (page.url !== URLs.mainUrl) { await page.goto(URLs.mainUrl) }   // redirect to main page
      const filterInputHTML = "templateName"
      await page.evaluate( (filterInputHTML, keyword) => {
         document.getElementsByName(filterInputHTML)[0].value = keyword       // filter by keyword
      }, filterInputHTML, keyword)
      await page.focus(`input[name="${filterInputHTML}"]`)
      await page.keyboard.press('Enter')                                      // press enter to filter
      await page.waitForNavigation()

      _log("Filter finished", account)
   }
   catch (err) {
      _log(`ERROR: Cannot filter - SKIP`, account)
      console.log(err)
      return false
   }
}

async function display(page, account, displayNumber=args.displayNumber) {
   try {
      let availables = [120,50]
      if (!availables.includes(displayNumber)) 
      {
         _log(`ERROR: ${displayNumber} is not in availables - SKIP`, account)
         return false
      }
      // const displaySelectBoxHTML = "top_ken_selectbox"
      const dispUrl = `https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_movePage?dispPage=${displayNumber}`
      await page.goto(dispUrl)                                             // display n forms
   }
   catch (err) {
      _log(`ERROR: Cannot display ${displayNumber} forms - SKIP`, account)
      console.log(err)
      return false
   }
   _log(`Display ${displayNumber} forms finished`, account)
   return true
}


async function finder(page, keyword=args.keyword, reverseForms=false, hidden=false, templateSeqs=[]) {

   try {
      const selectors = {
         listItems: '.c-box--cardList__item',
         title: '.c-box--cardList__item_h4',
         status: '.c-box--cardList__item__status',
         startDate: '.span-display-flex',
         endDate: '.span-display-flex',
         templateSeq: 'input[type="hidden"]',
         link: 'a',
         linkPrefix: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_detailTop?tempSeq=",
         linkSuffix: "&accessFrom=offerList",
     }
     
     
      const array = await page.evaluate(async (selectors, isPast) => {
         const isPastFnc = new Function(`return ${isPast}`)()
         return Array.from(document.querySelectorAll(selectors.listItems), li => {
               const getTextContent = (element) => element ? element.textContent.replace(/\s+/g, ' ').trim() : null
               const titleElement = li.querySelector(selectors.title)
               const statusElement = li.querySelector(selectors.status)
               const startDateElement = li.querySelectorAll(selectors.startDate)[1]
               const endDateElement = li.querySelectorAll(selectors.endDate)[3]
               const templateSeqElement = li.querySelector(selectors.templateSeq)
               const linkElement = li.querySelector(selectors.link)
      
               return {
                  title: getTextContent(titleElement),
                  status: getTextContent(statusElement),
                  startDate: getTextContent(startDateElement),
                  endDate: getTextContent(endDateElement),
                  templateSeq: templateSeqElement ? parseInt(templateSeqElement.value) : null,
                  link: selectors.linkPrefix + templateSeqElement.value + selectors.linkSuffix,
                  isAvailable: !!linkElement,
                  isPast: isPastFnc(getTextContent(startDateElement)),
               }
         })
      }, selectors, utils.isPast.toString(), utils.stringToDate.toString())

      
      
      let availableItem = array // take all forms     

      if (keyword != null && keyword != '') {
         availableItem = availableItem.filter(item => item.title.includes(keyword))    // deep-filter with exact keyword
      }

      if (templateSeqs.length > 0) { 
         console.log(templateSeqs)
         availableItem = availableItem.filter(item => templateSeqs.includes(item.templateSeq)) // filter by templateSeqs
         availableItem = availableItem.filter(item => item.isAvailable === true)
      }       
      else {
         availableItem = availableItem.sort(customSort)                                      // sort by date
         if (hidden === true) { // using for hidden Hiraibari forms
            // availableItem = availableItem.filter(item => item.isAvailable === true)            // ignore unavailable forms
            availableItem = availableItem.filter(item => !item.title.includes('＜'))
            // availableItem = availableItem.filter(item => !item.title.includes('<'))

            if (reverseForms) { return availableItem.reverse() }
            else { return availableItem }
         }

         // const aboutToClose = "もうすぐ終了"
         // const upcomingStatus = "近日受付開始"
         const passedStatus = "受付終了しました" 
         const endedStatus = "終了しました"  
         availableItem = availableItem.filter(item => item.status !== passedStatus)          // ignore passed forms
         availableItem = availableItem.filter(item => item.status !== endedStatus)           // ignore ended forms
      }

      let closest = Infinity
      for (let item in availableItem) {
         let thisStartDate = utils.stringToDate(availableItem[item].startDate)
         availableItem[item].distance = (thisStartDate - utils.getJSTDateTime())
         if (availableItem[item].distance < closest && availableItem[item].distance >= 0) {
            closest = availableItem[item].distance
         }
      } 

      availableItem = availableItem.filter(item => item.distance <= closest)               // take the closest form
      let totalFormsFound = availableItem.length
      let isLog = (totalFormsFound > 0) ? true : false
      _log("Find available finished. Total links found: " + availableItem.length, null, isLog)

      if (reverseForms) { return availableItem.reverse() }
      else { return availableItem }
   }
   catch (err) {
      _log(`ERROR: Cannot find available forms - SKIP`)
      console.log(err)
      return []
   }
}


function distributor(listForms, accounts, maxForms=3) {
   // shuffle the listForms array and select the first 3 forms
   let disAccounts = []
   for (let i = 0 ; i < accounts.length ; i++) {
      for (let i = listForms.length - 1 ; i > 0 ; i--) {
         const j = Math.floor(Math.random() * (i + 1))
         [listForms[i], listForms[j]] = [listForms[j], listForms[i]]
      }
      let numForms = 0
      for (let j = 0 ; j < listForms.length ; j++) {
         if (numForms >= maxForms) {
            break
         }
         const distributedForms = {
            username: accounts[i].username,
            password: accounts[i].password,
            form: listForms[j],
         }
         disAccounts.push(distributedForms)
         numForms++
      }
      
   }
   return disAccounts
}

async function collector(page, keyword=args.keyword, displayNumber=args.displayNumber, reverseForms=false, hidden=false, templateSeqs=[]) {
   // get available forms in advance
   await filter(page, null, keyword, )                                        // filter 
   await display(page, null, displayNumber)                                   // display  

   let listForms = await finder(page, keyword, reverseForms, hidden, templateSeqs)                          // find all availables
   _log("Collecting forms finished")
   return listForms
}


async function filler(newPage, account, form, i, capture=false, test=false, info) {   
   const beginUrl = newPage.url()
   const logPath = `${_logPath}/${account.username}` // path to save log
   const maxRetry = 0
   let retry = 0
   let imgName = specialCharEliminate(form.title)
   // console.log(imgName)

   // check if form is available
   try {
      let isAvailable = await checkAvailability(newPage, account, form, i)
      // if (isAvailable === 'passed') { return false }
      while (isAvailable === 'upcoming' || isAvailable === 'passed') {
         await newPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })    // reload page
         isAvailable = await checkAvailability(newPage, account, form, i)
         // if (isAvailable === 'passed') { return false }
         if (isAvailable === 'available') { break }
         else if (retry >= maxRetry && maxRetry != 0) {
            _log(`Exceed max retry form [${i+1}]`, account)
            return false
         }
         retry++
      }
   }
   catch (err) {
      _log(`ERROR FORM [${i+1}]: Cannot check availability`, account)
      console.log(err)
      return false
   }
   
   // 1. click agree, go to form link
   try {
      if (capture) {await newPage.screenshot({path: `${logPath}/BEGIN-${imgName}.png`, fullPage: true})}
   }
   catch (err) {
      _log(`ERROR FORM [${i+1}]: Cannot capture screenshot`, account)
      console.log(err)
   }
   try {
      await newPage.evaluate(() => {
         const okBtnHTML = 'ok'  
         const okBtn = document.getElementById(okBtnHTML)
         okBtn.click()
      })
      await newPage.waitForNavigation()
   }
   catch (err) {
      _log(`ERROR FORM [${i+1}]: Agree button not found`, account)
      console.log(err)
      return false
   }
   if (newPage.url() === beginUrl) {
      _log(`ERROR FORM [${i+1}]: Agree button not found`, account)
      return false
   }

   // 2. fill form and click agree, go to confirm page
   await utils.captureHTML(newPage, `${logPath}/HTML-${imgName}.mhtml`)
   let fakeInfo = {
      phoneNumber: fake.phoneNumber[Math.random() * fake.phoneNumber.length | 0],
      schoolName: fake.schoolName[Math.random() * fake.schoolName.length | 0],
      dateGrad: fake.dateGrad[Math.random() * fake.dateGrad.length | 0],
      examinNumber: fake.examinNumber[Math.random() * fake.examinNumber.length | 0],
   }
   try {
      await newPage.evaluate((fakeInfo, test, info) => {
         if (test) {
            // var form = document.getElementById('offerForm')
            // form.submit()
            document.getElementsByName("item[0].textData2")[0].value = info.firstName
            document.getElementsByName("item[0].textData")[0].value = info.lastName
            document.getElementsByName("item[2].textData")[0].value = info.dateBirth
            const radios = document.querySelectorAll(`input[name="item[3].selectData"]`)
            radios[(info.gender === 'M') ? 0 : 1].checked = true
            document.getElementsByName("item[4].textData")[0].value = fakeInfo.phoneNumber
            document.getElementsByName("item[5].textData")[0].value = fakeInfo.schoolName
            document.getElementsByName("item[7].textData")[0].value = fakeInfo.dateGrad
            document.getElementsByName("item[8].textData")[0].value = fakeInfo.examinNumber
         } else {
            document.getElementsByName("item[0].textData2")[0].value = info.firstName
            document.getElementsByName("item[0].textData")[0].value = info.lastName
            document.getElementsByName("item[1].textData")[0].value = info.dateBirth
            document.getElementsByName("item[5].textData")[0].value = info.phoneNumberHash
            document.getElementsByName("item[2].selectData")[0].value = info.nation
            document.getElementsByName("item[3].selectData")[0].value = info.country
            const radios = document.querySelectorAll(`input[name="item[4].selectData"]`)
            radios[(info.gender === 'M') ? 0 : 1].checked = true
         }
         document.querySelectorAll('input[type="checkbox"]')[0].checked = true
      }, fakeInfo, test, info)

      const focusSubmitHTML = `input[name='item[0].textData']`
      try {
         if (capture) {await newPage.screenshot({path: `${logPath}/DRAFT-${imgName}.png`, fullPage: true})}
      }
      catch (err) {
         _log(`ERROR FORM [${i+1}]: Cannot capture screenshot`, account)
         console.log(err)
      }
      await newPage.focus(focusSubmitHTML)
      await newPage.keyboard.press('Enter')
      await newPage.waitForNavigation()
   }
   catch (err) {
      _log(`ERROR FORM [${i+1}]: Form not found or data not valid`, account)
      console.log(err)
      return false
   }
   if (newPage.url() === URLs.formUrl) {
      _log(`ERROR FORM [${i+1}]: Form not found or data not valid`, account)
      return false
   }

   // 3. click confirm, go to finish page
   try {
      await newPage.evaluate(() => {
         const confirmBtnHTML = 'c-btn_2'
         document.getElementsByClassName(confirmBtnHTML)[0].click()
      })
      // handle the popup
      newPage.on('dialog', async dialog => {
         await dialog.accept()
      })
      await newPage.waitForNavigation()
      try {
         if (capture) {await newPage.screenshot({path: `${logPath}/END-${imgName}.png`, fullPage: true})}
      }
      catch (err) {
         _log(`ERROR FORM [${i+1}]: Cannot capture screenshot`, account)
         console.log(err)
      }
   }
   catch (err) {
      _log(`ERROR FORM [${i+1}]: Confirm button not found`, account)
      console.log(err)
      return false
   }
   if (newPage.url() === URLs.confirmUrl) {
      _log(`ERROR FORM [${i+1}]: Confirm button not found`, account)
      return false
   }

   // 4. check if success or fail
   // await utils.captureHTML(newPage, `${logPath}/form-[${i+1}]-result.mhtml`)
   return await newPage.evaluate(() => {
         return !document.querySelector('.errorMessage') // !! converts anything to boolean
       })
}


async function checkAvailability(page, account, form, i) {
   const closedStatus = "大変申し訳ございません。申込数が上限に達した為、締め切らせていただきました。"
   const upcomingStatus = "申込期間ではありません。"
   let avaiStatus = await page.evaluate(() => {
      const errorMessageElement = document.querySelector('.errorMessage')
      return errorMessageElement ? errorMessageElement.textContent.trim() : null
    })

   // console.log(avaiStatus)
   if (avaiStatus === upcomingStatus) {
      _log(`Form [${i+1}] is upcoming, start at: ${form.startDate}`, account, false)
      return 'upcoming'
   }
   else if (avaiStatus === closedStatus) {
      _log(`Form [${i+1}] is full filled, started at: ${form.startDate}`, account, false)
      return 'passed'
   }
   else if (avaiStatus === null) {
      _log(`Form [${i+1}] is available now, started at: ${form.startDate}`, account, false)
      return 'available'
   }
}

async function findInqueryForms(page) {
   // find all inquery forms
   let listItems = await page.evaluate(() => {
      let tableRows = document.querySelectorAll('table tbody tr') // Select all table rows
      let items = [] // Array to store the items

      tableRows.forEach((row, index) => {
         if(index !== 0) { // Skip the header row
            let item = {}
            let cells = row.querySelectorAll('td') // Select all cells in the row

            item.id = cells[0].textContent.trim()
            item.name = cells[1].textContent.trim()
            item.contact = cells[2].textContent.trim()
            item.date = cells[3].textContent.trim()
            item.status = cells[4].textContent.trim()

            // Get the onclick attribute of the button
            let button = cells[5].querySelector('input[type="submit"]') // Select the 'input' element in the last cell
            if(button) {
               item.buttonId = button.getAttribute('id')
            }

            items.push(item) // Add the item to the array
         }
      })
      return items
   })
   
   // filter items if status is '"処理待ち"'
   const inqueryStatus = "処理待ち"
   listItems = listItems.filter(item => item.status.includes(inqueryStatus))    // deep-filter with exact keyword
   // console.log(listItems)

   return listItems
}


// API for interact between workers
function exportJSON(disForms, path=global.dir.out.jsonFormList) {
   let json = JSON.stringify(disForms, null, 2) // The third argument (2) is for indentation
   writeFile(path, json, 'utf8', (err) => {
      if (err) {
         _log("ERROR: Cannot write JSON data to " + path)
         console.error(err)
      }
   })
   // logger.log("JSON data has been written to " + path)
}

function importJSON(path=global.dir.out.jsonFormList) {
   try {
      const jsonString = readFileSync(path, 'utf8')
      const jsonObject = JSON.parse(jsonString)
      // logger.log('Received JSON file successfully')
      return jsonObject
   }
   catch(err) {
      _log('ERROR: Cannot read JSON file or JSON file is empty')
      console.error(err)
      return {}
   }
}

function checkJSON(newJSONObj, path=global.dir.out.jsonFormList) {
   try {
      const oldJSONObj = importJSON(path)
      for (let i = 0 ; i < oldJSONObj.length ; i++) {
         delete oldJSONObj[i].distance
      }
      for (let i = 0 ; i < newJSONObj.length ; i++) {
         delete newJSONObj[i].distance
      }
      if (JSON.stringify(oldJSONObj) === JSON.stringify(newJSONObj)) {
         _log('JSON Objects are the same')
         return true
      }
      else {
         _log('JSON Objects are different')
         return false
      }
   }
   catch(err) {
      _log('ERROR: Cannot check JSON Objects')
      console.error(err)
      return false
   }
}

// Define a custom sorting function
function customSort(a, b) {
   const dateA = parseInt(a.title.replace(/[^\d]/g, ''), 10) // Extract numeric part of date
   const dateB = parseInt(b.title.replace(/[^\d]/g, ''), 10)

   return dateA - dateB
}

/**
 * @param {*} str 
 * @returns
 */

function specialCharEliminate(str) {
   const specialChars = /[\/\\<>:"*?"|]/g;
   return str.replace(specialChars, '');
}

export default {
   finder,
   distributor,
   collector,
   filler,
   findInqueryForms,
   exportJSON, importJSON, checkJSON,
   specialCharEliminate,
}

// const str = "\\<03:12:2023>\\ /|2021|/\"年度　*愛知県警察学校*　警察官採用試験　受付終了しました\"?"
// console.log(specialCharEliminate(str))