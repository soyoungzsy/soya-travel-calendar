# Scenic Sans SC

用于本地生成可打印旅行攻略的字体，按当前公开目录与排版字符子集化。字体文件不含任何用户资料。

来源（2026-10-21）：

- https://github.com/google/fonts/tree/main/ofl/notosanssc
- https://github.com/google/fonts/tree/main/ofl/notosanskr
- https://github.com/google/fonts/tree/main/ofl/notosans

采用Noto Sans SC 400字重为主体，加入现有目录所需的韩文“설렁탕”和拉丁扩展“Ş”；衍生字体已更名Scenic Sans SC。对应SIL Open Font License文本随文件保留。维护目录时应重新执行字体覆盖测试；需要的新字形必须从同等开放许可来源补入，不能使用系统商业字体。

2026-10-30补充：新增公开目录字形来自 `@fontsource/noto-sans-sc@5.3.1` 的400字重WOFF子集，许可证为OFL-1.1，保留原有字符覆盖与衍生字体名称。归档来源为 https://registry.npmjs.org/@fontsource/noto-sans-sc/-/noto-sans-sc-5.3.1.tgz 。仅合并所需字形，不执行包内代码、不增加产品运行依赖，也不把完整归档放入仓库。维护脚本为 `scripts/extend-booklet-font.py`，输入公开目录的字符集合与已核许可的字体归档；扩充后运行完整字体覆盖及PDF测试。
