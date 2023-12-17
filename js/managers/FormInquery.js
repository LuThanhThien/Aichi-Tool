
const config = require('../config')
const utils = require('../utils')
const logger = require('../workers/Logger')
const puppeteer = require('puppeteer')
const accountManager = require('./AccountManager')
const formManager = require('./FormManager')

async function droper(capture=false) {
   async function confirm(password) {
      return new Promise((resolve, reject) => {
         const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
         });
         readline.question('Enter password to confirm deletion: ', (input) => {
            readline.close();
            if (input === password) {
               resolve();
            } else {
               reject(new Error('Incorrect password'));
            }
         });
      });
   }
   try {
      const accounts = config.accounts
      await confirm('Delete All');
      logger.logging(null, `Deletion - BEGIN`)
      await Promise.all(accounts.map(async (account) => {
         if (config.testAccounts.includes(account.username)) {
            const browser = await puppeteer.launch({ headless: 'new' })
            const page = await browser.newPage()
            await page.goto(config.mainUrl)
            await dropAll(page, account, capture);
            await browser.close()
         }
         else {
            logger.logging(null, `ERROR: ${account.username} is not in test accounts - SKIP`)
         }
      }))
      logger.logging(null, `Deletion - END`);
      
   } catch (error) {
      console.error(error.message);
   }
}


async function dropAll(page, account, capture=false) {
   
   await accountManager.logIn(page, account)                                                    // login
   logger.logging(account, "Login finished - BEGIN")

   await page.goto(config.inqueryUrl)
   
   logger.logging(account, "Navigate to inquery page finished")
   if (capture) { await page.screenshot({path: `${logger.logPath}/${account.username}/inquery.png`, fullPage: true}) }

   // find all inquery forms
   let listItems = await formManager.findInqueryForms(page)
   // console.log(listItems)

   // delete all inquery forms
   if (listItems.length == 0) {
      logger.logging(account, "No inquery form found - END")
      return
   }
   else {
      logger.logging(account, `Found ${listItems.length} inquery forms`)
   }

   for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i]
      // click detail
      await page.evaluate(buttonId => {
         const button = document.querySelector(`input[id='${buttonId}']`);
         button.click();
       }, item.buttonId);
      await page.waitForNavigation()
      if (capture) { await page.screenshot({path: `${logger.logPath}/${account.username}/inquery-page-${i+1}.png`, fullPage: true}) }
      
      // delete form
      await page.evaluate(() => {
         document.querySelector(`input[id='delete']`).click();
      })
      logger.logging(account, `Inquery form [${i+1}] deleting`)
      await page.waitForNavigation()

      // confirm delete
      await page.evaluate(() => {
         document.querySelector(`input[class='c-btn_2 button-outline']`).click();
      })
      await page.waitForNavigation()

      await page.evaluate(() => {
         document.querySelector(`input[id='confirm']`).click();
      })
      await page.waitForNavigation()

      if (capture) { await page.screenshot({path: `${logger.logPath}/${account.username}/inquery-done-${i+1}.png`, fullPage: true}) }
      logger.logging(account, `Inquery form [${i+1}] finished`)

      // back to inquery page
      await page.goto(config.inqueryUrl)
   }
   
   logger.logging(null, "Deletion process finished - END")
}

module.exports = {   
   droper, dropAll,
}