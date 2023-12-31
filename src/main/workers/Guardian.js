import config from '../../configure/config.js'
import { Browser } from 'puppeteer'
import UserLogin from '../../main/html/UserLogin.js'
import Account from '../domain/Account.js'
import DataList from '../domain/DataList.js'
import Pipeline from '../../main/lib/Pipeline.js'
import Pipes from '../../main/lib/Pipes.js'


/**
 * @param {Browser} accountBrowsers
 * @returns {Promise<void>}
 */
async function Guardian(accountBrowsers) {                                                                                  
   const accountList = new DataList()

   const PipelineMain = new Pipeline.Pipeline()
   let pipes = new Pipes([
      async () => {
         accountList.addAll( config.accounts.map(account => new Account(account.username, account.password)) )
         accountList.toJSONFile(Account)
      },
      async () => 
         await Promise.all(
            accountList.map(async (account, i) => {
               const accountPage = await accountBrowsers[i].newPage()
               await accountPage.setViewport({ width: 1200, height: 800 })
               const userLogin = new UserLogin(accountBrowsers[i], accountPage, account)
               await userLogin.login()
               accountList.toJSONFile(Account)
            })
         ),
   ])

   PipelineMain.addAll(pipes)
   await PipelineMain.run()
}

export default Guardian