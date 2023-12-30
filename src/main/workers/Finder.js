import config from '../../resources/static/config.js'
import utils from '../../utils.js'
import OfferList from '../html/OfferList.js'
import Pipeline from '../html/Pipeline.js'
import Forms from '../data/Forms.js'

async function Finder(mainBrowser) {
   const mainPage = await utils.proxyPage(mainBrowser)

   let OfferListObj = new OfferList(
      config.args.keyword, 
      config.args.displayNumber, 
      mainPage
      )
   let PipelineMain = new Pipeline()

   let pipes = [
      async () => await OfferListObj.filter({ verbose: true }),
      async () => await OfferListObj.display({ verbose: true }),
      async () => await OfferListObj.get({ verbose: true }),
      async () => { 
         await utils.reloadPage(mainPage)
         },
      async () => await OfferListObj.get({ verbose: true }),
      async () => OfferListObj.formList.toJSONFile(Forms.Form),
      async () => await PipelineRenit.run(),
   ]
   
   PipelineMain.addAll(pipes)
   await PipelineMain.run()
}

export default Finder