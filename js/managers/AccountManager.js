const config = require('../config')
const utils = require('../utils')
const logger = require('../workers/Logger')
const formManager = require('./FormManager')

// Description: This file contains the functions that are used to manage the accounts.

async function logIn(page, account, depth=0, maxDepth=10) {
   // This function is used to log in to the account 
   // navigate to login page
   let isNavigated = await utils.navigateTo(page, config.logInUrl)
   
   // login
   const usernameInputHTML = "input[name='userId']"
   const passwordInputHTML = "input[name='userPasswd']"
   try {
      await page.focus(usernameInputHTML)
      await page.keyboard.type(account.username)
      await page.focus(passwordInputHTML)
      await page.keyboard.type(account.password)
      await page.keyboard.press('Enter')
      await page.waitForNavigation()
   }
   catch (err) {
      // retry to login for maxDepth time, maxDepth = 0 means infinite
      logger.logging(account, `ERROR: Cannot login, retry time <${depth}>...`)
      if (depth < maxDepth || maxDepth == 0) {
         return await logIn(page, account, depth+1)
      }
      else {
         logger.logging(account, `ERROR: Cannot login`)      
         return false
      }
   }
   // console.log(page.url())
   return true
}


async function accountFormsInquery(page, account) {
   // This function is used to find all forms in the account
   // navigate to inquery page
   try {
      await page.goto(config.inqueryUrl)
      let listItems = await formManager.findInqueryForms(page)
      console.log(listItems)
   }
   catch (err) {
      logger.logging(account, `ERROR: Cannot navigate to inquery page`)
      return false
   }

   // find all inquery forms
   const formListHTML = "div[class='formList']"
   const formList = await page.$$(formListHTML)
   const formListLength = formList.length
   logger.logging(account, `Found ${formListLength} forms`)
   return formList
}



module.exports = {
   logIn, accountFormsInquery
}