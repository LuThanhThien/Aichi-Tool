const puppeteer = require('puppeteer')
const config = require('../config')
const utils = require('../utils')
const logger = require('./Logger')
const accountManager = require('../managers/AccountManager')

function generate() {
   // This function is used to generate random customer data
   let customerData = {
      firstName: config.infoFake.firstName[Math.random() * config.infoFake.firstName.length | 0],
      lastName: config.infoFake.lastName[Math.random() * config.infoFake.lastName.length | 0],
      dateBirth: config.infoFake.dateBirth[Math.random() * config.infoFake.dateBirth.length | 0],
      gender: config.infoFake.gender[Math.random() * config.infoFake.gender.length | 0],
      phoneNumberHash: config.infoFake.phoneNumberHash[Math.random() * config.infoFake.phoneNumberHash.length | 0],
      nation: config.infoFake.nation[Math.random() * config.infoFake.nation.length | 0],
      country: config.infoFake.country[Math.random() * config.infoFake.country.length | 0],
   }
   return customerData
}

async function distribute(loggedPages, accounts, maxForms=3) {
   let startTimeAll = logger.logging(0)
   let disPages = []                            // store distributed pages
   const numAccounts = accounts.length          // number of accounts
   for (i=0; i<numAccounts*maxForms; i++) {
      let info = i < config.customerData.length ? config.customerData[i] : generate();
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
   startTimeAll = logger.logging(startTimeAll, null, `Distributed ${disPages.length} pages to accounts`)
   return disPages
}

module.exports = async function(loggedPages, accounts, maxForms=3) {
   let disPages = distribute(loggedPages, accounts, maxForms)
   return disPages
}