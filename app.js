require('events').EventEmitter.defaultMaxListeners = 20
const { program } = require('commander');
const config = require('./js/config')

// objects
const formEliminator = require('./js/managers/FormEliminator')

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
async function tool(keyword='Hirabari', headless=false, capture=false, maxRenit=10000) {
   const accounts = config.accounts                                  // list of accounts
   const isHeadless = (headless === false) ? false: 'new'            // headless mode
   let maxForms = 3                                                  // max number of forms per account
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true   // test mode
   let startTimeAll = logger.logging(0, null, 
      `ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, headless = ${headless}, capture = ${capture}, test = ${test}`)   // start time
   
   // FIND ALL AVAILABLE FORMS AND STORE AND LOGIN ALL ACCOUNTS IN ADVANCE
   const [
      { listForms, formBrowser, formPage },
      loggedPages
      ] = await Promise.all([
         Finder(keyword, "new"),                    // find valid forms
         Accountor(accounts, isHeadless)                 // login all accounts
      ]);

   // DISTRIBUTE FORMS TO ACCOUNTS IN ADVANCE
   let disPages = await Distributor(loggedPages, accounts, maxForms)
   // for (p of disPages) {
   //    console.log(p.info)
   // }
   // return

   // AUTO FILL FORMS
   startTimeAll = logger.logging(startTimeAll, null, "Auto fill forms - BEGIN")
   let { failStore, totalSuccess } = await Filler(disPages, listForms, capture, test)

   // LOG FAILS AND SUCCESSFUL FORMS
   if (failStore.length > 0) {
      console.log(`FAILED FORMS: ${failStore.length}`)
      failStore.forEach((fail, i) => {
         console.log(`<${i+1}>. [${fail.account}] form [${fail.number}] - ${fail.title}`)
      })
   }
   else {
      console.log(`ALL SUCCESSFUL`)
   }
   console.log(`TOTAL SUCCESSFUL FORMS: ${totalSuccess}`)

   logger.logging(startTimeAll, null, "ALL FINISHED")
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

