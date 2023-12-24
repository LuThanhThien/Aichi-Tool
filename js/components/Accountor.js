const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')

// objects
const logger = require('../workers/Logger')
const accountManager = require('../managers/AccountManager')

async function Accountor(accounts, isHeadless=false) {
   const loggedPages = await Promise.all(accounts.map(async (account, i) => {
      logger.log("Log in account - BEGIN", account)
      const promiseBrowser = await puppeteer.launch({ headless: isHeadless })
      const promisePage = await promiseBrowser.newPage()
      // await promisePage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
      let isLogin = await accountManager.logIn(promisePage, account)
      if (!isLogin) {
         logger.log("Log in account - FAILED", account)
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: false }
      }
      else {
         logger.log("Logged in account - SUCCESS", account)
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: true }
      }
      
   }))
   const message = `All accounts logged in - DONE: ${loggedPages.filter(page => page.isAvailable).length} SUCCESS, ${loggedPages.filter(page => !page.isAvailable).length} FAILED`
   logger.log(message)
   return loggedPages
}

module.exports = Accountor