import requests
import xml.etree.ElementTree as ET

# 建構 XML 內容
root = ET.Element('root')
ET.SubElement(root, 'area').text = '桃園區'
ET.SubElement(root, 'type').text = '滲漏水管'
ET.SubElement(root, 'status').text = '待處理'
ET.SubElement(root, 'time1').text = '2024/04/03'
ET.SubElement(root, 'time2').text = '2024/04/03'

# 將 XML 內容轉換為 bytes
xml_content = ET.tostring(root)

# 設定 POST 請求的 URL
url = 'http://localhost:8081/'

# 設定請求的標頭資訊，指定 Content-Type 為 application/xml
headers = {'Content-Type': 'application/xml'}



try:
    # 傳送 POST 請求
    response = requests.post(url, data=xml_content, headers=headers)

    # 檢查回應
    if response.status_code == 200:
        print('POST 請求成功!')
     
    else:
        print(f'POST 請求失敗，狀態碼: {response.status_code}')
        
    # 將回應內容以 UTF-8 編碼儲存到 txt 檔案
    with open(f'response.txt', 'a', encoding='utf-8') as f:
        f.write(response.text)   
       
except Exception as e:
    print(f'發生錯誤: {e}')