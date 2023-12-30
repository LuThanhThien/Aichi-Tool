import { accounts } from '../../resources/static/config.js'
import UserLogin from '../../main/html/UserLogin.js'
import { Account, AccountList } from '../../main/data/Account.js'
import Pipeline from '../../main/html/Pipeline.js'

async function Guardian(accountBrowsers) {                                                                                  
   const accountList = new AccountList()

   const PipelineInit = new Pipeline()
   const PipelineRenit = new Pipeline()
   const PipelineMain = new Pipeline()

   const pipesInit = [
      async () => {
      accountList.addAll(
            accounts.map(account => new Account(account.username, account.password))
         )
         accountList.toJSONFile()
      }
   ]  
   const pipesRenit = [
      async () => 
         await Promise.all(
            accountList.map(async (account, i) => {
               const accountPage = await accountBrowsers[i].newPage()
               await accountPage.setViewport({ width: 1200, height: 800 })
               const userLogin = new UserLogin(accountBrowsers[i], accountPage, account)
               await userLogin.login()
               accountList.toJSONFile()
            })
         ),
   ]
   const pipesMain = [
      async () => await PipelineInit.run(),
      async () => await PipelineRenit.run(),
   ]

   PipelineInit.addAll(pipesInit)
   PipelineRenit.addAll(pipesRenit)
   PipelineMain.addAll(pipesMain)

   await PipelineMain.run()
}

export default Guardian