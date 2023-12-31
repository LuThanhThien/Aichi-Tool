import Form from './Form.js'

class FormStatus {
   /**
    * @param {Form} form   
    */ 
   constructor(form) {
      this.templateSeq = form.templateSeq
      this.busy = false
      this.filled = false
   }

   get_templateSeq() {
      return this.templateSeq
   }

   set_templateSeq(templateSeq) {
      this.templateSeq = templateSeq
   }

   get_busy() {
      return this.busy
   }

   set_busy(busy) {
      this.busy = busy
   }

   get_filled() {
      return this.filled
   }

   set_filled(filled) {
      this.filled = filled
   }
}

export default FormStatus