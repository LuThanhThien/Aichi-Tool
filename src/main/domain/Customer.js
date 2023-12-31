import config from "../../configure/config.js"
import utils from "../../utils.js"


class Customer {
   /**
    * @param {string} firstName              // no leading and trailing spaces
    * @param {string} lastName               // no leading and trailing spaces
    * @param {string} dateBirth              // YYYYMMDD 
    * @param {string} gender                 // M or F
    * @param {string} phoneNumberHash        // 080-xxxx-xxxx  
    * @param {string} nation                 // 151: Vietnam
    * @param {string} country                // 150: Vietnam
    * @param {string} phoneNumber            // 080xxxxxxxx
   */
   constructor(firstName=utils.randomChoice(config.fake.firstName), 
               lastName=utils.randomChoice(config.fake.lastName), 
               dateBirth=utils.randomChoice(config.fake.dateBirth), 
               gender=utils.randomChoice(config.fake.gender), 
               phoneNumberHash=utils.randomChoice(config.fake.phoneNumberHash), 
               nation='151', 
               country='150') {
      this.firstName = firstName
      this.lastName = lastName
      this.dateBirth = dateBirth
      this.gender = gender
      this.phoneNumberHash = phoneNumberHash
      this.phoneNumber = phoneNumberHash.replace(/-/g, '')
      this.nation = nation
      this.country = country
      this.busy = false
      this.filled = false
   }
}

export default Customer

