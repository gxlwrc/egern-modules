// 天气小组件 - 第一版
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
  
  return {
    type: "widget",
    children: [
      {
        type: "vstack",
        children: [
          { type: "text", text: "潍坊", font: { size: 11 } },
          { type: "text", text: `${temp}°`, font: { size: 22, weight: "bold" } },
          { type: "text", text: desc, font: { size: 10 } }
        ]
      }
    ]
  };
}
