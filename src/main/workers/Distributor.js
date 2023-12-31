import utils from '../../utils.js'
import dir from '../../configure/dir.js'
import FormStatus from '../domain/FormStatus.js'
import Pipeline from '../lib/Pipeline.js'
import Pipes from '../lib/Pipes.js'
import DataList from '../domain/DataList.js'
import { log } from '../../log.js'

async function Distributor() {
   let forms = []
   const formStatusList = new DataList()
   let pipeline = new Pipeline.Pipeline()
   let pipes = new Pipes([
      async () => { forms = utils.importJSON(dir.out.jsonFormList) },
      async () => formStatusList.replaceAll(forms.map(form => new FormStatus(form))) ,
      async () => formStatusList.toJSONFile(FormStatus),
      new Pipeline.Recurrence(),
   ])
   pipeline.addAll(pipes)
   await pipeline.run()
}

export default Distributor
