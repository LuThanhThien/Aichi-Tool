import config from '../configure/config.js';
import { log as _log } from '../log.js';
const fake = config.fake
const args = config.args
const _customerData = config.customerData

function generate(prob=0.4) {
   // This function is used to generate random customer data
   let customerData = {
      firstName: fake.firstName[Math.random() * fake.firstName.length | 0],
      lastName: fake.lastName[Math.random() * fake.lastName.length | 0],
      dateBirth: fake.dateBirth[Math.random() * fake.dateBirth.length | 0],
      gender: fake.gender[Math.random() * fake.gender.length | 0],
      phoneNumberHash: getRandomPhoneNumbers(args.mainPhoneNumberHash, fake.phoneNumberHash, prob),
      nation: fake.nation[Math.random() * fake.nation.length | 0],
      country: fake.country[Math.random() * fake.country.length | 0],
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

async function distribute(loggedPages, accounts, keyword, maxForms=3, showCustomerData=false, hidden=false) {
   let prob = (keyword === 'Tosan') ? 0 : 1
   let disPages = []                            // store distributed pages
   const numAccounts = accounts.length          // number of accounts
   if (hidden === true && keyword === 'Hirabari') {
      for (let i=0; i<_customerData.length; i++) {
         for (let j=0; j<numAccounts; j++) {
            disPages.push({
               account: loggedPages[j].account,
               browser: loggedPages[j].browser, 
               page: loggedPages[j].page, 
               isAvailable: loggedPages[j].isAvailable, 
               info: [_customerData[i]],
            })
         }
      }
   }
   else {
      for (let i=0; i<numAccounts*maxForms; i++) {
         let info = i < _customerData.length ? _customerData[i] : generate(prob);
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
   }

   if (showCustomerData == true) {
      for (let page of disPages) {
         _log('Customer data:', page.account)
         for (let info of page.info) {
            console.log(JSON.stringify(info))
         }
      }
      console.log('Total real customers: ' + _customerData.length)
   }
   // log.log(`Distributed ${disPages.length} pages to accounts`)
   return disPages
}

export default distribute
