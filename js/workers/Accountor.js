const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const logger = require('./Logger')
const accountManager = require('../managers/AccountManager')

async function Accountor(accounts, isHeadless=false) {
   const loggedPages = await Promise.all(accounts.map(async (account, i) => {
      logger.logging(account, "Log in account - BEGIN")
      const promiseBrowser = await puppeteer.launch({ headless: isHeadless })
      const promisePage = await promiseBrowser.newPage()
      let isLogin = await accountManager.logIn(promisePage, account)
      if (!isLogin) {
         logger.logging(account, "Log in account - FAILED")
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: false }
      }
      else {
         logger.logging(account, "Logged in account - SUCCESS")
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: true }
      }
      
   }))
   const message = `All accounts logged in - DONE: ${loggedPages.filter(page => page.isAvailable).length} SUCCESS, ${loggedPages.filter(page => !page.isAvailable).length} FAILED`
   logger.logging(null, message)
   return loggedPages
}

module.exports = Accountor