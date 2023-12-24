module.exports = {
   path: '.',
      input: {
         path: './input',
         csv: {
            path: './input/csv',
            customers: {
               path: './input/csv/customers.csv',
            },
            countries: {
               path: './input/csv/countries.csv',
            },
            nations: {
               path: './input/csv/nations.csv',
            },
         },
         yaml: {
            path: './input/yaml',
            args: {
               path: './input/yaml/args.yml'
            },
            fake: {
               path: './input/yaml/fake.yml'
            },
         },
         txt: {
            path: './input/txt',
            customers: {
               path: './input/txt/customers.txt'
            },
            countries: {
               path: './input/txt/countries.txt'
            },
            nations: {
               path: './input/txt/nations.txt'
            },
         },
      },
      out: {
         path: './out',
         json: {
            path: './out/json',
            accountList: {
               path: './out/json/accountList.json'
            },
            formList: {
               path: './out/json/formList.json'
            },
            formStatus: {
               path: './out/json/formStatus.json'
            },
         },
      }
   }