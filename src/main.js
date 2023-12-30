import { filterKeyword, displayNumber as _displayNumber } from './resources/static/config.js';
import { log } from './workers/Logger.js';



async function initiate(page, keyword=filterKeyword, displayNumber=_displayNumber, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = log(0)
   await filterDisplay(page, null, keyword, displayNumber)                    // filter display   
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = log(startTime, null, "Initiate process finished")
   return listForms
}

async function renitiate(page, num, keyword=filterKeyword, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = log(0)
   await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });    // reload page
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = log(startTime, null, `Renitiate process <${num}> finished`)
   return listForms
}



export default {
   initiate,
   renitiate,
}