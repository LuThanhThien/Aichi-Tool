import puppeteer, { Browser } from 'puppeteer'
import config from '../../resources/static/config.js'

class ProxyPuppeteer {
   constructor() {
      this.puppeteer = puppeteer
   }

   async newBrowser({ headless = false, args = [`--proxy-server=${config.proxyServer}`], }) {
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