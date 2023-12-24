const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')
const logger = require('../workers/Logger')
const accountManager = require('../managers/AccountManager')


function generate(prob=0.4) {
   // This function is used to generate random customer data
   let customerData = {
      firstName: config.fake.firstName[Math.random() * config.fake.firstName.length | 0],
      lastName: config.fake.lastName[Math.random() * config.fake.lastName.length | 0],
      dateBirth: config.fake.dateBirth[Math.random() * config.fake.dateBirth.length | 0],
      gender: config.fake.gender[Math.random() * config.fake.gender.length | 0],
      phoneNumberHash: getRandomPhoneNumbers(config.args.mainPhoneNumberHash, config.fake.phoneNumberHash, prob),
      nation: config.fake.nation[Math.random() * config.fake.nation.length | 0],
      country: config.fake.country[Math.random() * config.fake.country.length | 0],
   }
   return customerData
}

function getRandomPhoneNumbers(mainPhoneNumber, phoneNumberArray, prob=0.4) {
   // Randomly select each element to be either a fake phone number or the constant phone number
   const result = phoneNumberArray.map(() => {
      // Randomly choose whether to use a fake phone number or the constant phone number
      const useFakeNumber = Math.random() < prob;
      return useFakeNumber ? phoneNumberArray[Math.random() * phoneNumberArray.length | 0] : mainPhoneNumber;
   });

   return result[0];
}

async function distribute(loggedPages, accounts, keyword, maxForms=3) {
   let prob = 0.4
   if (keyword === 'Tosan') { prob = 0 }
   let disPages = []                            // store distributed pages
   const numAccounts = accounts.length          // number of accounts
   for (i=0; i<numAccounts*maxForms; i++) {
      let info = i < config.customerData.length ? config.customerData[i] : generate(prob);
      let j = i % numAccounts
      if (i < numAccounts) {
         disPages.push({
            account: loggedPages[j].account,
            browser: loggedPages[j].browser, 
            page: loggedPages[j].page, 
            isAvailable: loggedPages[j].isAvailable, 
            info: [info],
         })
      }
      else {
         disPages[j].info.push(info)
      }
   }
   // logger.log(`Distributed ${disPages.length} pages to accounts`)
   return disPages
}

module.exports = distribute