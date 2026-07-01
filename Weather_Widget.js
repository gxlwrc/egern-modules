// iOS 风格天气小组件
export default async function(ctx) {
  const token = "yCRHZoxURpIEmwvO";
  const loc = "117.07,36.72"; // 潍坊
  
  const url = `https://api.caiyunapp.com/v2.6/${token}/${loc}/weather?dailystep=1&hourlysteps=24`;
  
  const resp = await fetch(url);
  const data = await resp.json();
  
  const w = data.result;
  const hourly = w.hourly;
  
  const temp = Math.round(hourly.temperature[0].value);
  const desc = hourly.description[0].value;
  const humidity = Math.round(hourly.humidity[0].value * 100);
  
  // 天气图标
  let icon = "☀️";
  if (desc.includes("雨")) icon = "🌧";
  else if (desc.includes("云")) icon = "⛅";
  else if (desc.includes("阴")) icon = "☁️";
  else if (desc.includes("雪")) icon = "❄️";
  else if (desc.includes("雾") || desc.includes("霾")) icon = "🌫";
  
  // 背景色（iOS 风格渐变色系）
  let bg = "#4a90d9";
  if (desc.includes("雨")) bg = "#5b7a8a";
  else if (desc.includes("云") || desc.includes("阴")) bg = "#6b8e9e";
  else if (desc.includes("晴")) bg = "#4a90d9";
  else if (desc.includes("雪")) bg = "#8ba4b5";
  else if (desc.includes("雾") || desc.includes("霾")) bg = "#8e9eab";
  
  return {
    type: "widget",
    children: [
      {
        type: "vstack",
        spacing: 0,
        children: [
          // 城市名
          { type: "text", text: "潍坊", font: { size: 13, weight: "medium" }, color: "#ffffff" },
          
          // 温度（大字）
          { type: "text", text: `${temp}°`, font: { size: 38, weight: "thin" }, color: "#ffffff" },
          
          // 图标 + 天气描述
          { type: "text", text: `${icon} ${desc}`, font: { size: 11 }, color: "#ffffffcc" },
          
          // 湿度
          { type: "text", text: `湿度 ${humidity}%`, font: { size: 10 }, color: "#ffffff99" }
        ]
      }
    ],
    background: {
      color: bg
    }
  };
}
