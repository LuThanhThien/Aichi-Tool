import ProxyPuppeteer from '../main/lib/ProxyPuppeteer.js'
import config from '../configure/config.js'


// objects
import formManager from '../managers/FormManager.js'
import { logPath as _logPath } from '../log.js'
import puppeteer from 'puppeteer'


async function Finder(keyword = 'Hirabari', isHeadless = false,  reverseForms=false, hidden=false, templateSeqs=[], proxy=true) {
   try {
      const logPath = `${_logPath}`
      const formBrowser = await new ProxyPuppeteer(proxy).newBrowser({ headless: isHeadless })
      const formPage = await formBrowser.newPage()
      // await formPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
      await formPage.goto(config.URLs.mainUrl)
      let listForms = await formManager.collector(formPage, keyword, config.args.displayNumber, reverseForms, hidden, templateSeqs)
      formManager.exportJSON(listForms)
      await formPage.screenshot({ path: `${logPath}/display.png`, fullPage: true })
      return { listForms, formBrowser, formPage }
   } catch (error) {
      console.error(error)
      return Finder(keyword, isHeadless, reverseForms)
   }
}

export default Finder