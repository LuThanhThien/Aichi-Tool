require('events').EventEmitter.defaultMaxListeners = 20
const puppeteer = require('puppeteer-extra')
const { program } = require('commander')
const config = require('./js/configure/config')
const dir = require('./js/configure/dir')
const utils = require('./js/utils')

// objects
const formEliminator = require('./js/managers/FormInquery')
const formManager = require('./js/managers/FormManager')
const accountManager = require('./js/managers/AccountManager')

// workers 
const logger = require('./js/workers/Logger')
const Finder = require('./js/components/Finder')
const Accountor = require('./js/components/Accountor')
const Distributor = require('./js/components/Distributor')
const Filler = require('./js/components/Filler')

// html
const OfferList = require('./js/html/OfferList')
const Pipeline = require('./js/html/Pipeline')

// new workers
const FinderWorker = require('./js/workers/Finder')
const GuardianWorker = require('./js/workers/Guardian')
const DistributorWorker = require('./js/workers/Distributor')


// init logger
logger.logger()

// tool
async function tool(keyword='Hirabari', 
                     headless=false, 
                     capture=false, 
                     maxRenit=10000, 
                     reverseForms=false,
                     multiForms=false,
                     hidden=false,
                     templateSeqs=[],
                     showCustomerData=false) {
   const accounts = config.accounts                                  // list of accounts
   const isHeadless = (headless === false) ? false: 'new'            // headless mode
   let maxForms = 3                                                  // max number of forms per account
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true   // test mode
   logger.log(`ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}, reverseForms = ${reverseForms}, hidden = ${hidden}, templateSeqs = ${templateSeqs}, showCustomerData = ${showCustomerData}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   let [ 
      { listForms, formBrowser, formPage },
      loggedPages
   ] = await Promise.all([
      Finder(keyword, 'new', reverseForms, hidden, templateSeqs),                // find all available forms
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
         formManager.finder(formPage, keyword, reverseForms, hidden, templateSeqs),  // re-find all available forms
         Distributor(loggedPages, accounts, keyword, maxForms, showCustomerData, hidden)       // distribute forms to accounts
      ])


      // REALOAD DISPAGES
      if (reRun % 20 === 0 && reRun !== 0) {
         logger.log(`RELOAD ACCOUNT PAGES`, loggedPages.account, false)
         await Promise.all(disPages.map(async (loggedPages, pageIndex) => {
            const thisPage = loggedPages.page
            let isReloadAccountPage = await utils.reloadPage(thisPage)
         }))
      }
      
      let filledForms = formManager.importJSON(dir.out.json.accountList.path) || {}   // store filled forms
      // AUTO FILL FORMS
      failStore, totalSuccess, filledForms = await Filler(disPages, listForms, filledForms, capture, test, multiForms, hidden)

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
      formManager.exportJSON(filledForms, dir.out.json.accountList.path)
      
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

async function test(){
   const mainBrowser = await puppeteer.launch({ headless: 'new' })
   // let accountBrowsers = []
   // for (let i=0; i<config.accounts.length; i++) {
   //    const accountBrowser = await puppeteer.launch({ headless: false })
   //    accountBrowsers.push(accountBrowser)
   // }
   await Promise.all([
      FinderWorker(mainBrowser),
      // GuardianWorker(accountBrowsers),
      // DistributorWorker()
   ])
}

program
   .option('--drop')
   .option('--tool')
   .option('--test')
   .option('--keyword <string>')
   .option('--max-renit <number>')
   .option('--reverse-forms')
   .option('--headless')   
   .option('--capture')
   .option('--hidden')
   .option('--template-seqs <string>')
   .option('--multi-forms')
   .option('--show-customer-data')
program.parse()

const options = program.opts()

// run
if (options.tool === true) {
   let templateSeqs = []
   try {
      let templateSeqs = JSON.parse("[" + options.templateSeqs + "]")
   }
   catch (error) {
      console.log('Cannot parse templateSeqs')
   }
   tool(options.keyword, options.headless, options.capture, options.maxRenit, options.reverseForms, options.multiForms, options.hidden, templateSeqs, options.showCustomerData)
}
else if (options.drop === true) {
   // console.log('Cannot perform this action in this version')
   formEliminator.droper(options.capture)
}
else if (options.test === true) {
   test()
}
else {
   let capture = true
   let reverseForms = true
   main(capture, reverseForms)
}


// nexe app.js --build --verbose -t window
// node app --drop
// node app --tool --keyword='GY' --capture
// node app --tool --keyword='Hirabari' --capture --template-seqs "88006,88007,88008,88009,88010"
// node app --tool --keyword='Hirabari' --capture
// node app --tool --keyword='Hirabari' --capture --hidden -show-customer-data
// node app --tool --keyword='Tosan' --capture

