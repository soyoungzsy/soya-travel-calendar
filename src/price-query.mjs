const gateways={'京都':'大阪','箭镇与皇后镇':'皇后镇','冰岛':'雷克雅未克','南极半岛':'乌斯怀亚','百内国家公园':'蓬塔阿雷纳斯','那拉提':'伊宁','九寨沟':'成都','贝加尔湖':'伊尔库茨克','赛里木湖':'博乐','琅勃拉邦':'琅勃拉邦','富良野与美瑛':'旭川','箱根':'东京','高野山':'大阪','瓦迪拉姆':'安曼','龙脊梯田':'桂林','库斯科与圣谷':'库斯科','阿塔卡马':'卡拉马','罗弗敦群岛':'博德','劳特布龙嫩':'苏黎世','塔斯马尼亚':'霍巴特','优胜美地':'旧金山','班夫与露易丝湖':'卡尔加里'};
export const flightCity=d=>gateways[d.name]||d.name;
// This is one editable stay segment, never a hotel quote for the whole lake region.
export const lodgingCity=d=>d.lodgingCity||({'贝加尔湖':'伊尔库茨克'}[d.name])||d.name;
export function querySummary({kind,origin,destination,start,end,flexDays=0}){return kind==='hotel'?`酒店查询：${destination}，${start}入住，${end}离店。请核对入住人数、房型、税费和取消条件。`:`机票查询：${origin} → ${destination||'目的地不限'}，${start}出发${flexDays?'，可比较前后3天':''}，1位成人经济舱。请核对行李、税费和退改条件。`;}
export const officialBookingSites=[{name:'飞猪',url:'https://www.fliggy.com/'},{name:'Trip.com',url:'https://www.trip.com/'}];
