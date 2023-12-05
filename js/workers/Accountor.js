const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const logger = require('./Logger')
const accountManager = require('../managers/AccountManager')

module.exports = async function(accounts, isHeadless=false) {
   startTimeAll = logger.logging(0)
   const loggedPages = await Promise.all(accounts.map(async (account, i) => {
      let startTimeInner = logger.logging(0, account, "Log in account - BEGIN")
      const promiseBrowser = await puppeteer.launch({ headless: isHeadless })
      const promisePage = await promiseBrowser.newPage();
      await accountManager.logIn(promisePage, account);
      startTimeInner = logger.logging(startTimeInner, account, "Logged in finished")
      return { account, browser: promiseBrowser, page: promisePage, isAvailable: true };
   }))
   startTimeAll = logger.logging(startTimeAll, null, `Logged in all accounts`)
   return loggedPages
}