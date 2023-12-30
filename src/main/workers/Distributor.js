import { importJSON } from '../utils.js'
import { out } from '../../resources/static/dir.js'
import { FormStatus, FormStatusList } from '../../main/data/Forms.js'

async function Distributor() {
   const forms = importJSON(out.json.formList.path)
   const formStatusList = new FormStatusList()
   Promise.all(forms.map(async form => {
      formStatusList.add(new FormStatus(form))
   }))
   console.log(formStatusList)
   formStatusList.toJSONFile()
}

export default Distributor