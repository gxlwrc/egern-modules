/**
 * 天气小组件 for Egern
 * 数据源：wttr.in（免费，无需 API Key）
 * 环境变量：名称填 city 值填城市拼音
 */
export default async function(ctx) {
  const city = ctx.env.city || "weifang";

  const C = {
    bg:      { light: "#FFFFFF", dark: "#1C1C1E" },
    text:    { light: "#1A1A1A", dark: "#FFFFFF" },
    sub:     { light: "#666666", dark: "#CCCCCC" },
    dim:     { light: "#999999", dark: "#888888" },
    accent:  { light: "#007AFF", dark: "#5AC8FA" },
    green:   { light: "#34C759", dark: "#30D158" },
    purple:  { light: "#5856D6", dark: "#7D7AFF" },
    orange:  { light: "#FF9500", dark: "#FFB347" },
    red:     { light: "#FF3B30", dark: "#FF6B6B" },
  };

  const weatherIcons = {
    "113": "☀️", "116": "⛅", "119": "☁️", "122": "☁️",
    "143": "🌫️", "176": "🌦️", "200": "⛈️", "230": "❄️",
    "248": "🌫️", "263": "🌧️", "296": "🌧️", "299": "🌧️",
    "302": "🌧️", "305": "🌧️", "308": "🌧️", "356": "🌧️",
    "359": "🌧️", "386": "⛈️", "389": "⛈️", "392": "⛈️"
  };

  const now = new Date();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`;

  const text = (t, opts = {}) => ({
    type: "text",
    text: t,
    font: { size: opts.size || 14, weight: opts.weight || "regular" },
    textColor: opts.color || C.text,
    maxLines: 1,
    minScale: 0.7
  });

  let temp = "--", feelsLike = "--", humidity = "--", windSpeed = "--";
  let desc = "加载中...", icon = "🌤️";
  let maxTemp = "--", minTemp = "--", sunrise = "", sunset = "";
  let fetchError = false, errorMsg = "";

  const CACHE_KEY = `weather_${city}`;
  let hasCache = false;
  try {
    const cached = ctx.storage.getJSON(CACHE_KEY);
    if (cached && cached.temp) {
      temp = cached.temp;
      feelsLike = cached.feelsLike;
      humidity = cached.humidity;
      windSpeed = cached.windSpeed;
      desc = cached.desc;
      icon = cached.icon;
      maxTemp = cached.maxTemp;
      minTemp = cached.minTemp;
      sunrise = cached.sunrise;
      sunset = cached.sunset;
      hasCache = true;
    }
  } catch (_) {}

  try {
    const resp = await ctx.http.get(`https://wttr.in/${city}?format=j1&lang=zh`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });
    const data = await resp.json();
    const c = data.current_condition[0];
    const today = data.weather[0];

    temp = c.temp_C;
    feelsLike = c.FeelsLikeC;
    humidity = c.humidity;
    windSpeed = c.windspeedKmph;
    icon = weatherIcons[c.weatherCode] || "🌤️";
    desc = (c.lang_zh && c.lang_zh[0]) ? c.lang_zh[0].value : (c.weatherDesc && c.weatherDesc[0] ? c.weatherDesc[0].value : "");
    maxTemp = today.maxtempC;
    minTemp = today.mintempC;
    if (today.astronomy && today.astronomy[0]) {
      sunrise = today.astronomy[0].sunrise || "";
      sunset = today.astronomy[0].sunset || "";
    }
    ctx.storage.setJSON(CACHE_KEY, { temp, feelsLike, humidity, windSpeed, desc, icon, maxTemp, minTemp, sunrise, sunset });
  } catch (e) {
    if (!hasCache) {
      fetchError = true;
      errorMsg = e.message || "网络错误";
    }
  }

  const header = {
    type: "stack",
    direction: "row",
    children: [
      text(city, { size: 13, weight: "semibold", color: C.accent }),
      { type: "spacer" },
      text(dateStr, { size: 11, color: C.dim })
    ]
  };

  const mainRow = {
    type: "stack",
    direction: "row",
    children: [
      text(icon, { size: 40 }),
      text(`${temp}°C`, { size: 32, weight: "bold" }),
      { type: "spacer" },
      {
        type: "stack",
        direction: "column",
        children: [
          text(`体感${feelsLike}°`, { size: 11, color: C.dim }),
          text(`${minTemp}°/${maxTemp}°`, { size: 11, color: C.dim })
        ]
      }
    ]
  };

  const detailRow = {
    type: "stack",
    direction: "row",
    children: [
      text(`💧${humidity}%`, { size: 11, color: C.green }),
      { type: "spacer" },
      text(`🌬${windSpeed}km/h`, { size: 11, color: C.purple }),
      { type: "spacer" },
      text(`🌅${sunrise}`, { size: 11, color: C.orange }),
      { type: "spacer" },
      text(`🌇${sunset}`, { size: 11, color: C.red })
    ]
  };

  return {
    type: "widget",
    backgroundColor: C.bg,
    padding: 12,
    gap: 8,
    children: [
      header,
      mainRow,
      detailRow,
      ...(fetchError ? [text(`⚠️ ${errorMsg}`, { size: 11, color: C.red })] : [])
    ]
  };
}
