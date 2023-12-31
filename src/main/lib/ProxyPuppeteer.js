import puppeteer, { Browser } from 'puppeteer'
import config from '../../configure/config.js'

class ProxyPuppeteer {
   constructor(proxy = true) {
      this.proxy = proxy
      this.puppeteer = puppeteer
   }

   async newBrowser({ headless = false, args = [], }) {
      if (this.proxy === true) {
         args.push(`--proxy-server=${config.proxyServer}`)
      }
      const browser = await this.puppeteer.launch({
         headless: headless,
         args: args,
      })
      return new ProxyBrowser(browser)
   }
}


class ProxyBrowser {
   /**
    * @param {Browser} browser
    */
   constructor(browser) {
      this.browser = browser
   }

   async newPage() {
      const page = await this.browser.newPage()
      await page.authenticate({
         username: config.args.proxy.user,
         password: config.args.proxy.pass
      });
      return page
   }
}

export default ProxyPuppeteer