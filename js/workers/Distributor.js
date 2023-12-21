const puppeteer = require('puppeteer-extra')
const config = require('../config')
const utils = require('../utils')
const logger = require('./Logger')
const accountManager = require('../managers/AccountManager')

// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 

function generate(prob=0.4) {
   // This function is used to generate random customer data
   let customerData = {
      firstName: config.infoFake.firstName[Math.random() * config.infoFake.firstName.length | 0],
      lastName: config.infoFake.lastName[Math.random() * config.infoFake.lastName.length | 0],
      dateBirth: config.infoFake.dateBirth[Math.random() * config.infoFake.dateBirth.length | 0],
      gender: config.infoFake.gender[Math.random() * config.infoFake.gender.length | 0],
      phoneNumberHash: getRandomPhoneNumbers(config.mainPhoneNumberHash, config.infoFake.phoneNumberHash, prob),
      nation: config.infoFake.nation[Math.random() * config.infoFake.nation.length | 0],
      country: config.infoFake.country[Math.random() * config.infoFake.country.length | 0],
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
   // logger.logging(null, `Distributed ${disPages.length} pages to accounts`)
   return disPages
}

module.exports = distribute