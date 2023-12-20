const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const logger = require('./Logger')
const formManager = require('../managers/FormManager')

module.exports = async function(disPages, listForms, filledForms={}, capture=false, test=false, multiForms=false) {
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
         logger.logging(thisAccount, `This account has reach max forms - END`, false)
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
               logger.logging(thisAccount, `Auto fill form ${thisForm.title} skipped`, false)
               n++
               continue
            }
            logger.logging(thisAccount, `Auto fill form ${thisForm.title} begin`)
            const newPage = await thisPage.browser().newPage()
            let isNavigatedToForm = await utils.navigateTo(newPage, thisForm.link)
            let isFail = await formManager.filler(newPage, thisAccount, thisForm, n+1, capture, test, thisInfo[totalForms-1])
            logger.logging(thisAccount, `Auto fill form ${thisForm.title} finished - ${isFail ? 'FAILED' : 'SUCCESS'}`)        
            if (isFail) {
               const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
               failStore.push(fail)
            }          
            else {
               filledForms[thisAccount.username].push(thisForm.title)
               totalForms--
               totalSuccess++
            }
            await newPage.close()
            n++
         }
      }
      else {
         await Promise.all(listForms.map(async (thisForm, i) => {
            if (filledForms[thisAccount.username].includes(thisForm.title)) {
               logger.logging(thisAccount, `Auto fill form [${n+1}] skipped: ${thisForm.title}`, false)
               return
            }
            logger.logging(thisAccount, `Auto fill form [${n+1}] begin: ${thisForm.title}`)
            const newPage = await thisPage.browser().newPage()
            let isNavigatedToForm = await utils.navigateTo(newPage, thisForm.link)
            let isFail = await formManager.filler(newPage, thisAccount, thisForm, n+1, capture, test, thisInfo[totalForms-1])
            logger.logging(thisAccount, `Auto fill form [${n+1}] finished - ${isFail ? 'FAILED' : 'SUCCESS'}`)        
            if (isFail) {
               const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
               failStore.push(fail)
            }          
            else {
               filledForms[thisAccount.username].push(thisForm.title)
               totalForms--
               totalSuccess++
            }
            await newPage.close()
            n++
         }))
      }
      
      logger.logging(thisAccount, "Account finished - END", false)}
      catch (err) {
         logger.logging(thisAccount, "ERROR: Account finished - END")
         console.log(err)
      }
   }))

   return failStore, totalSuccess, filledForms 
}