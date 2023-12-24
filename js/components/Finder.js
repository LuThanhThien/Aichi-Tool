const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')


// objects
const formManager = require('../managers/FormManager')
const logger = require('../workers/Logger')


async function Finder(keyword = 'Hirabari', isHeadless = false,  reverseForms=false, hidden=false, templateSeqs=[]) {
   try {
      const logPath = `${logger.logPath}`
      const formBrowser = await puppeteer.launch({ headless: isHeadless })
      const formPage = await formBrowser.newPage()
      // await formPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')
      await formPage.goto(config.URLs.mainUrl)
      let listForms = await formManager.collector(formPage, keyword, config.displayNumber, reverseForms, hidden, templateSeqs)
      formManager.exportJSON(listForms)
      await formPage.screenshot({ path: `${logPath}/display.png`, fullPage: true })
      return { listForms, formBrowser, formPage }
   } catch (error) {
      console.error(error)
      return Finder(keyword, isHeadless, reverseForms)
   }
}

module.exports = Finder