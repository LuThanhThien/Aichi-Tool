const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')
const OfferList = require('../html/OfferList')
const Pipeline = require('../html/Pipeline')
const { Form } = require('../data/Forms')

async function Finder(mainBrowser) {
   const mainPage = await mainBrowser.newPage()
   await mainPage.setViewport({ width: 1200, height: 800 })
   let OfferListObj = new OfferList(
      keyword=config.args.keyword, 
      displayNumber=config.args.displayNumber, 
      page=mainPage
      )
   let PipelineInit = new Pipeline()
   let PipelineRenit = new Pipeline()
   let PipelineMain = new Pipeline()

   let pipesInit = [
      async () => await OfferListObj.filter({ verbose: true }),
      async () => await OfferListObj.display({ verbose: true }),
      async () => await OfferListObj.get({ verbose: true }),
   ]
   let pipesRenit = [
      async () => { 
         await utils.reloadPage(mainPage)
         },
      async () => await OfferListObj.get({ verbose: true }),
      async () => OfferListObj.formList.toJSONFile(Form),
      async () => await PipelineRenit.run(),
   ]
   
   PipelineInit.addAll(pipesInit)
   PipelineRenit.addAll(pipesRenit)
   PipelineMain.addAll(
      [
         async () => await PipelineInit.run(),
         async () => await PipelineRenit.run(),
      ]
   )
   await PipelineMain.run()
}

module.exports = Finder