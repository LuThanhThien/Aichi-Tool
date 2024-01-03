import DataList from "../main/domain/DataList.js"


const dir = {
   out: {
      jsonFormList: 'out/json/formList.json',
      jsonFormStatus: 'out/json/formStatus.json',
      jsonAccountList: 'out/json/accountList.json',
   },
   input: {
      csvCountries: 'input/csv/countries.csv',
      csvCustomers: 'input/csv/customers.csv',
      csvNations: 'input/csv/nations.csv',
      txtCountries: 'input/txt/countries.txt',
      txtCustomers: 'input/txt/customers.txt',
      txtNations: 'input/txt/nations.txt',
      yamlArgs: 'input/yaml/args.yml',
      yamlFake: 'input/yaml/fake.yml',
   },
}

const lists = {
   formList: new DataList(),
   accountList: new DataList(),
}

const map = {
   Form: dir.out.jsonFormList,
   FormStatus: dir.out.jsonFormStatus,
   Account: dir.out.jsonAccountList,
}

export default{
   dir: dir,
   lists: lists,
   map: map,
}
