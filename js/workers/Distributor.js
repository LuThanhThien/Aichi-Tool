const puppeteer = require('puppeteer')
const config = require('../configure/config')
const utils = require('../utils')
const dir = require('../configure/dir')
const Pipeline = require('../html/Pipeline')
const { Form, FormStatus, FormStatusList } = require('../data/Forms')

async function Distributor() {
   const forms = utils.importJSON(dir.out.json.formList.path)
   const formStatusList = new FormStatusList()
   Promise.all(forms.map(async form => {
      formStatusList.add(new FormStatus(form))
   }))
   console.log(formStatusList)
   formStatusList.toJSONFile()
}

module.exports = Distributor