import requests
import xml.etree.ElementTree as ET
from multiprocessing import Pool

#每次POST 20個，100次

def send_request(i):
    # 設定 POST 請求的 URL
    url = 'http://localhost:8081/'

    # 設定請求的標頭資訊，指定 Content-Type 為 application/xml
    headers = {'Content-Type': 'application/xml'}

    # 建構 XML 內容
    root = ET.Element('root')
    ET.SubElement(root, 'area').text = '桃園區'
    #ET.SubElement(root, 'type').text = '滲漏水管'
    #ET.SubElement(root, 'status').text = '待處理'
    #ET.SubElement(root, 'time1').text = '2024/04/03'
    #ET.SubElement(root, 'time2').text = '2024/04/03'

    # 將 XML 內容轉換為 bytes
    xml_content = ET.tostring(root)

    try:
        # 傳送 POST 請求
        response = requests.post(url, data=xml_content, headers=headers)

        # 檢查回應
        if response.status_code == 200:
            print(f'POST 請求 {i+1} 成功!')

            # 將回應內容以 UTF-8 編碼儲存到 txt 檔案
            with open(f'response.txt', 'a', encoding='utf-8') as f:
                f.write(response.text)
        else:
            print(f'POST 請求 {i+1} 失敗，狀態碼: {response.status_code}')
    except Exception as e:
        print(f'發生錯誤: {e}')

if __name__ == '__main__':
    # 建立一個進程池
    pool = Pool(processes=20)  # 可以根據需要調整進程數量

    # 使用平行迴圈執行 send_request 函數
    pool.map(send_request, range(100))

    # 關閉進程池
    pool.close()
    pool.join()