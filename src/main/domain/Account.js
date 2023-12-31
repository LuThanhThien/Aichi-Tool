import DataList from './DataList.js'
import Form from './Form.js'

class Account {
   constructor(username, password) {
      this.username = username
      this.password = password
      this.isLogin = false
      this.busy = false
      this.forms = new DataList
   }

   get_username() {
      return this.username
   }

   set_username(username) {
      this.username = username
   }  

   get_password() {
      return this.password
   }

   set_password(password) {
      this.password = password
   }

   get_isLogin() {
      return this.isLogin
   }

   set_isLogin(isLogin) {
      this.isLogin = isLogin
   }

   get_busy() {
      return this.busy
   }

   set_busy(busy) {
      this.busy = busy
   }

   get_forms() {
      return this.forms
   }

   set_forms(forms) {
      this.forms = forms
   }

   /**
    * @param {Form} form
    */
   addForm(form) {
      this.forms.add(forms)
   }

   /**
    * @param {Array<Form>} forms
    */
   addForms(forms) {
      this.forms.addAll(forms)
   }

}

export default Account