require('events').EventEmitter.defaultMaxListeners = 20
const { program } = require('commander');
const config = require('./js/config')

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

// init logger
logger.logger()

// tool
async function FINDER(keyword='Hirabari') {
   try {
      const isHeadless = 'new'                         // headless mode
      let { listForms, formBrowser, formPage } = await Finder(keyword, isHeadless)
      maxLoop = -1                                        // infinite loop
      while (maxLoop > 0 || maxLoop === -1) {
         let listForms = await formManager.collector(formPage, keyword, config.displayNumber, false)     // find valid forms
         formManager.exportJSON(listForms)        
         if (maxLoop > 0) { maxLoop-- }
      }
   }
   catch (err) {
      logger.logging(0, null, `FINDER ERROR: ${err}`)
      console.log(err)
   }      
}


async function tool(keyword='Hirabari', headless=false, capture=false, maxRenit=10000) {
   const accounts = config.accounts                                  // list of accounts
   const isHeadless = (headless === false) ? false: 'new'            // headless mode
   let maxForms = 3                                                  // max number of forms per account
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true   // test mode
   let startTimeAll = logger.logging(0, null, 
      `ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   let [ 
      { listForms, formBrowser, formPage },
      loggedPages 
   ] = await Promise.all([
      Finder(keyword, 'new'),                // find all available forms
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
         formManager.finder(formPage, null, keyword),
         Distributor(loggedPages, accounts, maxForms)
      ])

      // REALOAD DISPAGES
      if (reRun % 20 === 0) {
         startTimeAll = logger.logging(startTimeAll, loggedPages.account, `RELOAD ACCOUNT PAGES`)
         await Promise.all(disPages.map(async (loggedPages, pageIndex) => {
            const thisPage = loggedPages.page
            await thisPage.reload()
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


program
   .option('--drop')
   .option('--tool')
   .option('--keyword <string>')
   .option('--max-renit <number>')
   .option('--headless')   
   .option('--capture')
program.parse();

const options = program.opts();
// run
if (options.tool === true) {
   tool(options.keyword, options.headless, options.capture, options.maxRenit)
}
if (options.drop === true) {
   // console.log('Cannot perform this action in this version')
   formEliminator.droper(options.capture)
}

// node app --drop
// node app --tool --keyword='GY' --capture 
// node app --tool --keyword='Hirabari' --capture 
// node app --tool --keyword='Tosan' --capture 

