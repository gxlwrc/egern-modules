/**
 * 🌤️ 天气小组件 for Egern
 * 数据源：wttr.in（免费，无需 API Key）
 *
 * 🔧 环境变量：
 * 名称：city    值：城市拼音（如 weifang、beijing、shanghai）
 */

export default async function(ctx) {
  const city = ctx.env.city || "weifang";

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const refreshTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`;

  const colors = {
    bg: { light: "#FFFFFF", dark: "#1C1C1E" },
    text: { light: "#1A1A1A", dark: "#FFFFFF" },
    textDim: { light: "#666666", dark: "#CCCCCC" },
    accent: { light: "#007AFF", dark: "#5AC8FA" },
    green: { light: "#34C759", dark: "#30D158" },
    purple: { light: "#5856D6", dark: "#7D7AFF" },
    orange: { light: "#FF9500", dark: "#FFB347" },
    red: { light: "#FF3B30", dark: "#FF6B6B" },
  };

  const weatherIcons = {
    "113": "☀️", "116": "⛅", "119": "☁️", "122": "☁️",
    "143": "🌫️", "176": "🌦️", "200": "⛈️", "230": "❄️",
    "248": "🌫️", "263": "🌧️", "296": "🌧️", "299": "🌧️",
    "302": "🌧️", "305": "🌧️", "308": "🌧️", "356": "🌧️",
    "359": "🌧️", "386": "⛈️", "389": "⛈️", "392": "⛈️"
  };

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
    const url = `https://wttr.in/${city}?format=j1&lang=zh`;
    const resp = await ctx.http.get(url, {
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
    fetchError = false;
  } catch (e) {
    if (!hasCache) {
      fetchError = true;
      errorMsg = e.message || "网络错误";
    }
  }

  return {
    type: "widget",
    backgroundColor: colors.bg,
    padding: 10,
    gap: 6,
    refreshAfter: refreshTime,
    children: [
      // 顶部：城市 + 日期
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        height: 18,
        gap: 4,
        children: [
          { type: "image", src: "sf-symbol:location.fill", width: 11, height: 11, color: colors.accent },
          { type: "text", text: city.charAt(0).toUpperCase() + city.slice(1), font: { size: 12, weight: "semibold" }, textColor: colors.text },
          { type: "spacer" },
          { type: "text", text: dateStr, font: { size: 11 }, textColor: colors.textDim }
        ]
      },
      // 中间：图标 + 温度 + 描述
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        gap: 10,
        padding: [4, 0, 4, 0],
        children: [
          { type: "text", text: icon, font: { size: 44 } },
          {
            type: "stack",
            direction: "column",
            gap: 2,
            children: [
              { type: "text", text: `${temp}°C`, font: { size: 34, weight: "bold" }, textColor: colors.text },
              { type: "text", text: desc, font: { size: 13 }, textColor: colors.textDim }
            ]
          },
          { type: "spacer" },
          {
            type: "stack",
            direction: "column",
            alignItems: "flexEnd",
            gap: 2,
            children: [
              { type: "text", text: `体感${feelsLike}°`, font: { size: 11 }, textColor: colors.textDim },
              { type: "text", text: `${minTemp}°/${maxTemp}°`, font: { size: 11 }, textColor: colors.textDim }
            ]
          }
        ]
      },
      // 底部：详情
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        children: [
          { type: "text", text: `💧${humidity}%`, font: { size: 11 }, textColor: colors.green },
          { type: "text", text: `🌬${windSpeed}km/h`, font: { size: 11 }, textColor: colors.purple },
          { type: "text", text: `🌅${sunrise}`, font: { size: 11 }, textColor: colors.orange },
          { type: "text", text: `🌇${sunset}`, font: { size: 11 }, textColor: colors.red }
        ]
      },
      // 错误提示
      ...(fetchError ? [{
        type: "text",
        text: `⚠️ ${errorMsg}`,
        font: { size: 11 },
        textColor: colors.red,
        textAlign: "center"
      }] : [])
    ]
  };
}
