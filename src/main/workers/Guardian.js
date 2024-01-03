import config from '../../configure/config.js'
import { Browser } from 'puppeteer'
import UserLogin from '../../main/page/UserLogin.js'
import Account from '../domain/Account.js'
import Pipeline from '../../main/lib/Pipeline.js'
import Pipes from '../../main/lib/Pipes.js'
import global from '../../configure/global.js'


/**
 * @param {Browser} accountBrowsers
 * @returns {Promise<void>}
 */
async function Guardian(accountBrowsers) {                                                                                  

   const PipelineMain = new Pipeline.Pipeline()

   let pipes = new Pipes([
      async () => {
         global.lists.accountList.addAll( config.accounts.map(account => new Account(account.username, account.password)) )
         global.lists.accountList.toJSONFile(Account)
      },
      async () => 
         await Promise.all(
            global.lists.accountList.map(async (account, i) => {
               const accountPage = await accountBrowsers[i].newPage()
               await accountPage.setViewport({ width: 1200, height: 800 })
               const userLogin = new UserLogin(accountBrowsers[i], accountPage, account)
               await userLogin.login()
               global.lists.accountList.toJSONFile(Account)
            })
         ),
   ])

   PipelineMain.addAll(pipes)
   await PipelineMain.run()
}

export default Guardian