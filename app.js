require('events').EventEmitter.defaultMaxListeners = 20
const { program } = require('commander');
const config = require('./js/config')
const utils = require('./js/utils')

// objects
const formEliminator = require('./js/managers/FormInquery')
const formManager = require('./js/managers/FormManager')
const accountManager = require('./js/managers/AccountManager')

// workers 
const logger = require('./js/workers/Logger')
const Finder = require('./js/workers/Finder')
const Accountor = require('./js/workers/Accountor')
const Distributor = require('./js/workers/Distributor')
const Taker = require('./js/workers/Taker');
const Filler = require('./js/workers/Filler');
const { log } = require('console');

// init logger
logger.logger()

// tool
async function tool(keyword='Hirabari', headless=false, capture=false, maxRenit=10000, reverseForms=false) {
   const accounts = config.accounts                                  // list of accounts
   const isHeadless = (headless === false) ? false: 'new'            // headless mode
   let maxForms = 3                                                  // max number of forms per account
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true   // test mode
   logger.logging(null, 
      `ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}, reverseForms = ${reverseForms}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   let [ 
      { listForms, formBrowser, formPage },
      loggedPages
   ] = await Promise.all([
      Finder(keyword, 'new', reverseForms),                // find all available forms
      Accountor(accounts, isHeadless)        // login all accounts
   ])                 
   
   let reRun = 0
   let disPages = []                        
   let failStore = []
   let totalSuccess = 0
   while (true) {
      // DISTRIBUTE FORMS TO ACCOUNTS IN ADVANCE
      [
         listForms,
         disPages 
      ] = await Promise.all([
         formManager.finder(formPage, null, keyword, reverseForms),  // re-find all available forms
         Distributor(loggedPages, accounts, keyword, maxForms)       // distribute forms to accounts
      ])


      // REALOAD DISPAGES
      if (reRun % 20 === 0) {
         logger.logging(loggedPages.account, `RELOAD ACCOUNT PAGES`, false)
         await Promise.all(disPages.map(async (loggedPages, pageIndex) => {
            const thisPage = loggedPages.page
            let isReloadAccountPage = await utils.reloadPage(thisPage)
         }))
      }
      
      let filledForms = formManager.importJSON(config.accountJSONPath) || {}   // store filled forms
      // AUTO FILL FORMS
      failStore, totalSuccess, filledForms = await Filler(disPages, listForms, filledForms, capture, test)

      // LOG FAILS AND SUCCESSFUL FORMS
      if (failStore.length > 0) {
         console.log(`FAILED FORMS: ${failStore.length}`)
         failStore.forEach((fail, i) => {
            console.log(`<${i+1}>. [${fail.account}] form [${fail.number}] - ${fail.title}`)
         })
      }
      if (totalSuccess > 0) {
         console.log(`TOTAL SUCCESSFUL FORMS: ${totalSuccess}`)
      }
      formManager.exportJSON(filledForms, config.accountJSONPath)
      
      await new Promise(r => setTimeout(r, 1000))

      reRun++
      // if (maxRenit !== 0 && reRun >= maxRenit) { break }
   }
}


async function main(capture=false, reverseForms=false) {
   const keyword = "Tosan"
   const headless = false
   const maxRenit = 0
   tool(keyword, headless, capture, maxRenit, reverseForms)
}


program
   .option('--drop')
   .option('--tool')
   .option('--keyword <string>')
   .option('--max-renit <number>')
   .option('--reverse-forms')
   .option('--headless')   
   .option('--capture')
program.parse();

const options = program.opts();
// run
if (options.tool === true) {
   tool(options.keyword, options.headless, options.capture, options.maxRenit, options.reverseForms)
}
else if (options.drop === true) {
   // console.log('Cannot perform this action in this version')
   formEliminator.droper(options.capture)
}
else {
   let capture = true
   let reverseForms = true
   main(capture, reverseForms)
}




// nexe app.js --build --verbose -t windows
// node app --drop
// node app --tool --keyword='GY' --capture
// node app --tool --keyword='Hirabari' --capture
// node app --tool --keyword='Tosan' --capture

