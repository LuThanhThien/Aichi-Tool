// Description: This file contains the functions that are used to manage the forms.
const puppeteer = require('puppeteer');
const config = require('../config');
const utils = require('../utils');
const logger = require('../workers/Logger');
const { link } = require('fs');

async function filter(page, account, keyword=config.filterKeyword) {
   let startTime = logger.logging(0)

   try {
      if (page.url !== config.mainUrl) { await page.goto(config.mainUrl) }   // redirect to main page
      const filterInputHTML = "templateName"
      await page.evaluate( (filterInputHTML, keyword) => {
         document.getElementsByName(filterInputHTML)[0].value = keyword       // filter by keyword
      }, filterInputHTML, keyword)
      await page.focus(`input[name="${filterInputHTML}"]`)
      await page.keyboard.press('Enter')                                      // press enter to filter
      await page.waitForNavigation()

      statTime = logger.logging(startTime, account, "Filter finished")
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR: Cannot filter - SKIP`)
      console.log(err)
      return false
   }
}

async function display(page, account, displayNumber=config.displayNumber) {
   let startTime = logger.logging(0)
   try {
      let availables = [10, 20,50]
      if (!availables.includes(displayNumber)) 
      {
         startTime = logger.logging(startTime, account, `ERROR: ${displayNumber} is not in availables - SKIP`)
         return false
      }
      // const displaySelectBoxHTML = "top_ken_selectbox"
      const dispUrl = `https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_movePage?dispPage=${displayNumber}`
      await page.goto(dispUrl);                                             // display n forms
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR: Cannot display ${displayNumber} forms - SKIP`)
      console.log(err)
      return false
   }
   statTime = logger.logging(startTime, account, `Display ${displayNumber} forms finished`)
   return true
}


async function finder(page, account, keyword=config.filterKeyword) {
   let startTime = logger.logging(0)
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
     };
     
     
   const array = await page.evaluate(async (selectors, isPast, stringToDate) => {
      const isPastFnc = new Function(`return ${isPast}`)()
      const stringToDateFnc = new Function(`return ${stringToDate}`)()
      return Array.from(document.querySelectorAll(selectors.listItems), li => {
            const getTextContent = (element) => element ? element.textContent.replace(/\s+/g, ' ').trim() : null;
            const titleElement = li.querySelector(selectors.title);
            const statusElement = li.querySelector(selectors.status);
            const startDateElement = li.querySelectorAll(selectors.startDate)[1];
            const endDateElement = li.querySelectorAll(selectors.endDate)[3];
            const templateSeqElement = li.querySelector(selectors.templateSeq);
            const linkElement = li.querySelector(selectors.link);
   
            return {
               title: getTextContent(titleElement),
               status: getTextContent(statusElement),
               startDate: getTextContent(startDateElement),
               endDate: getTextContent(endDateElement),
               templateSeq: templateSeqElement ? templateSeqElement.value : null,
               link: selectors.linkPrefix + templateSeqElement.value + selectors.linkSuffix,
               isAvailable: !!linkElement,
               isPast: isPastFnc(getTextContent(startDateElement)),
            };
      });
   }, selectors, utils.isPast.toString(), utils.stringToDate.toString());

      let availableItem = array // take all forms                       
      if (keyword != null && keyword != '') {
         availableItem = availableItem.filter(item => item.title.includes(keyword))    // deep-filter with exact keyword
      }
  
      // const upcomingStatus = "近日受付開始"
      const passedStatus = "受付終了しました"
      const endedStatus = "終了しました"
      availableItem = availableItem.filter(item => item.status !== passedStatus)          // ignore passed forms
      availableItem = availableItem.filter(item => item.status !== endedStatus)           // ignore ended forms
      // availableItem = availableItem.filter(item => item.isPast === false)                 // ignore passed forms
      
      let closest = Infinity
      for (item in availableItem) {
         let thisStartDate = utils.stringToDate(availableItem[item].startDate)
         availableItem[item].distance = (thisStartDate - utils.getJSTDateTime())
         if (availableItem[item].distance < closest && availableItem[item].distance >= 0) {
            closest = availableItem[item].distance
         }
      }

      availableItem = availableItem.filter(item => item.distance <= closest)               // take the closest form
      startTime = logger.logging(startTime, account, "Find available finished. Total links found: " + availableItem.length)
      return availableItem
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR: Cannot find available forms - SKIP`)
      console.log(err)
      return []
   }
}


function distributor(listForms, accounts, maxForms=3) {
   // shuffle the listForms array and select the first 3 forms
   let disAccounts = []
   for (let i = 0; i < accounts.length; i++) {
      for (let i = listForms.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [listForms[i], listForms[j]] = [listForms[j], listForms[i]];
      }
      let numForms = 0
      for (let j = 0; j < listForms.length; j++) {
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

async function collector(page, keyword=config.filterKeyword, displayNumber=config.displayNumber) {
   // get available forms in advance
   let startTime = logger.logging(0)
   await filter(page, null, keyword, )                                        // filter 
   await display(page, null, displayNumber)                                   // display  

   let listForms = await finder(page, null, keyword)                          // find all availables
   startTime = logger.logging(startTime, null, "Collecting forms finished")
   return listForms
}


async function filler(newPage, account, form, i, capture=false, test=false, info) {   
   let startTime = logger.logging(0)  
   const logPath = `${logger.logPath}/${account.username}` // path to save log
   const maxRetry = 0
   let retry = 0

   // check if form is available
   let isAvailable = await checkAvailability(newPage, account, form, i)
   if (isAvailable === 'passed') { return false }
   while (isAvailable === 'upcoming') {
      // await newPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });    // reload page
      await newPage.reload();    // reload page
      isAvailable = await checkAvailability(newPage, account, form, i)
      if (isAvailable === 'passed') { return false }
      else if (isAvailable === 'available') { break }
      else if (retry >= maxRetry && maxRetry != 0) {
         startTime = logger.logging(startTime, account, `Exceed max retry form [${i+1}]`)
         return false
      }
      retry++
   }
   
   // 1. click agree, go to form link
   if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-begin.png`, fullPage: true})}
   try {
      await newPage.evaluate(() => {
         const okBtnHTML = 'ok'  
         const okBtn = document.getElementById(okBtnHTML)
         okBtn.click()
      })
      await newPage.waitForNavigation()
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR FORM [${i+1}]: Agree button not found`)
      console.log(err)
      return false
   }

   // 2. fill form and click agree, go to confirm page
   const formUrl = newPage.url()
   let fakeInfo = {
      phoneNumber: config.infoFake.phoneNumber[Math.random() * config.infoFake.phoneNumber.length | 0],
      schoolName: config.infoFake.schoolName[Math.random() * config.infoFake.schoolName.length | 0],
      dateGrad: config.infoFake.dateGrad[Math.random() * config.infoFake.dateGrad.length | 0],
      examinNumber: config.infoFake.examinNumber[Math.random() * config.infoFake.examinNumber.length | 0],
   }
   try {
      await newPage.evaluate((fakeInfo, test, info) => {
         if (test) {
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
      if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-draft.png`, fullPage: true})}
      await newPage.focus(focusSubmitHTML)
      await newPage.keyboard.press('Enter')
      await newPage.waitForNavigation()
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR FORM [${i+1}]: Form not found or data not valid`)
      console.log(err)
      return false
   }
   if (newPage.url() === formUrl) {
      startTime = logger.logging(startTime, account, `ERROR FORM [${i+1}]: Form not found or data not valid`)
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
         await dialog.accept();
      })
      await newPage.waitForNavigation()
      if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-end.png`, fullPage: true})}
   }
   catch (err) {
      startTime = logger.logging(startTime, account, `ERROR FORM [${i+1}]: Confirm button not found`)
      console.log(err)
      return false
   }

   // 4. check if success or fail
   const isFail = await newPage.evaluate(() => {
         return !!document.querySelector('.errorMessage') // !! converts anything to boolean
       })
   return isFail
}


async function checkAvailability(page, account, form, i) {
   let startTime = logger.logging(0)
   const passedStatus = "大変申し訳ございません。申込数が上限に達した為、締め切らせていただきました。"
   const upcomingStatus = "申込期間ではありません。"
   let avaiStatus = await page.evaluate(() => {
      const errorMessageElement = document.querySelector('.errorMessage');
      return errorMessageElement ? errorMessageElement.textContent.trim() : null;
    })

   // console.log(avaiStatus)
   if (avaiStatus === upcomingStatus) {
      startTime = logger.logging(startTime, account, `Form [${i+1}] is upcoming, start at: ${form.startDate}`)
      return 'upcoming'
   }
   else if (avaiStatus === passedStatus) {
      startTime = logger.logging(startTime, account, `Form [${i+1}] is out of date, started at: ${form.startDate}`)
      return 'passed'
   }
   else if (avaiStatus === null) {
      startTime = logger.logging(startTime, account, `Form [${i+1}] is available now, started at: ${form.startDate}`)
      return 'available'
   }
}


module.exports = {
   finder,
   distributor,
   collector,
   filler,
}