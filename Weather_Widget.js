// 彩云天气小组件（天气背景色 + 大字体版）
export default async function(ctx) {
  const token = "yCRHZoxURpIEmwvO";
  const loc = "117.07,36.72"; // 潍坊
  
  const url = `https://api.caiyunapp.com/v2.6/${token}/${loc}/weather?dailystep=1&hourlysteps=24`;
  
  const resp = await fetch(url);
  const data = await resp.json();
  
  const w = data.result;
  const hourly = w.hourly;
  
  // 当前温度
  const temp = Math.round(hourly.temperature[0].value);
  const desc = hourly.description[0].value;
  
  // 日期
  const d = new Date();
  const weekday = ["日","一","二","三","四","五","六"][d.getDay()];
  const dateStr = `${d.getMonth()+1}月${d.getDate()}日 周${weekday}`;
  
  // 天气背景色
  let bgColor = "#4a90d9"; // 默认蓝
  if (desc.includes("雨")) bgColor = "#5b7a8a";
  else if (desc.includes("云") || desc.includes("阴")) bgColor = "#6b8e9e";
  else if (desc.includes("晴")) bgColor = "#4a90d9";
  else if (desc.includes("雪")) bgColor = "#8ba4b5";
  else if (desc.includes("雾") || desc.includes("霾")) bgColor = "#8e9eab";
  
  // 天气图标
  let icon = "☀️";
  if (desc.includes("雨")) icon = "🌧";
  else if (desc.includes("云")) icon = "⛅";
  else if (desc.includes("阴")) icon = "☁️";
  else if (desc.includes("雪")) icon = "❄️";
  else if (desc.includes("雾") || desc.includes("霾")) icon = "🌫";
  
  // 湿度
  const humidity = Math.round(hourly.humidity[0].value * 100);
  
  // AQI
  const aqi = w.realtime?.aqi || 50;
  
  // 下雨提醒
  let rainInfo = "";
  for (let i = 0; i < Math.min(6, hourly.precipitation.length); i++) {
    if (hourly.precipitation[i].value > 0.5) {
      rainInfo = `🌧 未来${i+1}小时可能下雨`;
      break;
    }
  }
  
  return {
    type: "widget",
    children: [
      {
        type: "vstack",
        spacing: 2,
        children: [
          { type: "text", text: `${icon} ${temp}°`, font: { size: 18, weight: "bold" } },
          { type: "text", text: desc, font: { size: 10 } },
          { type: "text", text: `💧${humidity}%`, font: { size: 9, color: "#aaa" } }
        ]
      }
    ],
    background: {
      color: bgColor
    }
  };
}
