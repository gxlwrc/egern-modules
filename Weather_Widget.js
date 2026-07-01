// 天气小组件 - Medium 适配版
export default async function(ctx) {
  const token = "yCRHZoxURpIEmwvO";
  const loc = "117.07,36.72";
  
  const url = `https://api.caiyunapp.com/v2.6/${token}/${loc}/realtime`;
  const resp = await fetch(url);
  const data = await resp.json();
  const r = data.result.realtime;
  
  const temp = Math.round(r.temperature);
  const humidity = Math.round(r.humidity * 100);
  const skycon = r.skycon;
  
  const iconMap = {
    "CLEAR_DAY": "☀️", "CLEAR_NIGHT": "🌙",
    "PARTLY_CLOUDY_DAY": "⛅", "PARTLY_CLOUDY_NIGHT": "☁️",
    "CLOUDY": "☁️", "LIGHT_RAIN": "🌦", "MODERATE_RAIN": "🌧",
    "HEAVY_RAIN": "🌧", "LIGHT_SNOW": "🌨", "MODERATE_SNOW": "❄️",
    "FOG": "🌫", "HAZE": "🌫"
  };
  const icon = iconMap[skycon] || "☀️";
  
  const bgMap = {
    "CLEAR_DAY": "#4A90D9", "CLEAR_NIGHT": "#1a3a5c",
    "PARTLY_CLOUDY_DAY": "#6b8e9e", "CLOUDY": "#5b7a8a",
    "LIGHT_RAIN": "#4682B4", "MODERATE_RAIN": "#3a6a8a",
    "LIGHT_SNOW": "#8ba4b5", "FOG": "#8e9eab", "HAZE": "#8e9eab"
  };
  const bg = bgMap[skycon] || "#4A90D9";
  
  return {
    type: "widget",
    padding: 10,
    gap: 2,
    backgroundColor: bg,
    children: [
      { type: "text", text: "潍坊", font: { size: 13, weight: "medium" }, textColor: "#ffffffcc" },
      { type: "text", text: `${temp}°`, font: { size: 42, weight: "thin" }, textColor: "#ffffff" },
      { type: "text", text: `${icon} ${skycon.replace(/_/g, " ")}`, font: { size: 11 }, textColor: "#ffffffcc" },
      { type: "text", text: `湿度 ${humidity}%`, font: { size: 10 }, textColor: "#ffffff99" }
    ]
  };
}
