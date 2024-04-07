// Sample events data
var eventsData = [];

// 新增 fetchXMLFile 函數
function fetchXMLFile() {
  fetch('events.xml')
    .then(response => response.text())
    .then(data => {
      parseXMLFile(data);
    })
    .catch(error => {
      console.error('載入 XML 文件時發生錯誤:', error);
    });
}

// 新增 parseXML 函數
function parseXMLFile(xmlData) {
  eventsData = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const records = xmlDoc.getElementsByTagName('records');

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const region = record.getElementsByTagName('region')[0].childNodes[0].nodeValue;
    const event = record.getElementsByTagName('event')[0].childNodes[0].nodeValue;
    const status = record.getElementsByTagName('status')[0].childNodes[0].nodeValue;
    const lat = parseFloat(record.getElementsByTagName('lat')[0].childNodes[0].nodeValue);
    const lng = parseFloat(record.getElementsByTagName('lng')[0].childNodes[0].nodeValue);

    eventsData.push({
      region,
      name: event,
      event,
      status,
      lat,
      lng,
    });
  }

  populateRegions();
  populateEvents();
  addMarkers();
}

// 新增 populateRegions 函數
function populateRegions() {
  const regionSelect = document.getElementById('region');
  const regions = new Set(eventsData.map((event) => event.region));

  regions.forEach((region) => {
    const option = document.createElement('option');
    option.value = region;
    option.text = region;
    regionSelect.add(option);
  });
}

// 新增 populateEvents 函數
function populateEvents() {
  const eventSelect = document.getElementById('event');
  const events = new Set(eventsData.map((event) => event.name));

  events.forEach((event) => {
    const option = document.createElement('option');
    option.value = event;
    option.text = event;
    eventSelect.add(option);
  });
}

// Initialize map
var map = L.map('map', {
  zoomControl: false, // 關閉 Zoom In 和 Zoom Out 按鈕
}).setView([24.9937, 121.2967], 13); // Taoyuan center coordinates

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Function to add markers to map
function addMarkers() {
  // Clear existing markers
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Filter events based on user selection
  var filteredEvents = eventsData.filter(function (event) {
    var regionFilter = document.getElementById('region').value;
    var eventFilter = document.getElementById('event').value;
    var statusFilter = document.getElementById('status').value;
    var startDateFilter = document.getElementById('startDate').value;
    var endDateFilter = document.getElementById('endDate').value;

    return (
      (regionFilter === '' || event.region === regionFilter) &&
      (eventFilter === '' || event.name === eventFilter) &&
      (statusFilter === '' || event.status === statusFilter) &&
      (startDateFilter === '' || event.date >= startDateFilter) &&
      (endDateFilter === '' || event.date <= endDateFilter)
    );
  });

  // Add markers for filtered events
  filteredEvents.forEach(function (event) {
    var markerColor;
    switch (event.status) {
      case '待處理':
        markerColor = 'red';
        break;
      case '處理中':
        markerColor = 'yellow';
        break;
      case '處理完成':
        markerColor = 'blue';
        break;
      default:
        markerColor = 'blue'; // 預設顏色為藍色
    }

    var marker = L.marker([event.lat, event.lng], {
      icon: L.icon({
        iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41], // 調整彈出視窗的位置
      }),
    }).addTo(map);

    var popupContent = '<div><p>' + event.name + '</br>' + event.status;
    ('</p><button id="showImageBtn">紀錄</button></div>');
    marker.bindPopup(popupContent);

    // Add event listener to the button inside popup
    marker.on('popupopen', function () {
      document
        .getElementById('showImageBtn')
        .addEventListener('click', function () {
          // Create a large popup window to display the image
          var imageUrl = '前台事件紀錄.png'; // 替換為你的圖片 URL
          var imagePopup = L.popup().setContent(
            '<img src="' + imageUrl + '" style="width: 800px; height: auto;"/>'
          ); // 設置圖片寬度為 400px，高度自動調整
          marker.bindPopup(imagePopup).openPopup();
        });
    });
  });
}
// Initial markers
addMarkers();
// Event listeners for filtering
document.getElementById('region').addEventListener('change', addMarkers);
document.getElementById('event').addEventListener('change', addMarkers);
document.getElementById('status').addEventListener('change', addMarkers);
document.getElementById('startDate').addEventListener('change', addMarkers);
document.getElementById('endDate').addEventListener('change', addMarkers);

window.onload = function () {
  fetchXMLFile();
  addMarkers(); //等待整體載入完成刷新一次
};
