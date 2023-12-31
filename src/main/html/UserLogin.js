import puppeteer from 'puppeteer'
import Account from '../domain/Account.js'
import config from '../../configure/config.js'
import { log as _log } from '../../log.js'


class Login {
   /**
   * @param {puppeteer.Browser} browser
   * @param {puppeteer.Page} page
   * @param {Account.Account} account
   */
   constructor(browser, page, account) {
      this.browser = browser
      this.page = page
      this.account = account
      this.selectors = {
         username: "input[name='userId']",
         password: "input[name='userPasswd']",
      }
   }

   async login(options = { verbose: false }) {
      try {
         await this.page.goto(config.URLs.logInUrl)
         await this.page.focus(this.selectors.username)
         await this.page.keyboard.type(this.account.username)
         await this.page.focus(this.selectors.password)
         await this.page.keyboard.type(this.account.password)
         await this.page.keyboard.press('Enter')
         await this.page.waitForNavigation()
         this.account.set_isLogin(true)
         if (options.verbose) { _log(`Log in account ${this.account.username} finished`) }
      }
      catch (err) {
         _log(`ERROR: Cannot find login account ${this.account.username} - SKIP`)
         console.error(err)
         return false
      }
   }
}

export default Login

