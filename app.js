import { program } from 'commander'
import config from './src/configure/config.js'
import dir from './src/configure/dir.js'
import utils from './src/utils.js'

// objects
import formEliminator from './src/managers/FormInquery.js'
import formManager from './src/managers/FormManager.js'

// workers 
import { logger as _logger, log } from './src/log.js'
import Finder from './src/components/Finder.js'
import Accountor from './src/components/Accountor.js'
import Distributor from './src/components/Distributor.js'
import Filler from './src/components/Filler.js'

// lib
import ProxyBrowser from './src/main/lib/ProxyPuppeteer.js'
import Pipeline from './src/main/lib/Pipeline.js'
import Pipes from './src/main/lib/Pipes.js'

// new workers
import FinderWorker from './src/main/workers/Finder.js'
import GuardianWorker from './src/main/workers/Guardian.js'
import DistributorWorker from './src/main/workers/Distributor.js'
import init from './src/init.js'


// init logger
_logger()

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
   log(`ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}, reverseForms = ${reverseForms}, hidden = ${hidden}, templateSeqs = ${templateSeqs}, showCustomerData = ${showCustomerData}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   let [ 
      { listForms, formPage },
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
         log(`RELOAD ACCOUNT PAGES`, loggedPages.account, false)
         await Promise.all(disPages.map(async () => {
         }))
      }

      let filledForms = formManager.importJSON(dir.out.jsonAccountList) || {}   // store filled forms
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
      formManager.exportJSON(filledForms, dir.out.jsonAccountList)
      
      await new Promise(r => setTimeout(r, 1000))

      reRun++
      // if (maxRenit !== 0 && reRun >= maxRenit) { break }
   }
}

async function main(capture=false, reverseForms=false) {
   const keyword = "Tosan"
   const headless = false
   const maxRenit = 0
   tool(keyword, headless, capture, maxRenit, reverseForms, false, false, [], true)
}

async function onday(capture=false, reverseForms=false) {
   const keyword = "Hirabari"
   const headless = false
   const maxRenit = 0
   tool(keyword, headless, capture, maxRenit, reverseForms, false, true, [], true)
}

async function test(){

   let finderBrowser = await new ProxyBrowser().newBrowser({ headless: 'new' })
   let accountBrowsers = []
   for (let i=0; i<config.accounts.length; i++) {
      const accountBrowser = await new ProxyBrowser().newBrowser({ headless: false })
      accountBrowsers.push(accountBrowser)
   }

   new Pipeline.Pipeline([
      async () => init(),
      async () => 
         await Promise.all([
            GuardianWorker(accountBrowsers),
            FinderWorker(finderBrowser),
            DistributorWorker(),
         ]),
      ]).run()

}

program
   .option('--drop')
   .option('--tool')
   .option('--test')
   .option('--onday')
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
   let templateSeqs = options.templateSeqs
   try {
   }
   catch (error) {
      console.log('Cannot parse templateSeqs or templateSeqs is empty')
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
else if (options.onday === true) {
   let capture = true
   onday(capture, options.reverseForms)
}
else {
   let capture = true
   main(capture, options.reverseForms)
}


// nexe app.js --build --verbose -t window
// node app --drop
// node app --tool --keyword='GY' --capture
// node app --tool --keyword='Hirabari' --capture --template-seqs "88006,88007,88008,88009,88010"
// node app --tool --keyword='Hirabari' --capture
// node app --tool --keyword='Hirabari' --capture --hidden --show-customer-data
// node app --tool --keyword='Tosan' --capture

