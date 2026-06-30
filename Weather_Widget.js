/**
 * 🌤️ 天气小组件 for Egern
 * 数据源：wttr.in（免费，无需 API Key）
 *
 * 🔧 环境变量（在 Egern 小组件编辑中添加）：
 * 名称：city    值：城市拼音（如 weifang、beijing、shanghai）
 * 名称：lang    值：zh（中文，默认）
 */

export default async function (ctx) {
  const city = ctx.env.city || "weifang";
  const lang = ctx.env.lang || "zh";

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const refreshTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 周${weekDays[now.getDay()]}`;

  const backgroundColor = { light: "#FFFFFF", dark: "#1C1C1E" };
  const COLORS = {
    primary: { light: "#1A1A1A", dark: "#FFFFFF" },
    secondary: { light: "#666666", dark: "#CCCCCC" },
    tertiary: { light: "#999999", dark: "#888888" },
    accent: { light: "#007AFF", dark: "#5AC8FA" },
    humidity: { light: "#34C759", dark: "#30D158" },
    wind: { light: "#5856D6", dark: "#7D7AFF" },
    sunrise: { light: "#FF9500", dark: "#FFB347" },
    sunset: { light: "#FF3B30", dark: "#FF6B6B" },
    card: { light: "#F5F5F7", dark: "#2C2C2E" },
    error: { light: "#FF3B30", dark: "#FF6B6B" },
  };

  const weatherIcons = {
    "113": "☀️", "116": "⛅", "119": "☁️", "122": "☁️",
    "143": "🌫️", "176": "🌦️", "179": "🌨️", "182": "🌨️",
    "185": "🌨️", "200": "⛈️", "227": "🌨️", "230": "❄️",
    "248": "🌫️", "260": "🌫️", "263": "🌧️", "266": "🌧️",
    "281": "🌨️", "284": "🌨️", "293": "🌧️", "296": "🌧️",
    "299": "🌧️", "302": "🌧️", "305": "🌧️", "308": "🌧️",
    "311": "🌨️", "314": "🌨️", "317": "🌨️", "320": "🌨️",
    "323": "🌨️", "326": "🌨️", "329": "❄️", "332": "❄️",
    "335": "❄️", "338": "❄️", "350": "🌨️", "353": "🌧️",
    "356": "🌧️", "359": "🌧️", "362": "🌨️", "365": "🌨️",
    "368": "🌨️", "371": "❄️", "374": "🌨️", "377": "🌨️",
    "386": "⛈️", "389": "⛈️", "392": "⛈️", "395": "❄️"
  };

  let temp = "--", feelsLike = "--", humidity = "--", windSpeed = "--";
  let windDir = "", desc = "加载中...", icon = "🌤️";
  let maxTemp = "--", minTemp = "--", sunrise = "", sunset = "";
  let fetchError = false, errorMsg = "";

  // 尝试从缓存读取
  const CACHE_KEY = `weather_${city}`;
  let hasCache = false;
  try {
    const cached = ctx.storage.getJSON(CACHE_KEY);
    if (cached && cached.temp) {
      Object.assign(cached);
      hasCache = true;
    }
  } catch (_) {}

  try {
    const url = `https://wttr.in/${city}?format=j1&lang=${lang}`;
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
    windDir = c.winddir16Point || "";
    icon = weatherIcons[c.weatherCode] || "🌤️";
    desc = (c.lang_zh && c.lang_zh[0]) ? c.lang_zh[0].value : (c.weatherDesc && c.weatherDesc[0] ? c.weatherDesc[0].value : "");
    maxTemp = today.maxtempC;
    minTemp = today.mintempC;

    if (today.astronomy && today.astronomy[0]) {
      sunrise = today.astronomy[0].sunrise || "";
      sunset = today.astronomy[0].sunset || "";
    }

    // 缓存
    ctx.storage.setJSON(CACHE_KEY, { temp, feelsLike, humidity, windSpeed, windDir, desc, icon, maxTemp, minTemp, sunrise, sunset });
    fetchError = false;
  } catch (e) {
    if (!hasCache) {
      fetchError = true;
      errorMsg = e.message || "网络错误";
    }
  }

  return {
    type: "widget",
    padding: [10, 10, 10, 10],
    gap: 6,
    backgroundColor: backgroundColor,
    refreshAfter: refreshTime,
    children: [
      // 顶部：城市 + 日期
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        padding: [0, 4, 0, 4],
        children: [
          { type: "image", src: "sf-symbol:location.fill", width: 11, height: 11, color: COLORS.accent },
          { type: "text", text: city.charAt(0).toUpperCase() + city.slice(1), font: { size: "caption2", weight: "semibold" }, textColor: COLORS.primary },
          { type: "spacer" },
          { type: "text", text: dateStr, font: { size: "caption2" }, textColor: COLORS.tertiary }
        ]
      },
      // 中间：图标 + 温度 + 描述
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        padding: [4, 4, 4, 4],
        gap: 10,
        children: [
          { type: "text", text: icon, font: { size: "largeTitle" } },
          {
            type: "stack",
            direction: "column",
            gap: 1,
            children: [
              { type: "text", text: `${temp}°C`, font: { size: "title1", weight: "bold" }, textColor: COLORS.primary },
              { type: "text", text: desc, font: { size: "footnote" }, textColor: COLORS.secondary }
            ]
          },
          { type: "spacer" },
          {
            type: "stack",
            direction: "column",
            alignItems: "flexEnd",
            gap: 2,
            children: [
              { type: "text", text: `体感 ${feelsLike}°`, font: { size: "caption2" }, textColor: COLORS.tertiary },
              { type: "text", text: `${minTemp}° / ${maxTemp}°`, font: { size: "caption2" }, textColor: COLORS.tertiary }
            ]
          }
        ]
      },
      // 底部：详情行
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: [4, 4, 0, 4],
        children: [
          { type: "text", text: `💧${humidity}%`, font: { size: "caption2" }, textColor: COLORS.humidity },
          { type: "text", text: `🌬${windSpeed}km/h`, font: { size: "caption2" }, textColor: COLORS.wind },
          { type: "text", text: `🌅${sunrise}`, font: { size: "caption2" }, textColor: COLORS.sunrise },
          { type: "text", text: `🌇${sunset}`, font: { size: "caption2" }, textColor: COLORS.sunset }
        ]
      },
      // 错误提示
      ...(fetchError ? [{
        type: "stack",
        direction: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: [4, 0, 0, 0],
        children: [
          { type: "text", text: `⚠️ ${errorMsg}`, font: { size: "caption2" }, textColor: COLORS.error }
        ]
      }] : [])
    ]
  };
}
