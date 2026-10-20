---
作者: Codex
更新时间: 2026-10-20
更新版本: v1.0
更新要点: 核对官方申请门槛、停用方案与 FlyAI 单次体验证据；未注册、未付费、未改部署
---

# 山河有期：机票与酒店实时可售报价接入

查阅日期：**2026-10-20（Asia/Shanghai）**。本报告仅使用官方平台、官方开发文档与官方发布的代码；公开资料不能确认的资质、收费和生产权限均保留为待确认。

**结论：现在只有预算，是项目还没有实现供应商搜索，而不只是“缺一个 Key”。零付费个人种子项目应先申请飞猪 FlyAI 正式 Key，先做“同日期查询 → 平台报价参考 → 官方预订直链”的单平台闭环。不要先搭多 OTA 比价或站内出票。** FlyAI 的免 Key 官方 CLI 体验已单次读价成功，但共享体验凭据不能部署到公开网站；正式 Key 的纯 HTTP/Worker 直连仍须取得账号后验证。

## 1. 当前代码实际缺什么

调研时读取 `soya-travel-calendar/worker/index.js:12` 与 `src/QuoteWorkbench.jsx:5`：

- Worker 只有 `/api/travel-search/status`。不管是否配置 `FLYAI_API_KEY`，`liveInventoryConnected` 都为 `false`；有 Key 时只改为 `provider_contract_required`。没有机票/酒店搜索路由，也没有向任何 OTA 发送报价请求。
- QuoteWorkbench 只显示 `d.cost.low/high` 的“每人全程规划参考”和当前日期文字；没有随日期搜索、加载状态、结果或预订直链。
- 已联网的汇率/关注度接口属于参考数据，不能生成可售机酒库存。
- 后续实际需要：供应商权限与正式凭证、服务端适配器、参数校验、价格/币种/税费/有效期语义、来源及查询时间、无价格/无库存/限流/认证错误状态、平台直链。不能用“Key 非空”替代成功查询验收。

因此，把状态文案简单改成“已接通”或把预算乘天数，仍然不是真实可售报价。

## 2. 哪些路径适合个人项目

| 平台与产品 | 能拿到什么 | 免费/费用边界 | 个人与生产门槛 | 对山河有期的判断 |
|---|---|---|---|---|
| **飞猪 FlyAI** | 实时官方商品与动态库存；机酒结构化搜索及预订直链。部分结果无价格，只能跳详情查看 | 官方条款明确当前个人免费，可限周期配额并保留未来调价权；公开文档未承诺固定免费次数 | 当前注册仅面向 18 岁以上个人开发者；实际调用前实名认证；控制台取正式 Key。推广返佣另需推广协议 | **第一优先**。个人路径明确、无前置 API 购买费。先做平台报价参考，保留无价格降级。见 [官方条款](https://terms.alicdn.com/legal-agreement/terms/common_product_agreement/20260325101742636/20260325101742636.html)、[FAQ](https://flyai.open.fliggy.com/docs/faq) |
| **携程 / Trip.com** | Trip.com 有伙伴酒店 availability API；开发门户机票资料需分配的伙伴账号。普通联盟主要是链接/横幅导流 | Trip.com 联盟免费、个人可加入；**联盟免费不等于开放实时 API 免费**，API价目/生产条件未公开核实 | [Trip.com 联盟](https://www.trip.com/partners/index?locale=en_xx) 欢迎个人与小站；[开发者门户](https://developer.trip.com/)显示账号由 Trip.com 分配。[携程入口](https://u.ctrip.com/alliance/)公开静态层只读到加载页，未核实个人机酒 API 申请门槛 | 零成本导流备选。要站内数值报价须单独询问伙伴 API 权限，不能拿联盟账号当 API 已授权。见 [联盟 FAQ](https://www.trip.com/partners/help/faq/account)、[酒店 API 文档](https://apidoc.trip.com/apidoc) |
| **Booking.com Demand API** | 官方支持住宿 search/look/redirect 或站内预订；不是住宿商家 Connectivity API | 文档公开；沙箱也需正式伙伴凭证；公开资料未给统一 API 单价或保证免费 | 必须是 **Managed Affiliate Partner**，签约后客户经理开 Partner Centre，再生成 token 与 Affiliate ID；个人种子项目没有自动获批承诺 | 成长后申请。普通 Booking 联盟/公开文档不代表已拿 Demand。入口：[官方申请表](https://affiliates-support.booking.com/hc/en-us/requests/new?ticket_form_id=210286)，[前置条件](https://developers.booking.com/demand/docs/getting-started/prerequisites) |
| **Agoda Affiliate Lite / Demand** | Affiliate Lite 有按日期酒店价格、currency、dailyRate、landingURL；Demand 的 Online Affiliates/MSE 模型只需 Search API | Lite 有自助集成指南；这不等于任何人免审免费生产。Demand 费用/配额以合作约定为准，未找到统一公开价目 | Lite 需伙伴 siteId/API key；Demand 流程是伙伴→凭证→认证→Live。公开文档未给个人自动获批承诺 | 酒店第二候选，申请时明确要 **Search + redirect**。入口：[联盟](https://partners.agoda.com/)、[Demand入门](https://developer.agoda.com/demand/docs/getting-started)。[Lite指南](https://agodapartners.zohodesk.com/portal/en/kb/articles/affiliate-long-tail-search-api)仍链接2018 PDF，旧 HTTP endpoint 不应直接照搬，须确认当前 HTTPS/权限 |
| **Expedia Rapid** | Lodging shopping→价格核验→booking；模块化生产库存 | 文档可读，test 不产生真实预订/扣款；商业价格按合作沟通，不能称通用免费 API | 申请伙伴获批才发 API key/shared secret；开发 key 受限，网站审核通过才启用生产。逐案审查，无个人种子必过承诺 | 当前投入较重。入口：[Become a partner](https://partner.expediagroup.com/en-us/join-us/rapid-api)，[正式流程](https://developers.expediagroup.com/docs/products/rapid/setup/getting-started) |
| **Duffel Flights** | 航司可购买 offer，支持查询和出票，可使用 Duffel 资质 | 无前置费用；当前价目：确认订单 $3/单、Managed Content 订单额1%、付费附加服务$2/项；超过1500:1搜订比，超出搜索$0.005/次；还有支付/换汇等适用费用 | 免费注册/测试；Live 要邮箱与业务/个人/KYC验证；部分航司另有开通条件。个人可以开始开发，不代表无业务验证即可公开商用 | 可开发原型，但**纯搜索不出票**可能产生超额搜索费，不适合零付费比价主源。入口：[注册](https://dashboard.duffel.com/join)、[激活](https://duffel.com/guides/getting-started)、[价目](https://duffel.com/pricing) |
| **Travelpayouts / Aviasales Data API** | 历史用户搜索的缓存价、价格趋势、日历/热门目的地；可带跳转 | 注册后可得 token，数据访问无受众门槛但有速率限制；**不是实时库存** | 官方说明数据来自缓存；总览说存7天，access页说按类型2–7天，具体日期接口取近48小时找到的便宜票 | 可补“历史参考价”，不能满足这次实时可售需求。入口：[Data API](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API)、[申请条件](https://support.travelpayouts.com/hc/en-us/articles/203956083-Requirements-for-Aviasales-data-API-access) |
| **Travelpayouts / Aviasales Search API** | 实时航班搜索，新版自2025-11-01起提供 | 官方传统文档有免费表述；当前实时接口依伙伴审批/规则，不能用免费缓存接口资格替代 | 当前强制**已验证 50,000 MAU**；种子项目未达到不符条件。新版默认每用户IP100次/小时 | 当前排除；不值得以“可免费申请”误导。见 [当前准入](https://support.travelpayouts.com/hc/en-us/articles/210995808-How-to-get-access-to-the-Aviasales-Search-API)、[新版文档](https://support.travelpayouts.com/hc/en-us/articles/30565016140434-Aviasales-Flight-Search-API-real-time-and-multi-city-search) |
| **Skyscanner Travel API** | Flights Live Prices 是实时报价；Indicative Prices 是浏览/SEO估价，须区分 | 无公开统一费用/免费额度承诺；获批后发 key | 商业用途；官方排除非商业个人、没有成熟产品/计划的初创、低于**100,000 MAU**的网站；逐案筛选 | 当前排除。可另考虑联盟链接/Widget，但不能把它写成本站实时 API。入口：[申请与准入](https://www.partners.skyscanner.net/contact/travel-api)、[产品类型](https://developers.skyscanner.net/docs/intro) |
| **Amadeus Self-Service** | **已停用**；官网现在仅提供 Enterprise API Portal | 旧自助免费额度已经不适合作新项目预算；Enterprise需申请咨询，不能沿用旧价目 | 官网公告Self-Service portal已于7月17日 decommissioned | 排除旧教程。见 [官方现状](https://developers.amadeus.com/?category=Getting+started) |

另外：**Hotellook 已于2025-10-20关闭，酒店 API 完全停用**；Travelpayouts 官方关闭说明明确，不再作为免费酒店 API 推荐。[官方关闭FAQ](https://support.travelpayouts.com/hc/en-us/articles/29534131568530-FAQ-on-the-closure-of-Hotellook)

## 3. FlyAI：这次实际验证到了哪一步

仅执行一次官方 CLI 原版 `@fly-ai/flyai-cli@1.0.16` 体验查询：未安装到系统、未配置私人 Key、未注册/接受协议/下单。下载官方 npm 包后临时运行，调用官方 MCP。

- 查询时间：**2026-10-20 08:50:57 +08:00**。
- 测试条件：杭州→北京，2026-11-05，价格排序；是非个人行程的功能测试。
- 返回：`status:0`、`message:success`、`data.itemList` 10项；首项 MU5140，杭州萧山22:15→北京大兴次日00:30，`ticketPrice:"399.00"`，附 `jumpUrl`。
- `systemMessage` 明确当前为体验模式、部分结果可能受限，正式 Key 解锁完整服务。
- **实际价格字段是 `ticketPrice`**，而旧官方字段示例是 `adultPrice`，适配器必须按真实响应防御处理。
- 响应**没有**独立 `currency`、税费分解/含税标识、报价时间/有效期、退改规则；`quantity:null`。查询日期可追溯，价格语义仍不足以称“含税总价/锁价/保证有位”。CLI参数文档把价格上限定义为CNY，只能保留“人民币口径的票价参考，税费以跳转页为准”，不能假称供应商返回了ISO币种字段。

原始业务响应保存在同目录 `flyai-test-flight.json`，元数据/字段审计在 `flyai-test-meta.json`。文件不含请求认证头。**这证明官方免个人Key体验可读到平台票价参考，不证明山河有期线上已接通，也不证明正式Key在Worker上已验通。**

官方 FAQ 还说明部分动态产品只在详情页展示价格。无价结果应显示“前往飞猪查看最新价”，不要用预算填补。机票文档：[search-flight](https://github.com/alibaba-flyai/flyai-skill/blob/main/skills/flyai/references/search-flight.md)；酒店文档：[search-hotel](https://github.com/alibaba-flyai/flyai-skill/blob/main/skills/flyai/references/search-hotel.md)。

## 4. 免费正式 Key 的申请路径与使用边界

1. 由SOYA进入 [飞猪AI开放平台](https://flyai.open.fliggy.com/)，点击获取API Key，进入[控制台](https://flyai.open.fliggy.com/console)。使用自己的账号注册/登录并实名认证。当前协议面向18岁以上个人开发者，当前个人服务免费，具体余额/速率/配额以控制台为准；公开资料不足以承诺“每天X次/永久免费”。
2. 在控制台获取正式 Key，交给服务端密钥管理；不要放前端、链接、仓库、截图、日志或分享给访客。正式服务不是一定需要 OTA商务合同，现有 `provider_contract_required` 不应作为所有平台统一事实。
3. 明确网站用途：“个人旅游规划工具，按用户主动查询展示搜索结果与官方预订直链；不收款、不出票、不承诺锁价”。向官方支持确认：正式Key的机票/酒店权限、公共网站服务端转发、允许的缓存时间、并发/总额、是否需要展示平台提示/品牌与推广协议。
4. 免费API服务和推广返佣是两件事。推广需淘宝账号、实名认证并签推广协议；当前酒店/度假商品为主要分佣范围，交通暂不分佣。[推广指南](https://flyai.open.fliggy.com/docs/partner)

公开网站/商用：官方条款没有一概禁止向自有用户提供服务，但要求事先书面告知输出限制及可能影响用户权利的条款；平台不承诺符合商用标准。条款没有给无上限再分发/批量缓存授权。**可以准备个人公开工具接入；不能把免费个人Key理解成可无限转售数据或商用SLA。**

## 5. 最小正式 Key 接入规范（供下一步实施）

这是基于官方CLI实现确认的HTTP结构，**尚非取得正式Key后的生产联通验收**。

### 传输与认证

- 官方 endpoint：`POST https://flyai.open.fliggy.com/mcp`。
- 官方包标记传输：Streamable HTTP；`Content-Type: application/json`，`Accept: application/json, text/event-stream`。
- 正式 `FLYAI_API_KEY` 在官方CLI中的位置：`Authorization: Bearer <正式Key>`。
- JSON-RPC工具调用示意：

```json
{
  "jsonrpc":"2.0",
  "id":1,
  "method":"tools/call",
  "params":{
    "name":"search_flight",
    "arguments":{"origin":"杭州","destination":"北京","depDate":"2026-11-05","limit":10,"sortType":3}
  }
}
```

酒店工具为 `search_hotels`；参数示意 `{ "destName":"北京", "checkInDate":"2026-11-05", "checkOutDate":"2026-11-06", "limit":10 }`。官方FAQ要求中文全称、未来日期。签名与认证属于头部，不放JSON参数。

**关键未验证项：**当前官方CLI同时发送 `x-flyai-sign-*`、nonce、时间戳、`x-ff-ctx` 等签名/环境头。官方维护者在 [Issue #49](https://github.com/alibaba-flyai/flyai-skill/issues/49) 说明包内Key是免费trial、HMAC是CLI加签、核心仍是AK鉴权；这**没有**承诺所有正式Key可只带Bearer直连。本次未找到公开的“无CLI签名Worker接入规范”。不能复制体验Key/签名常量，也不能伪造环境头绕过风控。

取得正式Key后，优先采用控制台提供的自定义MCP配置或官方确认的HTTP/SDK方案，按该配置完成协议初始化、`tools/list`、核对输入 schema，再各做一条机票/酒店只读测试。若官方确认仅Bearer可用，Worker可用fetch接HTTP；若仍要求CLI签名，应取官方支持的SDK/签名配置或正式Node服务适配，不能猜填。

### Worker运行限制

官方[自建网页示例](https://github.com/alibaba-flyai/flyai/blob/main/src/app/api/search/route.ts)是在Next.js服务端通过Node子进程运行CLI。Cloudflare把 `node:child_process` 列为[非功能性stub](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)，所以不能把该CLI子进程示例原样搬到当前Worker。当前缺的是**官方支持的直接HTTP调用确认**，不是又一段复制CLI的代码。本报告未启动任何适配服务。

### 页面可显示与禁止推断

| 结果 | 可以显示 | 仍要保留的边界 |
|---|---|---|
| 机票 | 航司/航班号、起降机场时间、舱位、直达/中转、`ticketPrice`（兼容旧`adultPrice`）、平台 `jumpUrl` | “平台票价参考”；不称含税总价/锁价/保证可售；查询时间由本站记录，明确不是供应商更新时间 |
| 酒店 | name、address、score、star、mainPic、price、detailUrl（官方样例） | 本次未实测酒店；不将每晚起价写成全程总价；入住人数/房间/税费/取消规则未经明确字段不得补写 |
| 无价格 | 酒店/航班基本信息和官方直链 | 显示“前往平台查看最新价”，不把预算写进price |
| systemMessage | 完整平台提示、适当来源说明 | 不隐藏体验/限流等提示；图片和直链按官方展示要求保留 |
| 失败/限流/无结果 | 明确“暂未取到/稍后重试/未返回匹配结果” | 不降级冒充实时价，不把供应商错误写成“没有航班/房间” |

### 最小闭环与验收

第一版只接飞猪，固定用户主动查询：出发地/目的地/未来日期 → Worker服务端读取正式Key → 官方支持的机酒搜索 → 最多10项 → 显示来源/查询时间/原始价格语义/官方直链。异步取消旧请求、防重复点击、限额、短时缓存必须服从官方规则；不对全站目的地×全年日期自动扫价。

验收只认：正式Key下真实响应、日期/城市一致、税费/币种边界可见、直链可打开对应产品、错误与无价状态正确、前端和日志不含Key。未验通前保留“未接入”，不要根据一个环境变量自动宣布上线。

**当前停止点：**公开资料与单次体验查询已经完成；正式Key、控制台实际配额、Worker直连是否需要额外官方签名配置均未取得/未验证。本次没有改应用代码、注册、接受条款、生成密钥、付款、下单或部署。
