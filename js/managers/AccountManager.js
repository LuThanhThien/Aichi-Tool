const config = require('../config')
const utils = require('../utils')
const logger = require('../workers/Logger')

// Description: This file contains the functions that are used to manage the accounts.

async function logIn(page, account, depth=0, maxDepth=10) {
   // This function is used to log in to the account 
   let startTime = logger.logging(0)
   // navigate to login page
   try {
      await page.goto(config.logInUrl)
   }
   catch (err) {
      // retry to login for maxDepth time, maxDepth = 0 means infinite
      startTime = logger.logging(startTime, account, `ERROR: Cannot navigate to login page, retry time <${depth}>...`)
      if (depth < maxDepth || maxDepth == 0) {
         return await logIn(page, account, depth+1)
      }
      else {
         logger.logging(startTime, account, `ERROR: Cannot navigate to login page`)      
         return false
      }
   }
   startTime = logger.logging(startTime, account, `Navigate to login page finished`)
   
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
      startTime = logger.logging(startTime, account, `ERROR: Cannot login, retry time <${depth}>...`)
      if (depth < maxDepth || maxDepth == 0) {
         return await logIn(page, account, depth+1)
      }
      else {
         logger.logging(startTime, account, `ERROR: Cannot login`)      
         return false
      }
   }
   // console.log(page.url())
   return true
}


module.exports = {
   logIn,
}

