import datetime
import pandas as pd
import yaml

#  URLs
mainUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_initDisplay"
logInUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/profile/userLogin"
inqueryUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_initDisplay"
detailBaseUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_detailList__"

#  LOGGER
current_date = datetime.date.today()
print(current_date)
DateComponents = {
   "year": datetime.datetime.now().year,
   "month": str(datetime.datetime.now().month).zfill(2),
   "date": str(datetime.datetime.now().day).zfill(2),
   "hours": str(datetime.datetime.now().hour).zfill(2),
   "minutes": str(datetime.datetime.now().minute).zfill(2),
   "seconds": str(datetime.datetime.now().second).zfill(2),
}
DateCombined = {
   "dateString": f"{DateComponents['year']}-{DateComponents['month']}-{DateComponents['date']} {DateComponents['hours']}:{DateComponents['minutes']}:{DateComponents['seconds']}",
   "thisDate": f"{DateComponents['year']}-{DateComponents['month']}-{DateComponents['date']}",
   "thisTime": f"{DateComponents['hours']}:{DateComponents['minutes']}:{DateComponents['seconds']}",
   "thisTimeLog": f"{DateComponents['hours']}-{DateComponents['minutes']}-{DateComponents['seconds']}",
}
#  ACCOUNT MANAGER
testAccounts = ['luthien5921@gmail.com', 'giathanh010101@gmail.com', 'piechipiechipeach@gmail.com', 'piechipiechipeach@gmail.com', 'piechipeach@gmail.com', 'nqkhanhtoan@gmail.com']
accounts = [
   # TEST
   # { "username": 'luthien5921@gmail.com', "password": 'aichi@5921' },       
   # { "username": 'giathanh010101@gmail.com', "password": 'aichi@5921'},   
   #  { "username": 'piechipiechipeach@gmail.com', "password": 'aichi@5921'},     
   #  { "username": 'piechipeach@gmail.com', "password": 'aichi@5921'},     
   #  { "username": 'nqkhanhtoan@gmail.com', "password": 'aichi@5921'},     
   #  TOSAN minor
   #  { "username": 'ngthanh96.04@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'trminh94.05@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'ngtam94.24@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'mg06p6@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'tthanh050206@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'ble79037@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'thoainhatvy@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'dieptram78@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'vuvananh488@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'truongbui0425@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'tanvuongvo76@gmail.com', "password": 'hoahong1234' },
   #  TOSAN main
   #  { "username": 'benhosong@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'dieptram78@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'davidalaba00000@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'ble79037@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'benemmai380@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'Jennygreen270295@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'Nickpown0411@gmail.com', "password": 'hoahong1234' },
   #  { "username": 'Jamebrown0206@gmail.com', "password": 'hoahong1234' },
]


# FORM MANAGER
filterKeyword = 'Tosan'
displayNumber = 50
with open('./input/infofake.yml', 'r', encoding='utf-8') as file:
   infoFake = yaml.safe_load(file)

customerData = pd.read_csv('./data/customers.csv')
formJSONPath = "./input/forms.json"
accountJSONPath = "./input/accounts.json"


def main():
   print(infoFake)
   print(DateCombined)
   print(DateComponents)
   print(current_date)
   print(customerData)

if __name__ == "__main__":
   # main()
   pass