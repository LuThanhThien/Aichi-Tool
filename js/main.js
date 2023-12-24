const utils = require('./utils')
const config = require('./config')
const logger = require('./workers/Logger');



async function initiate(page, keyword=config.filterKeyword, displayNumber=config.displayNumber, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = logger.log(0)
   await filterDisplay(page, null, keyword, displayNumber)                    // filter display   
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = logger.log(startTime, null, "Initiate process finished")
   return listForms
}

async function renitiate(page, num, keyword=config.filterKeyword, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = logger.log(0)
   await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });    // reload page
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = logger.log(startTime, null, `Renitiate process <${num}> finished`)
   return listForms
}



module.exports = {
   initiate,
   renitiate,
}