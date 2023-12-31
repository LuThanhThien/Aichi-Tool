import utils from '../../utils.js'
import dir from '../../configure/dir.js'
import FormStatus from '../domain/FormStatus.js'
import Pipeline from '../lib/Pipeline.js'
import Pipes from '../lib/Pipes.js'
import DataList from '../domain/DataList.js'
import { log } from '../../log.js'

async function distribute(formList, accountList) {

}

async function Distributor() {
   let forms = []
   const formStatusList = new DataList()
   let formStatusPipeLine = new Pipeline.Pipeline( )

   let pipes = new Pipes([
      async () => { forms = utils.importJSON(dir.out.jsonFormList) },
      async () => formStatusList.replaceAll(forms.map(form => new FormStatus(form))) ,
      async () => formStatusList.toJSONFile(FormStatus),
      new Pipeline.Recurrence(),
   ])

   formStatusPipeLine.addAll(pipes)
   await formStatusPipeLine.run()
}

export default Distributor
