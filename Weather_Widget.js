export default async function(ctx) {
  const city = ctx.env.city || "weifang";
  let temp = "--";
  let desc = "加载中...";

  try {
    const resp = await ctx.http.get(`https://wttr.in/${city}?format=j1&lang=zh`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });
    const data = await resp.json();
    const c = data.current_condition[0];
    temp = c.temp_C;
    desc = (c.lang_zh && c.lang_zh[0]) ? c.lang_zh[0].value : "";
  } catch (e) {
    desc = "网络错误";
  }

  return {
    type: "widget",
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    padding: 12,
    gap: 8,
    children: [
      { type: "text", text: city + " 天气", font: { size: 14, weight: "bold" }, textColor: { light: "#000", dark: "#FFF" } },
      { type: "text", text: temp + "°C", font: { size: 28, weight: "bold" }, textColor: { light: "#000", dark: "#FFF" } },
      { type: "text", text: desc, font: { size: 12 }, textColor: { light: "#666", dark: "#CCC" } }
    ]
  };
}