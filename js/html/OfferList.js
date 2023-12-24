const puppeteer = require('puppeteer')
const config = require('../configure/config')
const logger = require('../workers/Logger')
const utils = require('../utils')
const { Form, FormList } = require('../data/Forms')
const DataList = require('../data/DataList')

class OfferList {
   /**
   * @param {String} keyword
   * @param {Number} displayNumber
   * @param {puppeteer.Page} page
   */
   constructor (keyword='Tosan', displayNumber=50, page) {
      this.keyword = keyword
      this.displayNumber = displayNumber
      this.page = page
      this.formList = new DataList()
      this.filterSelector = "templateName"
      this.displaySelector = "top_ken_selectbox"
      this.allStatus = {
         aboutToClose: "もうすぐ終了",
         upcoming: "近日受付開始",
         passed: "受付終了しました" ,
         ended: "終了しました",
      }
      this.formListelectors = {
         listItems: '.c-box--cardList__item',
         title: '.c-box--cardList__item_h4',
         status: '.c-box--cardList__item__status',
         startDate: '.span-display-flex',
         endDate: '.span-display-flex',
         templateSeq: 'input[type="hidden"]',
         link: 'a',
         linkPrefix: "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_detailTop?tempSeq=",
         linkSuffix: "&accessFrom=offerList",
     }
   }

   get_formList() {
      return this.formList
   }

   async filter(options={ verbose: false }) {
      try {
         // redirect to main this.page
         if (this.page.url !== config.URLs.mainUrl) { 
            await this.page.goto(config.URLs.mainUrl)
          }   
         const keyword = this.keyword
         const filterSelector = this.filterSelector

         await this.page.evaluate( (filterSelector, keyword) => {
            // filter by keyword
            document.getElementsByName(filterSelector)[0].value = keyword       
         }, filterSelector, keyword)

         await this.page.focus(`input[name="${filterSelector}"]`)
         await this.page.keyboard.press('Enter')                                 
         await this.page.waitForNavigation()
         if (options.verbose) { logger.log(`Filter by keyword '${keyword}' finished`) }
         
         return true
      }
      catch (err) {
         logger.log(`ERROR: Cannot find available forms - SKIP`)
         console.error(err)
         return false
      }
   }


   async display(options={ verbose: false }) {
      try {         
         let availables = [10,20,50]
         if (!availables.includes(this.displayNumber)) {
            logger.log(`ERROR: Display number ${this.displayNumber} is not in availables - SKIP`)
            return false
         }

         const dispUrl = `${config.URLs.dispUrl}${this.displayNumber}`
         await this.page.goto(dispUrl)                                             // display n forms
         if (options.verbose) { logger.log(`Display ${this.displayNumber} forms finished`) }

         return true
      }
      catch (err) {
         logger.log(`ERROR: Cannot find available forms - SKIP`)
         console.error(err)
         return false
      }
   }

   async get(options={ verbose: false }) {
      // redirect to main this.page
      try {
         const selectors = this.formListelectors
        
         let formsData = await this.page.evaluate(async (selectors, isPast, stringToDate) => {
            const isPastFnc = new Function(`return ${isPast}`)()
            const stringToDateFnc = new Function(`return ${stringToDate}`)()
            return Array.from(document.querySelectorAll(selectors.listItems), li => {
                  const getTextContent = (element) => element ? element.textContent.replace(/\s+/g, ' ').trim() : null
                  const titleElement = li.querySelector(selectors.title)
                  const statusElement = li.querySelector(selectors.status)
                  const startDateElement = li.querySelectorAll(selectors.startDate)[1]
                  const endDateElement = li.querySelectorAll(selectors.endDate)[3]
                  const templateSeqElement = li.querySelector(selectors.templateSeq)
                  const linkElement = li.querySelector(selectors.link)
         
                  return {
                     title: getTextContent(titleElement),
                     status: getTextContent(statusElement),
                     startDate: getTextContent(startDateElement),
                     endDate: getTextContent(endDateElement),
                     templateSeq: templateSeqElement ? parseInt(templateSeqElement.value) : null,
                     link: selectors.linkPrefix + templateSeqElement.value + selectors.linkSuffix,
                     isAvailable: !!linkElement,
                     isPast: isPastFnc(getTextContent(startDateElement)),
                  }
            })
         }, selectors, utils.isPast.toString(), utils.stringToDate.toString())

         this.formList.replaceAll(
            formsData.map(data => 
               new Form(
                  data.title,
                  data.status,
                  data.startDate,
                  data.endDate,
                  data.templateSeq,
                  data.link,
                  data.isAvailable,
                  data.isPast
               )
            )
         )
         
         if (this.keyword != null && this.keyword != '') {
            this.formList = this.formList.filterInclude('title', this.keyword)    // deep-filter with exact keyword
         }
         
         if (options.verbose) { logger.log("Find offer forms finished. Total forms found: " + this.formList.length) }

         return true
      }
      catch (err) {
         logger.log(`ERROR: Cannot find offer forms - SKIP`)
         console.error(err)
         return false
      }
   }
}


module.exports = OfferList