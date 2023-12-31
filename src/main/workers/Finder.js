import config from '../../configure/config.js'
import utils from '../../utils.js'
import { Browser } from 'puppeteer'
import OfferList from '../html/OfferList.js'
import Pipeline from '../../main/lib/Pipeline.js'
import Pipes from '../../main/lib/Pipes.js'
import Form from '../domain/Form.js'

/**
 * @param {Browser} finderBrowser
*/ 
async function Finder(finderBrowser) {
   const mainPage = await finderBrowser.newPage()

   let OfferListObj = new OfferList(
      config.args.keyword, 
      config.args.displayNumber, 
      mainPage
      )
   let PipelineMain = new Pipeline.Pipeline()

   let pipes = new Pipes([
      async () => await OfferListObj.filter({ verbose: true }),
      async () => await OfferListObj.display({ verbose: true }),
      async () => await OfferListObj.get({ verbose: true }),
      [
         async () => { await utils.reloadPage(mainPage) },
         async () => await OfferListObj.get({ verbose: true }),
         async () => OfferListObj.formList.toJSONFile(Form),
         new Pipeline.Recurrence(),
      ]
   ])

   PipelineMain.addAll(pipes)
   await PipelineMain.run()
}

export default Finder
