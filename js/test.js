// Description: This file contains the functions that are used to manage the forms.
const puppeteer = require('puppeteer')
const fs = require('fs')  
const config = require('./config')
const utils = require('./utils')
const logger = require('./workers/Logger')
const { link } = require('fs')
const { log } = require('console')

let list = [
   {
      "name": "Tosan",
      "Date": "<2021-08-03>",
   },
   {
      "name": "Tosan",
      "Date": "2021-08-01",
   },
   {
      "name": "Tosan",
      "Date": "<2021-08-02>",
   }
]

// Define a custom sorting function
function customSort(a, b) {
   const dateA = parseInt(a.title.replace(/[^\d]/g, ''), 10); // Extract numeric part of date
   const dateB = parseInt(b.title.replace(/[^\d]/g, ''), 10);

   return dateA - dateB;
}

// Sort the list using the custom sorting function
list.sort(customSort);

console.log(list);

