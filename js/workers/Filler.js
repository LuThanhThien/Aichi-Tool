const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const logger = require('./Logger')
const formManager = require('../managers/FormManager')

module.exports = async function(disPages, listForms, capture=false, test=false) {
   let failStore = []                                                // store failed forms
   let totalSuccess = 0                                              // total successful forms

   await Promise.all(disPages.map(async (loggedPage, pageIndex) => {
      // params 
      let startTimeInner = logger.logging(0)
      const thisAccount = loggedPage.account
      const thisPage = loggedPage.page
      const thisInfo = loggedPage.info

      // shuffle the listForms array and select the first 3 forms
      // for (let i = listForms.length - 1; i > 0; i--) {
      //    const j = Math.floor(Math.random() * (i + 1));
      //    [listForms[i], listForms[j]] = [listForms[j], listForms[i]];
      // }
      // let distributedForms = listForms.slice(0, 3)

      // auto fill form 
      let totalForms = thisInfo.length
      let n = 0
      while (totalForms > 0 && n < listForms.length) {
         const thisForm = listForms[n]
         startTimeInner = logger.logging(startTimeInner, thisAccount, `Auto fill form [${n+1}] begin: ${thisForm.title}`)
         const newPage = await thisPage.browser().newPage()
         await newPage.goto(thisForm.link)
         let isFail = await formManager.filler(newPage, thisAccount, thisForm, n+1, capture, test, thisInfo[n])
         startTimeInner = logger.logging(startTimeInner, thisAccount, `Auto fill form [${n+1}] finished - ${isFail ? 'FAILED' : 'SUCCESS'}`)        
         if (isFail) {
            const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
            failStore.push(fail)
         }          
         else {
            totalForms--
            totalSuccess++
         }
         await newPage.close()
         n++
      }
      startTimeInner = logger.logging(startTimeInner, thisAccount, "Account finished - END")
   }))

   return { failStore, totalSuccess } 
}