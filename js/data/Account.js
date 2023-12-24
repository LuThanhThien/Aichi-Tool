const { Form, FormList } = require('./Forms')
const utils = require('../utils')
const dir = require('../configure/dir')


class Account {
   constructor(username, password) {
      this.username = username
      this.password = password
      this.isLogin = false
      this.busy = false
      this.forms = new FormList()
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

class AccountList extends Array{
   constructor() {
      super()
   }

   /**
    * @param {Account} account
    */
   add(account) {
      this.push(account)
   }

   /**
    * @param {Array<Account>} accounts
    */
   addAll(accounts) {
      this.push(...accounts)
   }

   getAvailable() {
      return this.filter(account => account.isLogin && !account.busy)
   }

   getBusy() {
      return this.filter(account => account.busy)
   }

   getLogin() {
      return this.filter(account => account.isLogin)
   }

   getLogout() {
      return this.filter(account => !account.isLogin)
   }

   toJSONFile() {
      utils.exportJSON(this, dir.out.json.accountList.path)
   }

}

module.exports = { Account, AccountList }