# Codegraph 邻近方案：语义导航、代码搜索与上下文检索

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。仅查阅官方文档、仓库与源码，未安装、索引目标项目或运行性能测试。本文研究 Serena、SCIP／Zoekt／Sourcegraph、Augment Context Engine，供主横向比较引用。

## 1. 先区分两种“语义”

- **程序语义导航**：由编译器、语言服务器或 IDE 确定符号身份，回答定义、引用、实现与类型问题。Serena、SCIP 主要属于这一方向。
- **自然语言语义检索**：按问题的含义找相关代码片段。Augment Context Engine 主要按这一接口暴露能力；不能由“理解关系”的宣传推导出可审计调用边或完整影响闭包。
- **全文搜索**：匹配名称、字符串、配置、SQL、文档和历史。Zoekt 属于这一方向；符号排名也不等同于编译器级引用解析。

这三类可以互补，但不应为了覆盖表格而默认全部安装。共同限制是：检索结果为 As-Is 调查提供证据候选，无法代替项目事实判定、ADR 权威与 Spec／Plan 决策。

## 2. 横向判断

| 方案 | 原生解析／索引依据 | 原生 Agent 接口 | 调用与影响调查 | 对本项目的定位 |
|---|---|---|---|---|
| Serena LSP | 每门语言的 Language Server；符号和引用请求 | MCP，符号查询、编辑与诊断工具 | 返回引用所在符号；可逐层调查，但不是完整调用图／影响闭包查询器 | 最值得与 Codegraph 比较的本地语义导航补充或替代 |
| Serena JetBrains | 已打开项目的 JetBrains IDE 语义索引 | 仍通过 Serena MCP，工具按后端映射 | 引用、实现、类型层次与 IDE 重构；能力依赖 IDE／项目 | 已使用 JetBrains、依赖或重构需求较强时优先试 |
| SCIP 组件 | 语言专用 indexer 通常利用编译器前端／语言服务器；输出 Protobuf | 协议、绑定、CLI；本身不是 Agent 检索服务 | 定义、引用、实现关系与范围数据；需消费者提供查询／遍历 | 将来需要自持精确索引时的基础设施，不宜首版自建服务 |
| Zoekt 组件 | trigram 全文索引、语法信号；ctags 辅助符号排名 | CLI、HTTP／gRPC；官方 README 未提供原生 MCP | 搜索使用位置与变更候选，不解析语义调用关系 | 大量仓库全文搜索的轻量服务选择，非完整图替代 |
| Sourcegraph 产品 | 搜索启发式 + SCIP 精确索引；两种结果须区分 | 官方 Enterprise MCP、API、CLI | 定义、引用、实现、跨仓库检索和历史；未核验通用图导出／影响闭包 API | 多仓库企业基础设施，已有部署时直接接入 |
| Augment Context Engine | 托管语义检索，公开接口未给出可核验的全语言符号解析实现 | 本地 Auggie MCP 或托管 HTTP MCP，`codebase-retrieval` | 返回相关上下文；未核验显式调用边／引用完备性接口 | 接受云服务时的自然语言检索候选，不能当离线代码图 |

表格依据见各节源码和官方页面；“定位”为基于本项目范围的判断，非官方性能排名。

## 3. Serena：优先核验项目语言，且必须区分版本许可

**基线。** 源码 HEAD `18fa47bfccd9c27d05910a0ea12918276f1a6521`（2026-09-14 UTC）；`pyproject.toml` 标为 `1.7.1.dev0`，Python `>=3.11,<3.15`。核验时最新发布为 [v1.7.0](https://github.com/oraios/serena/releases/tag/v1.7.0)；不能把 HEAD 的新行为当成该发行版已提供。[源码版本](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/pyproject.toml)

**许可变动。** 当前 HEAD 的实际 LICENSE 明确：Serena 应用为 GPL-3.0-or-later，SolidLSP 组件仍为 MIT；最后 MIT 发行版为 v1.7.0，最后 MIT commit 为 `74c38a65f03fc0764d7ee4b3016ef6a07572ed64`，标记 `mit-final`。旧搜索摘要或 README badge 的 MIT 不能代表当前应用。插件选型应分别记录“外部工具调用”与“复制／分发实现”，不能用一个 MIT 标签概括。[LICENSE](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/LICENSE)

**解析来源与边界。** `find_referencing_symbols` 经过符号定位后调用语言服务器引用能力，再把引用位置归入包含它的符号；它并非“函数调用”的同义词。部分引用可能是类型或其他使用，排除 import 也不等于建立完整调用关系。其价值是减少同名文本误报并返回可继续读取的符号位置。[symbol.py](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/src/serena/symbol.py#L812)

**工作树。** 源码通过 `os.walk` 收集非忽略源码，而非只枚举 Git 已跟踪文件；引用工具在查询前同步文件系统变化，文件缓冲按磁盘修改时间重新读取并通知 LSP。因此，已保存的 dirty／未跟踪源码有进入查询的机制；这不保证每个 LSP 立即、完整识别新增文件，也不能推导出默认读取其他编辑器未保存缓冲。[文件收集](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/src/serena/project.py#L349)、[引用工具同步](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/src/serena/tools/symbol_tools.py#L253)、[磁盘缓冲](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/src/solidlsp/ls.py#L112)

**语言支持不能只数语言。** 官方列出多门语言和替代服务器，但也明确部分服务器缺少 references／rename；例如 Crystal 的 Crystalline 不支持 find-references，Ansible 所列服务器同样缺少多项符号能力。C/C++ 最好提供 `compile_commands.json`；部分语言需要 SDK、构建依赖或额外配置。LSP 初始化未完成还可能只返回同文件引用。[语言及依赖表](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/docs/01-about/020_programming-languages.md)、[初始化限制](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/src/solidlsp/ls.py#L1040)

**JetBrains 是另一套后端。** 需单独购买插件、运行 IDE 并打开目标项目，仍要 Serena MCP；它复用 IDE 对项目／依赖的解析，还提供类型层次、move／inline／safe-delete 等工具，部分功能标记 Beta。不能把这些能力计入免费 LSP 后端，也不能用 Serena 应用许可概括商业插件。[后端说明](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/docs/02-usage/025_jetbrains_plugin.md)、[官方插件页](https://plugins.jetbrains.com/plugin/28946-serena/)、[工具表](https://oraios.github.io/serena/01-about/035_tools.html)

**建议。** 与 Codegraph 做同一批“定义／引用／同名／重导出／接口实现”样例比较。若宿主已有可靠 LSP，先验证增量价值；若引入，仅启用需要的读取工具和项目配置，避免把 memories／onboarding 再变成第二份项目知识权威。

## 4. SCIP、Zoekt 和 Sourcegraph 必须拆开

### SCIP：开放精确索引格式与工具

`sourcegraph/scip` 当前重定向到 [scip-code/scip](https://github.com/scip-code/scip)。核验 HEAD `3f505277a1972691d3fd49625bb2d7bc9ae5d41f`，最新发布 [v0.10.0](https://github.com/scip-code/scip/releases/tag/v0.10.0)；协议仓库为 Apache-2.0，具体语言 indexer 的许可需另查。[LICENSE](https://github.com/scip-code/scip/blob/3f505277a1972691d3fd49625bb2d7bc9ae5d41f/LICENSE)

SCIP 表达文档、符号、出现位置、实现等关系；enclosing range 可支持消费端构造调用层次，但格式中能表达数据，不等于某个 indexer 已完整生成、某个 MCP 已暴露对应查询。其语言无关性也不代表所有语言达到相同准确率。[README](https://github.com/scip-code/scip/blob/3f505277a1972691d3fd49625bb2d7bc9ae5d41f/README.md)、[schema](https://github.com/scip-code/scip/blob/3f505277a1972691d3fd49625bb2d7bc9ae5d41f/scip.proto)

Sourcegraph 当前官方支持表中，Go、TS／JS、C/C++、Java、Scala、Python、Ruby 等具备跨仓库栏勾选，而 Kotlin、Rust、C# 该栏未勾选；需要按目标语言与依赖版本核验，不能统称“所有语言跨仓库”。编译器前端／语言服务器解决符号身份，但构建设置和解析成功范围仍决定覆盖。[indexer 支持表及原理](https://sourcegraph.com/docs/code-navigation/writing-an-indexer)

本地 indexer 可分析其输入目录，但格式本身不提供文件监听、dirty overlay 或查询服务器。接 Sourcegraph 时上传明确关联 repo／commit；标准部署流程围绕已同步的 Git revision，不应宣称自动覆盖本机未提交和未跟踪内容。[上传过程](https://sourcegraph.com/docs/code-navigation/how-to/index-other-languages)

### Zoekt：开放全文搜索引擎

核验 HEAD `153817f643cde8b229ee388c1dddbcf07f4798af`，Apache-2.0。支持单仓库／多仓库、正则和子串搜索，使用 trigram 与语法信号，并推荐 ctags 改善符号排名；它不提供与 SCIP 等同的语义引用判定。[README](https://github.com/sourcegraph/zoekt/blob/153817f643cde8b229ee388c1dddbcf07f4798af/README.md)、[LICENSE](https://github.com/sourcegraph/zoekt/blob/153817f643cde8b229ee388c1dddbcf07f4798af/LICENSE)

有 `zoekt-git-index` 索引 Git repo，也有 `zoekt-index` 索引普通目录，后者可以基于磁盘快照覆盖保存后的本地修改；应明确使用哪条路径以及重建时机。提供 CLI、Web、JSON API 和 gRPC，可本地部署；MCP 需另选适配器，不能把第三方 MCP 当官方内置。[用法与 API](https://github.com/sourcegraph/zoekt/blob/153817f643cde8b229ee388c1dddbcf07f4798af/README.md#usage)

### Sourcegraph：商业平台

当前官方页面将自托管和完整 MCP 列为 Enterprise 能力，也提供单租户云；SCIP／Zoekt 的开源许可不意味着 Sourcegraph 整体可以按 Apache-2.0 分发。当前私有平台源码未作为本轮可审阅来源；不据旧 open-core 文章推定现行产品许可。[部署](https://sourcegraph.com/docs/self-hosted)、[产品方案](https://sourcegraph.com/pricing)、[服务条款](https://sourcegraph.com/terms/tos)

MCP `/all` 暴露 `find_references`、`go_to_definition` 等；默认端点工具子集不同。搜索式导航使用文本／语法启发式，Precise Code Navigation 才使用 compile-time 信息；做证据记录时要标记结果是哪一类。历史、diff、跨仓库与 ACL 是平台相对本地单项目工具的主要价值。[MCP](https://sourcegraph.com/docs/api/mcp)、[导航类型](https://sourcegraph.com/docs/code-navigation)

**建议。** 已有 Sourcegraph 企业部署则优先复用；从零为本地插件搭建整套平台成本偏重。SCIP 可保留为未来精确证据格式选项，Zoekt 仅在规模化全文搜索出现实测瓶颈时加入。

## 5. Augment Context Engine：相关，但属于托管检索

核验公开仓库 `augmentcode/auggie` HEAD `9cc3ead419db9486ad44e6e4bba30ecd6784ccff`。它不是 Context Engine 完整源码；README 给出 CLI、示例和官方文档。实际 LICENSE 为 CLI 自定义专有许可，含订阅、修改和再分发限制；公开 GitHub 仓库不能等同于开源引擎。[README](https://github.com/augmentcode/auggie/blob/9cc3ead419db9486ad44e6e4bba30ecd6784ccff/README.md)、[LICENSE](https://github.com/augmentcode/auggie/blob/9cc3ead419db9486ad44e6e4bba30ecd6784ccff/LICENSE.md)

官方 MCP 区分两种路径：本地 Auggie 提供 stdio，针对工作目录实时更新；远端 HTTP 由 GitHub App 索引选定 repo 的默认分支，在该分支收到 push 后更新。两者不是同一份工作树视图。[MCP 说明](https://docs.augmentcode.com/context-services/mcp/overview)

“本地 server”描述连接端，不代表离线部署：官方说明代码由 Augment 保存，workspace setup 明确上传到云。CLI 文档按工作区文件及 `.gitignore`／`.augmentignore` 排除，而非只列 Git tracked；据此推断普通未跟踪文件可进入索引，但本轮未实测及时性。未保存编辑器缓冲不在确认范围。[CLI 索引规则](https://docs.augmentcode.com/cli/setup-auggie/workspace-indexing)、[云上传说明](https://docs.augmentcode.com/setup-augment/workspace-indexing)

公开的 `codebase-retrieval` 适合问“实现在哪里、哪些代码相关”，未核验可导出的调用图、稳定符号 ID、所有引用清单、完整语言解析清单与逐边置信度。不能以返回结果质量宣传替代可复核关系图。[MCP 接口](https://docs.augmentcode.com/context-services/mcp/overview)

**建议。** 若允许云端索引并愿意采用商业服务，可作为自然语言检索组的对照；当前以开放、本地、可审计为主的插件首版不将其设为强制依赖。

## 6. 对主横向比较的结论与试点要求

1. **同代码图赛道与语义导航赛道分组比较。** Serena 是值得试的替代／补充，但不能用 rename、诊断分数掩盖其没有已核验通用图查询接口的差别。
2. **本地试点优先 Codegraph + Serena 二选一对照。** 先单独运行相同问题，只有证实互补再组合，避免双索引与重复上下文。
3. **不能把“LSP／SCIP”直接记成精度胜出。** 记录实际语言、SDK、构建模式、索引版本、失败和未解析范围；动态分发、反射、字符串路由及外部服务仍需其他证据。
4. **独立测 freshness。** 修改 tracked 文件、创建 untracked 文件、删除／重命名、切分支、依赖签名变化；观察查询生效点，而非只检查进程健康或索引时间。
5. **衡量任务结果。** 用同一问集记录已确认正确的定义／引用、误报／漏报、结果位置可回溯性、初始化与更新成本；本轮没有这些实测排名。
6. **插件保留薄适配层。** 统一 `repo + worktree state + tool/index version + query + source locations + limitations` 的证据记录，检索结果仍须被 As-Is／Spec／Plan 的责任步骤核验。

补充：Serena 当前许可变更应回写既有复用表；稳定 v1.7.0 与当前开发 HEAD 需分列，不能用本次开发版能力和旧版 MIT 许可拼成一个不存在的版本。
