const yaml = require('js-yaml')
const dir = require('./dir')
const { load } = require('csv-load-sync')
const fs = require('fs')

// URLs
const URLs = {
   mainUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_initDisplay",
   logInUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/profile/userLogin",
   inqueryUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_initDisplay",
   detailBaseUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_detailList__",
   formUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerDetail_mailto",
   confirmUrl: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offer_confirm",
   dispUrl: `https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_movePage?dispPage=`,
}
// LOGGER
const currentDateTime = new Date()
let DateComponents = {
      year: currentDateTime.getFullYear(),
      month: (currentDateTime.getMonth() + 1).toString().padStart(2, '0'), // Months are 0-based in JavaScript
      date: currentDateTime.getDate().toString().padStart(2, '0'),
      hours: currentDateTime.getHours().toString().padStart(2, '0'),
      minutes: currentDateTime.getMinutes().toString().padStart(2, '0'),
      seconds: currentDateTime.getSeconds().toString().padStart(2, '0'),
   }
let DateCombined = {
      dateString: `${DateComponents.year}-${DateComponents.month}-${DateComponents.date} ${DateComponents.hours}:${DateComponents.minutes}:${DateComponents.seconds}`,
      thisDate: `${DateComponents.year}-${DateComponents.month}-${DateComponents.date}`,
      thisTime: `${DateComponents.hours}:${DateComponents.minutes}:${DateComponents.seconds}`,
      thisTimeLog: `${DateComponents.hours}-${DateComponents.minutes}-${DateComponents.seconds}`,
   }

// ACCOUNTS
const testAccounts = ['luthien5921@gmail.com', 'luthien5921+shinsei1@gmail.com', 'luthien5921+shinsei2@gmail.com', 'giathanh010101@gmail.com', 'piechipiechipeach@gmail.com', 'piechipiechipeach@gmail.com', 'piechipeach@gmail.com', 'nqkhanhtoan@gmail.com']
const accounts = [
   // // TEST
   // { username: 'luthien5921@gmail.com', password: 'aichi@5921' },
   // { username: 'luthien5921+shinsei1@gmail.com', password: 'aichi@5921' },       
   { username: 'luthien5921+shinsei2@gmail.com', password: 'aichi@5921' },       
   { username: 'giathanh010101@gmail.com', password: 'aichi@5921'},   
   // { username: 'piechipiechipeach@gmail.com', password: 'aichi@5921'},     
   // { username: 'piechipeach@gmail.com', password: 'aichi@5921'},     
   // { username: 'nqkhanhtoan@gmail.com', password: 'aichi@5921'},     
   // TOSAN minor
   // { username: 'ngthanh96.04@gmail.com', password: 'hoahong1234' },
   // { username: 'trminh94.05@gmail.com', password: 'hoahong1234' },
   // { username: 'ngtam94.24@gmail.com', password: 'hoahong1234' },
   // { username: 'mg06p6@gmail.com', password: 'hoahong1234' },
   // { username: 'tthanh050206@gmail.com', password: 'hoahong1234' },
   // { username: 'ble79037@gmail.com', password: 'hoahong1234' },
   // { username: 'thoainhatvy@gmail.com', password: 'hoahong1234' },
   // { username: 'vuvananh488@gmail.com', password: 'hoahong1234' },
   // { username: 'truongbui0425@gmail.com', password: 'hoahong1234' },
   // { username: 'tanvuongvo76@gmail.com', password: 'hoahong1234' },
   // { username: 'marjyamada040493@gmail.com', password: 'Marj0409'}
   // TOSAN main
   // { username: 'nihahi50@gmail.com', password: 'hoahong1234' },
   { username: 'davidalaba00000@gmail.com', password: 'hoahong1234' },
   // { username: 'ble79037@gmail.com', password: 'hoahong1234' },
   // { username: 'benemmai380@gmail.com', password: 'hoahong1234' },
]


// INPUT 
const columns = ["firstName","lastName","dateBirth","gender","nation","country","phoneNumberHash"]
const customerData = load(dir.input.csv.customers.path)
const args = yaml.load(fs.readFileSync(dir.input.yaml.args.path), 'utf8')
const fake = yaml.load(fs.readFileSync(dir.input.yaml.fake.path), 'utf8')


// exports
module.exports = {
   URLs,
   DateComponents, DateCombined,
   accounts, testAccounts,
   customerData, columns, 
   args, fake, 
}

// console.log(fake.firstName)
