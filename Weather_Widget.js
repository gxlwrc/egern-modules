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

  const C = {
    bg: { light: "#FFFFFF", dark: "#1C1C1E" },
    text: { light: "#1A1A1A", dark: "#FFFFFF" },
    sub: { light: "#666666", dark: "#CCCCCC" },
    dim: { light: "#999999", dark: "#888888" },
    accent: { light: "#007AFF", dark: "#5AC8FA" },
    green: { light: "#34C759", dark: "#30D158" },
    purple: { light: "#5856D6", dark: "#7D7AFF" },
    orange: { light: "#FF9500", dark: "#FFB347" },
    red: { light: "#FF3B30", dark: "#FF6B6B" },
    blue: { light: "#007AFF", dark: "#5AC8FA" },
  };

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
  let desc="加载中...", icon="🌤️";
  let feelsLike="--", aqi="--";
  let hourly = [];

  const CK = "weather_caiyun_"+city;
  try {
    const ca = ctx.storage.getJSON(CK);
    if(ca&&ca.t){temp=ca.t;humidity=ca.h;windSpeed=ca.w;desc=ca.d;icon=ca.i;feelsLike=ca.f;aqi=ca.a;hourly=ca.hourly||[];}
  }catch(_){}

  try {
    const url = "https://api.caiyunapp.com/v2.6/"+token+"/"+coord+"/realtime";
    const r = await ctx.http.get(url, {timeout:10000});
    const j = await r.json();
    const rt = j.result.realtime;

    temp = Math.round(rt.temperature);
    humidity = Math.round(rt.humidity * 100);
    windSpeed = Math.round(rt.wind.speed);
    icon = skyIcons[rt.skycon] || "🌤️";
    desc = skyDesc[rt.skycon] || rt.skycon;
    feelsLike = Math.round(rt.apparent_temperature);
    aqi = rt.air_quality && rt.air_quality.aqi ? rt.air_quality.aqi.chn : "--";

    // 获取未来小时预报
    const hUrl = "https://api.caiyunapp.com/v2.6/"+token+"/"+coord+"/hourly?hourlysteps=6";
    const hr = await ctx.http.get(hUrl, {timeout:10000});
    const hj = await hr.json();
    const hData = hj.result.hourly;
    hourly = [];
    if(hData && hData.temperature) {
      for(let i = 0; i < Math.min(6, hData.temperature.length); i++) {
        const t = hData.temperature[i];
        const sky = hData.skycon[i];
        const prob = hData.precipitation[i];
        hourly.push({
          time: new Date(t.datetime).getHours() + ":00",
          temp: Math.round(t.value),
          icon: skyIcons[sky.value] || "🌤️",
          rainProb: prob ? Math.round(prob.probability * 100) : 0
        });
      }
    }

    ctx.storage.setJSON(CK, {t:temp, h:humidity, w:windSpeed, d:desc, i:icon, f:feelsLike, a:aqi, hourly:hourly});
  } catch(e) {}

  // 找最近下雨时间
  let rainInfo = "";
  for(let i = 0; i < hourly.length; i++) {
    if(hourly[i].rainProb > 30) {
      rainInfo = hourly[i].time + "有" + hourly[i].rainProb + "%概率下雨";
      break;
    }
  }

  return {
    type: "widget",
    backgroundColor: C.bg,
    padding: 12,
    gap: 6,
    children: [
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:city, font:{size:13,weight:"semibold"}, textColor:C.accent},
          {type:"spacer"},
          {type:"text", text:dateStr, font:{size:11}, textColor:C.dim}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:icon, font:{size:38}},
          {type:"text", text:temp+"°C", font:{size:30,weight:"bold"}, textColor:C.text},
          {type:"spacer"},
          {type:"text", text:desc, font:{size:12}, textColor:C.sub}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"体感"+feelsLike+"°", font:{size:11}, textColor:C.dim},
          {type:"spacer"},
          {type:"text", text:"AQI "+aqi, font:{size:11}, textColor:C.dim}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"💧"+humidity+"%", font:{size:11}, textColor:C.green},
          {type:"spacer"},
          {type:"text", text:"🌬"+windSpeed+"m/s", font:{size:11}, textColor:C.purple},
          {type:"spacer"},
          {type:"text", text:rainInfo?"🌧"+rainInfo:"", font:{size:11}, textColor:C.blue}
        ]
      },
      // 未来小时预报
      {
        type: "stack", direction: "row",
        children: hourly.map(function(h) {
          return {
            type: "stack", direction: "column",
            children: [
              {type:"text", text:h.time, font:{size:10}, textColor:C.dim},
              {type:"text", text:h.icon, font:{size:16}},
              {type:"text", text:h.temp+"°", font:{size:11,weight:"medium"}, textColor:C.text},
              {type:"text", text:h.rainProb>0?h.rainProb+"%":"", font:{size:9}, textColor:h.rainProb>30?C.red:C.dim}
            ]
          };
        })
      }
    ]
  };
}