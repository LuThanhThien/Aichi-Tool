const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')

// objects
const formManager = require('../managers/FormManager')
const logger = require('./Logger')


module.exports =  async function(keyword='Hirabari', isHeadless=false) {
      // FIND ALL AVAILABLE FORMS AND STORE
      const logPath = `${logger.logPath}`
      const formBrowser = await puppeteer.launch({ headless: isHeadless })
      const formPage = await formBrowser.newPage()
      await formPage.goto(config.mainUrl)
      let listForms = await formManager.collector(formPage, keyword, config.displayNumber, false)      // find valid forms
      await formPage.screenshot({path: `${logPath}/display.png`, fullPage: true})
      return { listForms, formBrowser, formPage }
   }