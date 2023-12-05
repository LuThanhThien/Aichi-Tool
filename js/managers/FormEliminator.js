
const config = require('../config')
const utils = require('../utils')
const logger = require('../workers/Logger')
const puppeteer = require('puppeteer')
const accountManager = require('../managers/AccountManager')

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
      let startTimeAll = logger.logging(0, null, `Deletion - BEGIN`)
      await Promise.all(accounts.map(async (account) => {
         let startTimeInner = logger.logging(0)
         if (config.testAccounts.includes(account.username)) {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
            await page.goto(config.mainUrl)
            await dropAll(page, account, capture);
            await browser.close()
         }
         else {
            startTimeInner = logger.logging(startTimeInner, null, `ERROR: ${account.username} is not in test accounts - SKIP`)
         }
      }))
      startTimeAll = logger.logging(startTimeAll, null, `Deletion - END`);
      
   } catch (error) {
      console.error(error.message);
   }
}

async function dropAll(page, account, capture=false) {
   let startTime = logger.logging(0)
   
   await accountManager.logIn(page, account)                                                    // login
   startTime = logger.logging(startTime, account, "Login finished - BEGIN")

   await page.goto(config.inqueryUrl)
   
   startTime = logger.logging(startTime, account, "Navigate to inquery page finished")
   if (capture) { await page.screenshot({path: `${logger.logPath}/${account.username}/inquery.png`, fullPage: true}) }

   // find all inquery forms
   let listItems = await page.evaluate(config => {
      let tableRows = document.querySelectorAll('table tbody tr'); // Select all table rows
      let items = []; // Array to store the items

      tableRows.forEach((row, index) => {
         if(index !== 0) { // Skip the header row
            let item = {};
            let cells = row.querySelectorAll('td'); // Select all cells in the row

            item.id = cells[0].textContent.trim();
            item.name = cells[1].textContent.trim();
            item.contact = cells[2].textContent.trim();
            item.date = cells[3].textContent.trim();
            item.status = cells[4].textContent.trim();

            // Get the onclick attribute of the button
            let button = cells[5].querySelector('input[type="submit"]'); // Select the 'input' element in the last cell
            if(button) {
               item.buttonId = button.getAttribute('id');
            }

            items.push(item); // Add the item to the array
         }
      })
      return items
   }, config)
   
   // filter items if status is '"処理待ち"'
   const inqueryStatus = "処理待ち"
   listItems = listItems.filter(item => item.status.includes(inqueryStatus))    // deep-filter with exact keyword
   // console.log(listItems)

   if (listItems.length == 0) {
      startTime = logger.logging(startTime, account, "No inquery form found - END")
      return
   }
   else {
      startTime = logger.logging(startTime, account, `Found ${listItems.length} inquery forms`)
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
      startTime = logger.logging(startTime, account, `Inquery form [${i+1}] deleting`)
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
      startTime = logger.logging(startTime, account, `Inquery form [${i+1}] finished`)

      // back to inquery page
      await page.goto(config.inqueryUrl)
   }
   
   startTime = logger.logging(startTime, null, "Deletion process finished - END")
}

module.exports = {
   droper,
}