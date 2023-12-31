import ProxyPuppeteer from '../main/lib/ProxyPuppeteer.js'
import { log } from '../log.js'
import formManager from '../managers/AccountManager.js'
import puppeteer from 'puppeteer'


async function Accountor(accounts, isHeadless=false, proxy=true) {
   const loggedPages = await Promise.all(accounts.map(async (account, i) => {
      log("Log in account - BEGIN", account)
      const promiseBrowser = await new ProxyPuppeteer(proxy).newBrowser({ headless: isHeadless })
      // const promiseBrowser = await puppeteer.launch({ headless: isHeadless })
      const promisePage = await promiseBrowser.newPage()
      // await promisePage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
      let isLogin = await formManager.logIn(promisePage, account)
      if (!isLogin) {
         log("Log in account - FAILED", account)
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: false }
      }
      else {
         log("Logged in account - SUCCESS", account)
         return { account, browser: promiseBrowser, page: promisePage, isAvailable: true }
      }
      
   }))
   const message = `All accounts logged in - DONE: ${loggedPages.filter(page => page.isAvailable).length} SUCCESS, ${loggedPages.filter(page => !page.isAvailable).length} FAILED`
   log(message)
   return loggedPages
}

export default Accountor
