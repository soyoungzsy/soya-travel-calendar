# 美食实拍覆盖与图片许可核对（v10）

核对日期：2026-10-20。审查范围：现有美食目录 31 项。结果：29 项已配同菜品真实照片，共 30 张 WebP，约 3.32 MB；2 项保留具体缺口。新增素材均来自逐文件明确许可的 Wikimedia Commons 原作者实拍。没有复制未明示许可的官方攻略照片，没有使用 AI 食物图。

照片与目的地的关联边界写进 caption：新西兰炸鱼薯条摄于惠灵顿，泉州做法姜母鸭摄于北京，即席炒年糕未核定新堂洞门店。这些不保证当地店铺或当期出菜状态。

## 两项具体缺口与恢复点

1. **九寨沟洋芋糍粑**：已查 Commons 中英文名称、九寨沟官方美食原文和九寨沟藏餐实拍。官方历史报道能证明菜品关联，但未取得该照片的网页转载许可；[Commons 九寨沟藏餐图](https://commons.wikimedia.org/wiki/File:Jiuzhaigou.Tibetan_meal.jpg) 只明确列土豆等食品，不能证明是洋芋糍粑。没有用糯米糍粑、贵州洋芋粑、普通土豆或其他地区“同类参考图”补位。恢复：取得具体原作者授权或补入能核实九寨沟洋芋糍粑的开放许可实拍。

2. **吉布斯顿手工奶酪体验**：已找到 [Destination Queenstown 官方资产 #169673](https://images.queenstownnz.co.nz/asset-page/169673-gibbston-valley-cheesery-deli)，名称 Gibbston Valley Cheesery & Deli，5804×4000。资产页明确提供免费媒体推广皇后镇的使用范围，要求署名 QueenstownNZ.co.nz 并尽可能回链。但[完整条款](https://images.queenstownnz.co.nz/terms) 的 Asset download form and Licence Terms 部分要求先完成资产下载表，准确填写用途并同意单张资产许可；页面同时要求 Register/Login to access。本轮没有账号与用途表回执，未绕过步骤下载公开预览。恢复：由有权账号按实际网站用途填写表单并下载；保留机构署名和回链，不用于付费广告。没有用普通奶酪图冒充当地生产体验。

## 为什么官方攻略有图片，本网页仍不能自动复制

官方来源可用于核对菜品与地域事实；图片的复制、再发布和商业用途，取决于该张图片的权利人及许可。旅游机构可能自行拍摄，也可能仅获摄影师、企业或媒体授权在自己的攻略刊载。阅读公开页面、拿到图片 URL、标注来源或为非营利项目使用，不能替代明确覆盖本网页用途的许可。杭州现有美食来源还包含 CGTN 转载内容，因此不能把政府域名当作所有图片均由政府无限授权。

[英国国家档案馆对官方出版物的版权说明](https://www.nationalarchives.gov.uk/information-management/producing-official-publications/copyright-statements/) 将已识别的第三方版权内容交给各自权利人许可；其[网站版权条款](https://www.nationalarchives.gov.uk/terms-and-conditions/copyright/) 也把第三方素材列为一般开放条款的例外。本次逐图核实权利与条款，没有因官方发布就推定可转载。

## 可用开放条款实例

- **韩国 KOGL Type 1**：[官方许可说明](https://www.kogl.or.kr/info/license.do) 对 Type 1 允许免费使用、商业使用和派生创作，需标明来源；Type 2、3、4 各有非商业或禁止改动限制，不能混用。[韩国旅游发展局 / Lee Bumsu 的新堂洞炒年糕街实拍](https://commons.wikimedia.org/wiki/File:Sindang-dong_Tteokbokki_Town.jpg) 明确挂 KOGL Type 1。该照片只拍街景，没有拿它充当菜品封面；它是官方机构为具体资产提供可复用条款的实例。
- **CC BY**：在保留作者、许可链接并说明更改等条件下可分享和改作。[香港酥皮蛋挞](https://commons.wikimedia.org/wiki/File:Egg_Tarts_with_Puff_Pastry.jpg) 由 See-ming Lee 以 CC BY 2.0 发布，是本次实际部署实例。
- **CC BY-SA**：允许商业复制与改作，要求署名、许可链接、改动说明；若构成改编，派生成果须沿用相同或兼容许可。每张图片独立保留其许可，不能被代码许可证覆盖。[Koshary / Dina Said](https://commons.wikimedia.org/wiki/File:Egyptian_food_Koshary.jpg) 为 CC BY-SA 4.0；[官方条款](https://creativecommons.org/licenses/by-sa/4.0/)。本次只做按比例缩小与格式转换，仍明确按原图许可分发对应 WebP，并保留原图入口。
- **CC0 1.0**：作者在法律允许范围内尽量放弃著作权及相关权利，许可页面明确允许商业使用。北京烤鸭切片、新西兰炸鱼薯条、冰岛羊肉汤采用此类来源，仍保留作者与来源记录。
- **有条件的官方图库许可**：吉布斯顿候选免费使用范围明确，但需要完成图库自己的取得步骤，且限定推广目的和非付费媒体。这与无需额外申请的 CC0 或 CC BY 有不同条件。

## 网站接入与署名

数据文件为 `src/food-media-v10.json`，`photos` 直接从 `foodId` 映射到图片数组；31 个 ID 齐全，空数组即未覆盖。`coverage` 记录每条边界或恢复点。每张图保留来源页、作者、许可及链接、图说、主体、尺寸体积、原图入口、拍摄时间、处理说明和 SHA-256。

图片保存在 `public/food/`，每张独立 WebP。没有裁切、AI 增删或食物替换。网页如裁切显示区域，应保留完整图片入口，避免把配菜裁成另一道菜或遗漏主菜。建议通过紧随图片的署名或明确可达的资料面板展示作者、原始文件页、许可链接及处理说明，再把记录同步至 `docs/media-credits.md`。共享文件由根会话统一维护，本次没有直接改写。

## 验证

已逐张查看本地联系表，重点核对埃及组合菜、Tanjia、即席炒年糕、汤豆腐、Skyr 和泉州姜母鸭。排除了只见封口陶罐、盖着锅盖的汤豆腐和只有炒年糕街景的首轮封面候选，换成可见食物的照片。两项未覆盖保持空数组。

## 31 项逐项审查

|ID / 美食|照片与边界|作者、许可与原图|WebP 尺寸 / 体积|
|---|---|---|---|
|`food:hangzhou:1` 龙井虾仁|杭州酒家龙井虾仁实拍（2015年）|猫猫的日记本 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Longjing_prawns_in_Hangzhou_Restaurant_2015-07.JPG)|960×638 / 38.1 KiB|
|`food:hangzhou:2` 东坡肉|东坡肉实拍（2015年；源页标注中国）|Pauloleong2002 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Dongpo_pork_(a_Hangzhou_dish).jpg)|960×717 / 42.7 KiB|
|`food:beijing:1` 北京烤鸭|北京烤鸭切片实拍；菜品示例|Fumikas Sagisavas · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) · [来源](https://commons.wikimedia.org/wiki/File:Peking_duck_slices.jpg)|960×720 / 102.7 KiB|
|`food:beijing:2` 老北京炸酱面|北京炸酱面实拍（2018年）|Hal_0005 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Zhajiangmian_20180501.jpg)|960×614 / 115.3 KiB|
|`food:kyoto:1` 京怀石|京都怀石料理实拍（2014年）；不是全年固定菜单|Donatingpictures · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Kaiseki_-_Kyoto.jpg)|960×717 / 133.5 KiB|
|`food:kyoto:2` 汤豆腐（Yudofu）|京都汤豆腐实拍（2005年）|Joi Ito from Inbamura, Japan · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Yudofu.jpg)|640×480 / 19.4 KiB|
|`food:luang-prabang:1` 河苔小食（Khaiphaen／Kaipen）|河苔小食 Kaipen 与 Jaew Bong 蘸酱实拍|joaquinuy · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Kaipen_with_Spicy_Jaew_Bong_Sauce-02.jpg)|960×720 / 148.6 KiB|
|`food:luang-prabang:2` 琅勃拉邦传统炖菜（Ork Lam／Or Lam）|琅勃拉邦 Or Lam 猪肉炖菜实拍（2022年）|Jpatokal · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Or_Lam_at_Amantaka.jpg)|960×720 / 116.4 KiB|
|`food:chengdu:1` 麻婆豆腐|麻婆豆腐实拍；菜品示例，未核定拍摄门店|Archon6812 · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) · [来源](https://commons.wikimedia.org/wiki/File:Billyfoodmabodofu3.jpg)|500×750 / 45.8 KiB|
|`food:chengdu:2` 成都担担面|成都担担面干拌版本实拍（2018年）|N509FZ · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Dandanmian_in_Chengdu_(20180218142856).jpg)|960×640 / 96.4 KiB|
|`food:jiuzhaigou:1` 洋芋糍粑|未覆盖；见具体缺口|—|—|
|`food:jiuzhaigou:2` 青稞饼|九寨沟青稞饼实拍（2023年）|EditQ · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:%E9%9D%92%E7%A8%9E%E9%A5%BC.jpg)|1252×1280 / 143.3 KiB|
|`food:seoul:1` 新堂洞即席炒年糕|即席炒年糕锅实拍；同类型菜品示例，未核定新堂洞门店|bryan... · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Jeukseok-tteok-bokki_1.jpg)|960×640 / 85.5 KiB|
|`food:seoul:2` 雪浓汤（Seolleongtang）|雪浓汤实拍（2024年）；菜品示例|Kimhs5400 · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Seolleongtang2024.jpg)|1280×960 / 187.3 KiB|
|`food:marrakech:1` Tanjia 陶罐慢炖肉|Tanjia 炖肉配薯条实拍（2023年）；菜品示例|Anass Sedrati · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Tangia_with_Fries.jpg)|500×667 / 98.4 KiB|
|`food:marrakech:2` 德吉玛广场果汁摊体验|德吉玛广场果汁摊实拍（2025年）|Jakub Hałun · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Fruit_juice_vendor_in_Jamaa_El_Fna,_Marrakech,_20250125_1346_7258.jpg)|960×635 / 208.7 KiB|
|`food:luxor-nile-history:1` Koshary 米饭扁豆意面拼盘|埃及 Koshary 米饭扁豆意面拼盘实拍（2014年）|Dina Said · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Egyptian_food_Koshary.jpg)|1280×887 / 265.7 KiB|
|`food:luxor-nile-history:2` Ful 炖蚕豆与 Ta'meyyah 蚕豆饼|开罗街头 Ful 炖蚕豆早餐实拍（2008年）<br>埃及 Ta’meyyah 蚕豆饼实拍（2011年）|Zachbe at en.wikipedia · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) · [来源](https://commons.wikimedia.org/wiki/File:Ful_medames.jpg)<br>Losttraveller · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) · [来源](https://commons.wikimedia.org/wiki/File:Tameya_Karoleen_Lindberg.jpg)|960×720 / 87.1 KiB<br>960×566 / 88.5 KiB|
|`food:iceland:1` Skyr 冰岛乳制品|Skyr 乳制品实拍；菜品展示，未标作冰岛旅行现场|IcelandicProvisions · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Icelandic_Skyr.jpg)|630×640 / 11.0 KiB|
|`food:iceland:2` 冰岛羊肉蔬菜汤|冰岛羊肉汤 Kjötsúpa 实拍（2014年）|Ypsilon from Finland · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) · [来源](https://commons.wikimedia.org/wiki/File:Kj%C3%B6ts%C3%BApa.JPG)|960×1280 / 50.5 KiB|
|`food:arrowtown-autumn:1` 湖畔炸鱼薯条|新西兰炸鱼薯条实拍（摄于惠灵顿）；全国风味示例|Daderot · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) · [来源](https://commons.wikimedia.org/wiki/File:Fish_and_chips_-_Wellington,_New_Zealand.jpg)|960×672 / 201.1 KiB|
|`food:arrowtown-autumn:2` 吉布斯顿手工奶酪体验|未覆盖；见具体缺口|—|—|
|`food:edinburgh:1` Haggis 与萝卜、土豆|爱丁堡 Haggis、萝卜与土豆实拍（2008年）|Edinburgh Blog · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Haggis,_neeps_and_tatties_at_The_Cramond_Inn,_Edinburgh_(2660769244).jpg)|1280×960 / 60.2 KiB|
|`food:edinburgh:2` Cranachan 覆盆子燕麦甜点|Cranachan 覆盆子燕麦甜点实拍（2009年）|Saskia van de Nieuwenhof from Edinburgh, United Kingdom · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Cranachan_(4332953688).jpg)|500×667 / 58.7 KiB|
|`food:st-petersburg:1` 胡瓜鱼（корюшка）季节风味|圣彼得堡家常炸胡瓜鱼实拍（2016年）|Markovka · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Homemaid_fried_smelt_Saint_Petersburg_Russia.jpg)|1280×1184 / 113.9 KiB|
|`food:st-petersburg:2` Pyshki 甜甜圈与咖啡|圣彼得堡 Pyshki 实拍（2020年）|Messir · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:%D0%9F%D1%8B%D1%88%D0%BA%D0%B8-%D1%81%D0%BF%D0%B1.jpg)|960×540 / 66.5 KiB|
|`food:quanzhou:1` 面线糊|泉州面线糊实拍（2020年）|N509FZ · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:M%C4%AB-su%C3%A0nn-k%C3%B4o_in_Quanzhou_(20200929220207).jpg)|1280×853 / 95.2 KiB|
|`food:quanzhou:2` 土笋冻|土笋冻实拍（2024年）；源页未核定拍摄门店|Caizzz · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:%E5%9C%9F%E7%AC%8B%E5%86%BB.jpg)|1081×1280 / 179.1 KiB|
|`food:quanzhou:3` 姜母鸭|泉州做法姜母鸭实拍（北京，2024年）；源页明确为无汤泉州做法|N509FZ · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) · [来源](https://commons.wikimedia.org/wiki/File:Quanzhou-style_Kiu%E2%81%BF-b%C3%B3-ah_(Ginger_Duck)_at_Yipin_Xiangqing_Restaurant,_Beijing_(20240908174515).jpg)|1280×853 / 244.8 KiB|
|`food:hongkong:1` 港式蛋挞|香港酥皮蛋挞实拍（2012年）|See-ming Lee · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Egg_Tarts_with_Puff_Pastry.jpg)|960×720 / 69.2 KiB|
|`food:hongkong:2` 港式奶茶与茶餐厅|香港茶餐厅港式奶茶实拍（2014年）|City Foodsters · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) · [来源](https://commons.wikimedia.org/wiki/File:Hong_Kong-style_milk_tea.jpg)|1280×853 / 68.8 KiB|
