const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')


// objects
const logger = require('../workers/Logger')
const formManager = require('../managers/FormManager')

module.exports = async function(disPages, listForms, filledForms={}, capture=false, test=false, multiForms=false, hidden=false) {
   let failStore = []                                                // store failed forms
   let totalSuccess = 0                                              // total successful forms
   await Promise.all(disPages.map(async (loggedPage, pageIndex) => {
      // params 
      const thisAccount = loggedPage.account
      const thisPage = loggedPage.page
      const thisInfo = loggedPage.info
      try
      {if (thisAccount.username in filledForms == false) {
         filledForms[thisAccount.username] = []
      }
      if (filledForms[thisAccount.username].length >= 3 && test == true) {
         logger.log(`This account has reach max forms - END`, thisAccount, false)
         return
      }
      
      // shuffle the listForms array and select the first 3 forms
      // for (let i = listForms.length - 1; i > 0; i--) {
      //    const j = Math.floor(Math.random() * (i + 1));
      //    [listForms[i], listForms[j]] = [listForms[j], listForms[i]];
      // }
      listForms = listForms.slice(0, 5)

      // auto fill form 
      let totalForms = thisInfo.length
      let n = 0
      
      if (multiForms == false) {
         while (totalForms > 0 && n < listForms.length) {
            const thisForm = listForms[n]
            if (filledForms[thisAccount.username].includes(thisForm.title)) {
               logger.log(`Auto fill form ${thisForm.title} skipped`, thisAccount, false)
               n++
               continue
            }
            logger.log(`Auto fill form ${thisForm.title} begin`, thisAccount)
            const newPage = await thisPage.browser().newPage()
            // await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
            let isNavigatedToForm = await utils.navigateTo(newPage, thisForm.link)
            let isSuccess = await formManager.filler(newPage, thisAccount, thisForm, n+1, capture, test, thisInfo[totalForms-1])
            logger.log(`Auto fill form ${thisForm.title} finished - ${isSuccess ? 'SUCCESS' : 'FAILED'}`, thisAccount)        
            if (!isSuccess) {
               const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
               failStore.push(fail)
            }          
            else {
               filledForms[thisAccount.username].push(thisForm.title)
               logger.log('Filled info: ' + JSON.stringify(thisInfo[totalForms-1]), thisAccount)
               totalForms--
               totalSuccess++
            }
            await newPage.close()
            n++
            if (hidden == true && filledForms[thisAccount.username].length === config.customerData.length) { break }
         }
      }
      else {
         await Promise.all(listForms.map(async (thisForm, i) => {
            if (filledForms[thisAccount.username].includes(thisForm.title)) {
               logger.log(`Auto fill form [${n+1}] skipped: ${thisForm.title}`, thisAccount, false)
               return
            }
            logger.log(`Auto fill form [${n+1}] begin: ${thisForm.title}`, thisAccount)
            const newPage = await thisPage.browser().newPage()
            // await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
            let isNavigatedToForm = await utils.navigateTo(newPage, thisForm.link)
            let isFail = await formManager.filler(newPage, thisAccount, thisForm, n+1, capture, test, thisInfo[totalForms-1])
            logger.log(`Auto fill form [${n+1}] finished - ${isFail ? 'FAILED' : 'SUCCESS'}`, thisAccount)        
            if (!isFail) {
               const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
               failStore.push(fail)
            }          
            else {
               filledForms[thisAccount.username].push(thisForm.title)
               logger.log('Filled info: ' + JSON.stringify(thisInfo[totalForms-1]), thisAccount, false)
               totalForms--
               totalSuccess++
            }
            await newPage.close()
            n++
         }))
      }
      
      logger.log("Account finished - END", thisAccount, false)}
      catch (err) {
         logger.log("ERROR: Account finished - END", thisAccount)
         console.log(err)
      }
   }))

   return failStore, totalSuccess, filledForms 
}