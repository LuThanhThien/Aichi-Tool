import DataList from './DataList.js'
import Form from './Form.js'

class FormStatus {
   /**
    * @param {Form} form   
    */ 
   constructor(form) {
      this.templateSeq = form.templateSeq
      this.full = false
      this.accounts = new DataList()
   }
}

export default FormStatus