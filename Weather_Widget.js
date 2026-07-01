export default async function(ctx) {
  const city = ctx.env.city || "weifang";

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
  };

  const icons = {
    "113":"☀️","116":"⛅","119":"☁️","122":"☁️","143":"🌫️","176":"🌦️",
    "200":"⛈️","230":"❄️","248":"🌫️","263":"🌧️","296":"🌧️","299":"🌧️",
    "302":"🌧️","305":"🌧️","308":"🌧️","356":"🌧️","359":"🌧️","386":"⛈️"
  };

  const now = new Date();
  const wd = ["日","一","二","三","四","五","六"];
  const dateStr = (now.getMonth()+1)+"月"+now.getDate()+"日 周"+wd[now.getDay()];

  let temp="--", feelsLike="--", humidity="--", windSpeed="--";
  let desc="加载中...", icon="🌤️", maxTemp="--", minTemp="--";
  let sunrise="", sunset="";

  const CK = "weather_"+city;
  try {
    const ca = ctx.storage.getJSON(CK);
    if(ca&&ca.t){temp=ca.t;feelsLike=ca.f;humidity=ca.h;windSpeed=ca.w;desc=ca.d;icon=ca.i;maxTemp=ca.x;minTemp=ca.n;sunrise=ca.sr;sunset=ca.ss;}
  }catch(_){}

  try {
    const r = await ctx.http.get("https://wttr.in/"+city+"?format=j1&lang=zh", {headers:{"User-Agent":"Mozilla/5.0"},timeout:10000});
    const j = await r.json();
    const c = j.current_condition[0];
    const t = j.weather[0];
    temp=c.temp_C; feelsLike=c.FeelsLikeC; humidity=c.humidity; windSpeed=c.windspeedKmph;
    icon=icons[c.weatherCode]||"🌤️";
    desc=(c.lang_zh&&c.lang_zh[0])?c.lang_zh[0].value:(c.weatherDesc&&c.weatherDesc[0]?c.weatherDesc[0].value:"");
    maxTemp=t.maxtempC; minTemp=t.mintempC;
    if(t.astronomy&&t.astronomy[0]){sunrise=t.astronomy[0].sunrise||"";sunset=t.astronomy[0].sunset||"";}
    ctx.storage.setJSON(CK,{t:temp,f:feelsLike,h:humidity,w:windSpeed,d:desc,i:icon,x:maxTemp,n:minTemp,sr:sunrise,ss:sunset});
  }catch(e){}

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
          {type:"text", text:minTemp+"°/"+maxTemp+"°", font:{size:11}, textColor:C.dim}
        ]
      },
      {
        type: "stack", direction: "row",
        children: [
          {type:"text", text:"💧"+humidity+"%", font:{size:11}, textColor:C.green},
          {type:"spacer"},
          {type:"text", text:"🌬"+windSpeed+"km/h", font:{size:11}, textColor:C.purple},
          {type:"spacer"},
          {type:"text", text:"🌅"+sunrise, font:{size:11}, textColor:C.orange},
          {type:"spacer"},
          {type:"text", text:"🌇"+sunset, font:{size:11}, textColor:C.red}
        ]
      }
    ]
  };
}