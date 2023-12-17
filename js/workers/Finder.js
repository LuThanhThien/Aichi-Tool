const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const formManager = require('../managers/FormManager')
const logger = require('./Logger')


async function Finder(keyword = 'Hirabari', isHeadless = false) {
   try {
      const logPath = `${logger.logPath}`
      const formBrowser = await puppeteer.launch({ headless: isHeadless })
      const formPage = await formBrowser.newPage()
      await formPage.goto(config.mainUrl)
      let listForms = await formManager.collector(formPage, keyword, config.displayNumber, false)
      formManager.exportJSON(listForms)
      await formPage.screenshot({ path: `${logPath}/display.png`, fullPage: true })
      return { listForms, formBrowser, formPage }
   } catch (error) {
      console.error(error)
      return Finder(keyword, isHeadless)
   }
}

module.exports = Finder