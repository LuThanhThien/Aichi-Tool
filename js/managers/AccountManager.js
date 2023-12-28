const config = require('../configure/config')
const utils = require('../utils')
const logger = require('../workers/Logger')
const formManager = require('./FormManager')


// Description: This file contains the functions that are used to manage the accounts.

async function logIn(page, account, depth=0, maxDepth=10) {
   // This function is used to log in to the account 
   // navigate to login page
   await page.goto(config.URLs.logInUrl)
   await page.waitForTimeout(2000)

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
      try {
         await page.goto(config.URLs.mainUrl)

         await page.evaluate(() => {
            const loginButton = document.getElementById("pcLogin")
            loginButton.click()
         })
         await page.waitForNavigation()
         await page.focus(usernameInputHTML)
         await page.keyboard.type(account.username)
         await page.focus(passwordInputHTML)
         await page.keyboard.type(account.password)
         await page.keyboard.press('Enter')
         await page.waitForNavigation()
      }
      catch (err) {
         // retry to login for maxDepth time, maxDepth = 0 means infinite
         logger.log(`ERROR: Cannot login, retry time <${depth}>...`, account)
         if (depth < maxDepth || maxDepth == 0) {
            return await logIn(page, account, depth+1)
         }
         else {
            logger.log(`ERROR: Cannot login`, account)      
            return false
         }
      }
   } 
   // console.log(page.url())
   return true
}


async function accountFormsInquery(page, account) {
   // This function is used to find all forms in the account
   // navigate to inquery page
   try {
      await page.goto(config.URLs.inqueryUrl)
      let listItems = await formManager.findInqueryForms(page)
      console.log(listItems)
   }
   catch (err) {
      logger.log(`ERROR: Cannot navigate to inquery page`, account)
      return false
   }

   // find all inquery forms
   const formListHTML = "div[class='formList']"
   const formList = await page.$$(formListHTML)
   const formListLength = formList.length
   logger.log(`Found ${formListLength} forms`, account)
   return formList
}



module.exports = {
   logIn, accountFormsInquery
}