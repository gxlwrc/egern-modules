export default async function(ctx) {
  const city = ctx.env.city || "weifang";
  const token = ctx.env.token || "yCRHZoxURpIEmwvO";

  const cityCoords = {
    "weifang": "119.1617,36.7068",
    "beijing": "116.4074,39.9042",
    "shanghai": "121.4737,31.2304",
    "guangzhou": "113.2644,23.1291",
    "shenzhen": "114.0579,22.5431",
    "chengdu": "104.0665,30.5723",
    "hangzhou": "120.1551,30.2741",
    "nanjing": "118.7969,32.0603",
    "wuhan": "114.3054,30.5931",
    "xian": "108.9404,34.2613",
  };

  const coord = cityCoords[city] || cityCoords["weifang"];

  // 天气背景色
  const weatherBg = {
    "CLEAR_DAY": { light: "#4A90D9", dark: "#1a3a5c" },
    "CLEAR_NIGHT": { light: "#2C3E50", dark: "#1a1a2e" },
    "PARTLY_CLOUDY_DAY": { light: "#87CEEB", dark: "#4a6fa5" },
    "PARTLY_CLOUDY_NIGHT": { light: "#34495E", dark: "#2c3e50" },
    "CLOUDY": { light: "#95A5A6", dark: "#636e72" },
    "LIGHT_HAZE": { light: "#BDC3C7", dark: "#95a5a6" },
    "MODERATE_HAZE": { light: "#A0A0A0", dark: "#808080" },
    "HEAVY_HAZE": { light: "#808080", dark: "#606060" },
    "LIGHT_RAIN": { light: "#6CA6CD", dark: "#4a7a9b" },
    "MODERATE_RAIN": { light: "#5B9BD5", dark: "#3a7ab5" },
    "HEAVY_RAIN": { light: "#4682B4", dark: "#2a6294" },
    "STORM_RAIN": { light: "#36648B", dark: "#1a446b" },
    "FOG": { light: "#C0C0C0", dark: "#a0a0a0" },
    "LIGHT_SNOW": { light: "#B0C4DE", dark: "#8ba5c0" },
    "MODERATE_SNOW": { light: "#ADD8E6", dark: "#87ceeb" },
    "HEAVY_SNOW": { light: "#E0E0E0", dark: "#c0c0c0" },
    "STORM_SNOW": { light: "#D0D0D0", dark: "#b0b0b0" },
    "WIND": { light: "#87CEEB", dark: "#5f9ea0" },
  };

  // 天气文字颜色（深色背景用白色文字）
  const textColor = { light: "#FFFFFF", dark: "#FFFFFF" };
  const subColor = { light: "#E0E0E0", dark: "#E0E0E0" };
  const dimColor = { light: "#C0C0C0", dark: "#C0C0C0" };

  const skyIcons = {
    "CLEAR_DAY": "☀️", "CLEAR_NIGHT": "🌙",
    "PARTLY_CLOUDY_DAY": "⛅", "PARTLY_CLOUDY_NIGHT": "☁️",
    "CLOUDY": "☁️", "LIGHT_HAZE": "🌫️",
    "MODERATE_HAZE": "🌫️", "HEAVY_HAZE": "🌫️",
    "LIGHT_RAIN": "🌦️", "MODERATE_RAIN": "🌧️",
    "HEAVY_RAIN": "🌧️", "STORM_RAIN": "⛈️",
    "FOG": "🌫️", "LIGHT_SNOW": "🌨️",
    "MODERATE_SNOW": "🌨️", "HEAVY_SNOW": "❄️",
    "STORM_SNOW": "❄️", "WIND": "🌬️",
  };

  const skyDesc = {
    "CLEAR_DAY": "晴", "CLEAR_NIGHT": "晴",
    "PARTLY_CLOUDY_DAY": "多云", "PARTLY_CLOUDY_NIGHT": "多云",
    "CLOUDY": "阴", "LIGHT_HAZE": "轻度雾霾",
    "MODERATE_HAZE": "中度雾霾", "HEAVY_HAZE": "重度雾霾",
    "LIGHT_RAIN": "小雨", "MODERATE_RAIN": "中雨",
    "HEAVY_RAIN": "大雨", "STORM_RAIN": "暴雨",
    "FOG": "雾", "LIGHT_SNOW": "小雪",
    "MODERATE_SNOW": "中雪", "HEAVY_SNOW": "大雪",
    "STORM_SNOW": "暴雪", "WIND": "大风",
  };

  const now = new Date();
  const wd = ["日","一","二","三","四","五","六"];
  const dateStr = (now.getMonth()+1)+"月"+now.getDate()+"日 周"+wd[now.getDay()];

  let temp="--", humidity="--", windSpeed="--";
  let desc="加载中...", icon="🌤️", skycon="CLOUDY";
  let feelsLike="--", aqi="--";
  let rainText = "";

  const CK = "weather_caiyun_"+city;
  try {
    const ca = ctx.storage.getJSON(CK);
    if(ca&&ca.t){temp=ca.t;humidity=ca.h;windSpeed=ca.w;desc=ca.d;icon=ca.i;feelsLike=ca.f;aqi=ca.a;rainText=ca.rain||"";skycon=ca.sky||"CLOUDY";}
  }catch(_){}

  try {
    const url = "https://api.caiyunapp.com/v2.6/"+token+"/"+coord+"/realtime";
    const r = await ctx.http.get(url, {timeout:10000});
    const j = await r.json();
    const rt = j.result.realtime;

    temp = Math.round(rt.temperature);
    humidity = Math.round(rt.humidity * 100);
    windSpeed = Math.round(rt.wind.speed);
    skycon = rt.skycon;
    icon = skyIcons[skycon] || "🌤️";
    desc = skyDesc[skycon] || skycon;
    feelsLike = Math.round(rt.apparent_temperature);
    aqi = rt.air_quality && rt.air_quality.aqi ? rt.air_quality.aqi.chn : "--";

    try {
      const hUrl = "https://api.caiyunapp.com/v2.6/"+token+"/"+coord+"/hourly?hourlysteps=6";
      const hr = await ctx.http.get(hUrl, {timeout:10000});
      const hj = await hr.json();
      const hData = hj.result.hourly;
      if(hData && hData.precipitation) {
        rainText = "未来6小时无雨";
        for(let i = 0; i < hData.precipitation.length; i++) {
          const prob = hData.precipitation[i].probability;
          if(prob > 0.3) {
            const h = new Date(hData.precipitation[i].datetime).getHours();
            rainText = h+":00有"+Math.round(prob*100)+"%概率下雨";
            break;
          }
        }
      }
    } catch(_){}

    ctx.storage.setJSON(CK, {t:temp, h:humidity, w:windSpeed, d:desc, i:icon, f:feelsLike, a:aqi, rain:rainText, sky:skycon});
  } catch(e) {}

  const bg = weatherBg[skycon] || weatherBg["CLOUDY"];

  return {
    type: "widget",
    backgroundColor: bg,
    padding: 12,
    gap: 6,
    children: [
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:city, font:{size:13,weight:"semibold"}, textColor:textColor},
          {type:"spacer"},
          {type:"text", text:dateStr, font:{size:11}, textColor:dimColor}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:icon, font:{size:38}},
          {type:"text", text:temp+"°C", font:{size:30,weight:"bold"}, textColor:textColor},
          {type:"spacer"},
          {type:"text", text:desc, font:{size:12}, textColor:subColor}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"体感"+feelsLike+"°", font:{size:11}, textColor:dimColor},
          {type:"spacer"},
          {type:"text", text:"AQI "+aqi, font:{size:11}, textColor:dimColor}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"💧"+humidity+"%", font:{size:11}, textColor:subColor},
          {type:"spacer"},
          {type:"text", text:"🌬"+windSpeed+"m/s", font:{size:11}, textColor:subColor}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"🌧 "+rainText, font:{size:11}, textColor:subColor}
        ]
      }
    ]
  };
}