import DataList from './DataList.js'
import Form from './Form.js'

class Account {
   /**
    * @param {string} username
    * @param {string} password
    */
   constructor(username='luthien5921@gmail.com', password='aichi@5921') {
      this.username = username
      this.password = password
      this.isLogin = false
      this.busy = false
      this.filling = new Form()
      this.forms = new DataList()
   }

   /**
    * @param {Form} form
    */
   addForm(form) {
      this.forms.add(form)
   }

   /**
    * @param {Array<Form>} forms
    */
   addForms(forms) {
      this.forms.addAll(forms)
   }

}

export default Account