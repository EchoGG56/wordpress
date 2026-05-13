#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const monthGanZhiMap = {
  2026: { 1: '辛丑', 2: '壬寅', 3: '癸卯', 4: '甲辰', 5: '癸巳', 6: '甲午', 7: '乙未', 8: '丙申', 9: '丁酉', 10: '戊戌', 11: '己亥', 12: '庚子' },
  2025: { 1: '丙子', 2: '丁丑', 3: '戊寅', 4: '乙卯', 5: '庚辰', 6: '辛巳', 7: '壬午', 8: '癸未', 9: '甲申', 10: '乙酉', 11: '丙戌', 12: '丁亥' },
  2024: { 1: '甲子', 2: '乙丑', 3: '丙寅', 4: '丁卯', 5: '戊辰', 6: '己巳', 7: '庚午', 8: '辛未', 9: '壬申', 10: '癸酉', 11: '甲戌', 12: '乙亥' },
  2023: { 1: '壬子', 2: '癸丑', 3: '甲寅', 4: '乙卯', 5: '丙辰', 6: '丁巳', 7: '戊午', 8: '己未', 9: '庚申', 10: '辛酉', 11: '壬戌', 12: '癸亥' },
  2022: { 1: '辛丑', 2: '壬寅', 3: '癸卯', 4: '甲辰', 5: '乙巳', 6: '丙午', 7: '丁未', 8: '戊申', 9: '己酉', 10: '庚戌', 11: '辛亥', 12: '壬子' },
  2027: { 1: '辛丑', 2: '壬寅', 3: '癸卯', 4: '甲辰', 5: '乙巳', 6: '丙午', 7: '丁未', 8: '戊申', 9: '己酉', 10: '庚戌', 11: '辛亥', 12: '壬子' }
};

function getGanZhi(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const yearGanIndex = (year - 4) % 10;
  const yearZhiIndex = (year - 4) % 12;
  const yearGanZhi = TIANGAN[yearGanIndex] + DIZHI[yearZhiIndex];
  
  const monthGanZhi = monthGanZhiMap[year] && monthGanZhiMap[year][month] 
    ? monthGanZhiMap[year][month] 
    : getMonthGanZhiFallback(year, month);
  
  const dayGanZhi = getDayGanZhi(year, month, day);
  
  const zodiacIndex = (year - 4) % 12;
  
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  
  return {
    year: yearGanZhi + '年',
    month: monthGanZhi + '月',
    day: dayGanZhi + '日',
    dateStr: `${year}年${month}月${day}日`,
    weekday: weekdays[date.getDay()],
    shengxiao: ZODIACS[zodiacIndex]
  };
}

function getMonthGanZhiFallback(year, month) {
  const yearGanIdx = (year - 4) % 10;
  const monthZhiIndex = (month + 1) % 12;
  const ganOffset = yearGanIdx * 2;
  const monthGanIndex = (ganOffset + monthZhiIndex - 2 + 10) % 10;
  return TIANGAN[monthGanIndex] + DIZHI[monthZhiIndex];
}

function getDayGanZhi(year, month, day) {
  const knownDates = {
    '2026-05-13': '丁亥', '2026-05-12': '丙戌', '2026-05-11': '乙酉', '2026-05-10': '甲申',
    '2026-05-09': '癸未', '2026-05-08': '壬午', '2026-05-07': '辛巳', '2026-05-06': '庚辰',
    '2026-05-05': '己卯', '2026-05-04': '戊寅', '2026-05-03': '丁丑', '2026-05-02': '丙子',
    '2026-05-01': '乙亥'
  };
  
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  if (knownDates[dateKey]) {
    return knownDates[dateKey];
  }
  
  const baseDate = new Date('2026-05-13');
  const targetDate = new Date(year, month - 1, day);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const baseGanIdx = 3;
  const baseZhiIdx = 11;
  
  const ganIdx = (baseGanIdx + diffDays + 10) % 10;
  const zhiIdx = (baseZhiIdx + diffDays + 12) % 12;
  
  return TIANGAN[ganIdx] + DIZHI[zhiIdx];
}

function generateHTML(data) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>今日干支查询</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 450px;
      width: 100%;
      text-align: center;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #666;
      font-size: 14px;
    }
    
    .date-info {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }
    
    .date-info .date {
      font-size: 18px;
      color: #555;
      margin-bottom: 8px;
    }
    
    .date-info .weekday {
      font-size: 14px;
      color: #888;
    }
    
    .ganzhi-display {
      margin-bottom: 25px;
    }
    
    .ganzhi-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }
    
    .ganzhi-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .ganzhi-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .ganzhi-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      letter-spacing: 2px;
    }
    
    .ganzhi-value.year { color: #e74c3c; }
    .ganzhi-value.month { color: #3498db; }
    .ganzhi-value.day { color: #27ae60; }
    
    .shengxiao {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 25px;
    }
    
    .shengxiao span {
      font-size: 16px;
      color: #8b4513;
    }
    
    .shengxiao .animal {
      font-size: 28px;
      font-weight: bold;
      margin-left: 8px;
    }
    
    .footer {
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .footer p {
      font-size: 12px;
      color: #999;
    }
    
    .refresh-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 30px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 15px;
    }
    
    .refresh-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    
    .input-section {
      margin-bottom: 25px;
    }
    
    .input-section label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .input-section input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #eee;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .input-section input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .query-btn {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 30px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
      width: 100%;
    }
    
    .query-btn:hover {
      transform: scale(1.02);
      box-shadow: 0 5px 20px rgba(39, 174, 96, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌙 今日干支查询</h1>
      <p>了解今日天干地支，把握吉祥时辰</p>
    </div>
    
    <div class="input-section">
      <label for="queryDate">查询指定日期（选填）</label>
      <input type="date" id="queryDate" placeholder="选择日期">
      <button class="query-btn" onclick="queryDate()">查询</button>
    </div>
    
    <div class="date-info">
      <div class="date">${data.dateStr}</div>
      <div class="weekday">${data.weekday}</div>
    </div>
    
    <div class="ganzhi-display">
      <div class="ganzhi-item">
        <span class="ganzhi-label">年柱</span>
        <span class="ganzhi-value year">${data.year}</span>
      </div>
      <div class="ganzhi-item">
        <span class="ganzhi-label">月柱</span>
        <span class="ganzhi-value month">${data.month}</span>
      </div>
      <div class="ganzhi-item">
        <span class="ganzhi-label">日柱</span>
        <span class="ganzhi-value day">${data.day}</span>
      </div>
    </div>
    
    <div class="shengxiao">
      <span>生肖：</span>
      <span class="animal">${data.shengxiao}</span>
    </div>
    
    <button class="refresh-btn" onclick="refreshPage()">🔄 刷新</button>
    
    <div class="footer">
      <p>每日自动更新 | 数据仅供参考</p>
    </div>
  </div>
  
  <script>
    function refreshPage() {
      window.location.reload();
    }
    
    function queryDate() {
      const dateInput = document.getElementById('queryDate');
      const date = dateInput.value;
      if (date) {
        window.location.href = '/?date=' + date;
      } else {
        window.location.href = '/';
      }
    }
  </script>
</body>
</html>
  `;
}

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') {
    res.writeHead(404);
    res.end();
    return;
  }
  
  const url = new URL(req.url, 'http://localhost:3000');
  const dateParam = url.searchParams.get('date');
  
  let targetDate = new Date();
  if (dateParam) {
    const dateParts = dateParam.split('-');
    if (dateParts.length === 3) {
      targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    }
  }
  
  const data = getGanZhi(targetDate);
  
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(generateHTML(data));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🌙 干支查询 Web 服务已启动`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
});