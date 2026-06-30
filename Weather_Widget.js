/**
 * 天气小组件 for Egern
 * 环境变量：名称填 city 值填城市拼音
 */
export default async function(ctx) {
  const city = ctx.env.city || "weifang";
  
  return {
    type: "widget",
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    padding: 14,
    gap: 8,
    children: [
      {
        type: "text",
        text: "天气测试",
        font: { size: 16, weight: "bold" },
        textColor: { light: "#000000", dark: "#FFFFFF" }
      },
      {
        type: "text",
        text: "城市: " + city,
        font: { size: 14 },
        textColor: { light: "#666666", dark: "#CCCCCC" }
      }
    ]
  };
}
