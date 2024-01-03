
// lib
import ProxyBrowser from './src/main/lib/ProxyPuppeteer.js'
import Pipeline from './src/main/lib/Pipeline.js'
import Pipes from './src/main/lib/Pipes.js'

// configure
import { logger } from './src/log.js'
import config from './src/configure/config.js'

// new workers
import FinderWorker from './src/main/workers/Finder.js'
import GuardianWorker from './src/main/workers/Guardian.js'
import DistributorWorker from './src/main/workers/Distributor.js'

// init
import init from './src/init.js'
logger()


export default async function (proxy=false) {
   let finderBrowser = await new ProxyBrowser(proxy).newBrowser({ headless: 'new' })
   let accountBrowsers = []
   for (let i=0; i<config.accounts.length; i++) {
      const accountBrowser = await new ProxyBrowser(proxy).newBrowser({ headless: false })
      accountBrowsers.push(accountBrowser)
   }

   let pipeline = new Pipeline.Pipeline(
      new Pipes([
      async () => init(),
      async () => 
         await Promise.all([
            GuardianWorker(accountBrowsers),
            FinderWorker(finderBrowser),
            DistributorWorker(),
         ]),
      ])
   )

   await pipeline.run()
}

// nexe app.js --build --verbose -t window
// node app --drop
// node app --tool --keyword='GY' --capture --proxy
// node app --tool --keyword='Hirabari' --capture --template-seqs "88006,88007,88008,88009,88010"
// node app --tool --keyword='Hirabari' --capture --proxy
// node app --tool --keyword='Hirabari' --capture --hidden --show-customer-data --proxy
// node app --tool --keyword='Tosan' --capture --proxy

