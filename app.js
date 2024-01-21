import { program } from 'commander'
import { logger as _logger, log } from './src/log.js'
import config from './src/configure/config.js'
import global from './src/configure/global.js'

// objects
import formEliminator from './src/managers/FormInquery.js'
import formManager from './src/managers/FormManager.js'

// workers 
import Finder from './src/components/Finder.js'
import Accountor from './src/components/Accountor.js'
import Distributor from './src/components/Distributor.js'
import Filler from './src/components/Filler.js'
import utils from './src/utils.js'


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
                     fake=false,
                     templateSeqs=[],
                     showCustomerData=false,
                     proxy=false) {
   const accounts = config.accounts                                  // list of accounts
   const isHeadless = (headless === false) ? false: 'new'            // headless mode
   let maxForms = 3                                                  // max number of forms per account
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true   // test mode
   log(`ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}, reverseForms = ${reverseForms}, hidden = ${hidden}, fake = ${fake}, templateSeqs = ${templateSeqs}, showCustomerData = ${showCustomerData}, proxy = ${proxy}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   let [ 
      { listForms, formPage },
      loggedPages
   ] = await Promise.all([
      Finder(keyword, 'new', reverseForms, hidden, templateSeqs, proxy),                // find all available forms
      Accountor(accounts, isHeadless, proxy)        // login all accounts
   ])                 
   
   let reRun = 0
   let isReloaded = false
   let disPages = []                        
   let failStore = []
   let totalSuccess = 0
   while (true) {
      // DISTRIBUTE FORMS TO ACCOUNTS IN ADVANCE
      [  listForms,
         disPages 
      ] = await Promise.all([
         formManager.finder(formPage, keyword, reverseForms, hidden, templateSeqs),  // re-find all available forms
         Distributor(loggedPages, accounts, keyword, maxForms, showCustomerData, hidden, fake),       // distribute forms to accounts,
      ])

      
      // REALOAD DISPAGES
      if (reRun % 20 === 0 && reRun !== 0) {
         log(`RELOAD ACCOUNT PAGES`, loggedPages.account, false)
         await Promise.all(disPages.map(async (thisPage) => {
            await utils.reloadPage(thisPage)
         }))   
      }

      if (listForms.length === 0) { continue }

      let filledForms = formManager.importJSON(global.dir.out.jsonAccountList) || {}   // store filled forms
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
      formManager.exportJSON(filledForms, global.dir.out.jsonAccountList)
      
      await new Promise(r => setTimeout(r, 1000))

      reRun++
      // if (maxRenit !== 0 && reRun >= maxRenit) { break }
   }
}

async function main(capture=false, reverseForms=false, proxy=false) {
   const keyword = "Tosan"
   const headless = false
   const maxRenit = 0
   tool(keyword, headless, capture, maxRenit, reverseForms, false, false, [], true, proxy)
}

async function onday(capture=false, reverseForms=false) {
   const keyword = "Hirabari"
   const headless = false
   const maxRenit = 0
   tool(keyword, headless, capture, maxRenit, reverseForms, false, true, [], true)
}


program
   .option('--drop')
   .option('--tool')
   .option('--onday')
   .option('--proxy')
   .option('--keyword <string>')
   .option('--max-renit <number>')
   .option('--reverse-forms')
   .option('--headless')   
   .option('--capture')
   .option('--hidden')
   .option('--fake')
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
   tool(options.keyword, options.headless, options.capture, options.maxRenit, options.reverseForms, options.multiForms, options.hidden, options.fake, templateSeqs, options.showCustomerData, options.proxy)
}
else if (options.drop === true) {
   // console.log('Cannot perform this action in this version')
   formEliminator.droper(options.capture)
}
else if (options.onday === true) {
   let capture = true
   await onday(capture, options.reverseForms)
}
else {
   let capture = true
   // await main(capture, options.reverseForms, options.proxy)
   // --keyword='Hirabari' --capture --hidden --show-customer-data --proxy --fake
   tool('Hirabari', true, true, 10000, true, false, true, false, [], true, true)
   // --keyword='Hirabari' --capture --hidden --show-customer-data --proxy 
   // tool('Hirabari', true, true, 10000, false, false, true, false, [], true, true)
}


// nexe app.js --build --verbose -t window
// node app --drop
// node app --tool --keyword='GY' --capture --proxy
// node app --tool --keyword='Hirabari' --capture --template-seqs "88006,88007,88008,88009,88010"
// node app --tool --keyword='Hirabari' --capture --proxy
// node app --tool --keyword='Hirabari' --capture --hidden --show-customer-data --proxy
// node app --tool --keyword='Tosan' --capture --proxy

