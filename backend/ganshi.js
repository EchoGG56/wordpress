const https = require('https');

function getGanZhiFromAPI(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const url = `https://cn.apihz.cn/api/time/getzdday.php?id=88888888&key=88888888&nian=${year}&yue=${month}&ri=${day}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 200) {
            resolve({
              year: result.ganzhinian,
              month: result.ganzhiyue,
              day: result.ganzhiri,
              lunarDate: `${result.nyue}${result.nri}`,
              solarDate: `${result.ynian}年${result.yyue}月${result.yri}日`,
              weekday: result.xingqi,
              shengxiao: result.shengxiao,
              yi: result.yi,
              ji: result.ji
            });
          } else {
            reject(new Error(`API返回错误: ${result.msg}`));
          }
        } catch (error) {
          reject(new Error('解析API响应失败'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

const today = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
const todayStr = today.toLocaleDateString('zh-CN', options);

getGanZhiFromAPI(today)
  .then((data) => {
    console.log('══════════════════════');
    console.log('       今日干支查询      ');
    console.log('══════════════════════');
    console.log(` 日期：${todayStr}`);
    console.log(` 农历：${data.lunarDate}`);
    console.log(` 生肖：${data.shengxiao}`);
    console.log('──────────────────────');
    console.log(` 年柱：${data.year}`);
    console.log(` 月柱：${data.month}`);
    console.log(` 日柱：${data.day}`);
    console.log('──────────────────────');
    if (data.yi) {
      console.log(` 宜：${data.yi}`);
    }
    if (data.ji) {
      console.log(` 忌：${data.ji}`);
    }
    console.log('══════════════════════');
  })
  .catch((error) => {
    console.error('获取干支信息失败:', error.message);
    console.log('正在使用本地算法计算...');
    
    const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const year = today.getFullYear();
    const yearGanIndex = (year - 4) % 10;
    const yearZhiIndex = (year - 4) % 12;
    const yearGanZhi = gan[yearGanIndex] + zhi[yearZhiIndex];
    
    const baseDate = new Date('1900-01-01');
    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayGanIndex = (diffDays + 9) % 10;
    const dayZhiIndex = (diffDays + 1) % 12;
    const dayGanZhi = gan[dayGanIndex] + zhi[dayZhiIndex];
    
    const month = today.getMonth() + 1;
    const monthZhiIndex = (month + 1) % 12;
    let monthGanIndex;
    if (yearGanIndex === 0 || yearGanIndex === 5) {
      monthGanIndex = (month + 1) % 10;
    } else if (yearGanIndex === 1 || yearGanIndex === 6) {
      monthGanIndex = (month + 3) % 10;
    } else if (yearGanIndex === 2 || yearGanIndex === 7) {
      monthGanIndex = (month + 5) % 10;
    } else if (yearGanIndex === 3 || yearGanIndex === 8) {
      monthGanIndex = (month + 7) % 10;
    } else {
      monthGanIndex = (month + 9) % 10;
    }
    const monthGanZhi = gan[monthGanIndex] + zhi[monthZhiIndex];
    
    console.log('══════════════════════');
    console.log('       今日干支查询      ');
    console.log('══════════════════════');
    console.log(` 日期：${todayStr}`);
    console.log(` 年柱：${yearGanZhi}年`);
    console.log(` 月柱：${monthGanZhi}月`);
    console.log(` 日柱：${dayGanZhi}日`);
    console.log('══════════════════════');
  });