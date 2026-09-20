# Codegraph 同类工具横向比较

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

初次核验日期：2026-09-15；2026-09-16 的 A1 定向复核与入围处理见[第 10 节](#a1-retrieval)。比较基线是用户已有的 **colbymchenry/codegraph**，不是其他同名项目。已阅读官方文档、许可证和关键实现；未安装候选、未在同一仓库运行性能或准确性评测。下文历史机制按各自固定提交理解，尚无实测排名。

## 1. 候选覆盖与比较方向

**当前沿用 Codegraph 与原文读取；用户已明确因 star 太少而不考虑 codebase-memory-mcp，已取消其对测和接入安排。** 原源码研究保留，不将用户的生态偏好解释成质量实测结论。下面按需求组织的候选覆盖仅作历史资料，顺序不表示排名。

1. **结构图、调用链、影响调查和本地 Agent 接口：** Codegraph、codebase-memory-mcp 等属于直接可比的结构工具。
2. **自定义图查询、可选编译器索引或共享图后端：** 比较 CodeGraphContext 等路线。
3. **需要预先组织的执行流程、聚类和图交互：** GitNexus 功能相关，但当前非商业许可证影响通用开发插件的默认采用。
4. **需要资源/数据流调查、可选运行调用证据或自带问答的 Graph RAG 系统：** 考虑 Code-Graph-RAG；固定结构查询可不依赖 LLM，自然语言及向量能力分别增加依赖。
5. **某一语言的符号消歧或重构是主要问题：** 评估 Serena，或 Go/TS 专项候选 Lordymine/codegraph。
6. **代码、SQL、配置与 ADR/文档关联：** Graphify 属于混合资料图候选。它也有代码影响查询和 Wiki 导出，但后者主要是图索引，不能直接视为完整 As-Is 知识维护；仍需扩展同类覆盖并统一比较。

没有同题实测依据支持“换成某工具一定更准、更快、更省 token”。各工具上游 benchmark 的语言、题目、模型、缓存和统计口径不同，本轮不据此做速度或准确率排名。

## 2. 本轮如何定义同生态位

Codegraph 在本项目中承担：**代码结构索引 → 源码定位与关系查询 → 变更影响候选 → Agent 上下文输入**。As-Is 语义说明、ADR 采纳和测试结果继续由知识与开发流程管理。

筛选重点：

| 维度 | 需要比较的问题 |
| --- | --- |
| 索引对象 | 只索引文本/代码块，还是文件、符号、调用、导入、继承及框架连接？ |
| 关系解析 | 按名字/导入消歧、自有类型推断，还是实际调用语言服务/编译器索引？ |
| 查询能力 | 找定义、找引用、调用链、反向影响、相关测试、自然语言定位、任意图查询各有哪些？ |
| 持续更新 | 修改、新文件、删除、重命名、切分支后，正文索引和关系索引分别如何刷新？ |
| 新鲜度与证据 | 能否看出未完成同步、失败、缺少解析和被截断范围？结果是否定位到源码？ |
| 接入成本 | CLI/MCP/库接口、数据库和模型依赖、构建环境、许可与升级适配是什么？ |

“能解析一种语言”只说明某些语法可识别。跨文件调用、接口分派、框架注册、宏及反射可能有不同覆盖程度，不能用语言总数代替能力比较。

## 3. 直接同类候选

| 工具 | 关系来源与查询重点 | 持续更新及边界 | 运行与许可 | 对本项目的判断 |
| --- | --- | --- | --- | --- |
| **[Codegraph](https://github.com/colbymchenry/codegraph)** | Tree-sitter/Rust 抽取，导入与名称解析，框架连接；动态合成边标记 heuristic。提供 explore、影响、调用路径、相关测试候选 | watcher、增量 sync、连接时补同步及 pending 提示；补同步超时/失败仍可能返回旧结果 | 本地 SQLite、CLI/MCP/TS 库；核心结构查询不需模型；MIT | **现状基线**。已有使用经验，重点核验真实语言/框架的遗漏与误连，不预设必须保留或替换 |
| **[codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)** | Tree-sitter + 内嵌自有类型解析；持久结构图、调用链、架构、影响和检索 | Git 状态/HEAD/文件状态轮询，增量维护；非 Git 项目的自动轮询边界需注意 | 本地 C 实现和 SQLite，MCP；MIT | **结构图候选**。功能形态接近，但“Hybrid LSP”不等于调用完整语言服务器 |
| **[Graphify](https://github.com/Graphify-Labs/graphify)** | AST 与自身解析，加 SQL、Markdown 链接、部分代码 rationale/ADR 引用和模型语义关系；query/path/explain/affected，图报告及 Wiki | 代码与语义层分开更新；watch、缓存与 MCP reload 不等于全图最新；Markdown 缓存排除 frontmatter，ADR 状态需直读 | Python/NetworkX、CLI/MCP；代码结构无需 LLM，语义抽取需宿主或后端；当前 Apache-2.0 | **混合资料图候选**。分别比较代码与资料关联能力；Wiki 导出不直接等同于知识结论维护 |
| **[GitNexus](https://github.com/nxpatterns/gitnexus)** | 代码图、类型/导入解析，聚类与流程组织；query/context/impact/detect_changes/Cypher | analyze 有内容 hash 增量和 dirty 检查，watch 可持续刷新；MCP 部分 stale 提示主要依据提交变化 | 本地 CLI/MCP/图存储及 Web 入口；当前 PolyForm Noncommercial 1.0.0 | **功能有吸引力的条件候选**。插件面向商业开发时先明确许可适用性 |
| **[CodeGraphContext](https://github.com/CodeGraphContext/CodeGraphContext)** | Tree-sitter 启发式；部分语言可启用外部 SCIP；调用、继承、关系查询与 Cypher | watch 初次索引并监听文件；修改会重连相关调用者/继承者；提供 job 状态，需验证完成与读取边界 | Python；可选内嵌或远端图数据库；CLI/MCP；应用 MIT，后端分别核对 | **结构分析候选**。适合需要 SCIP/Cypher/后端选择的项目，接入条件较多 |
| **[Code-Graph-RAG](https://github.com/vitali87/code-graph-rag)** | 多语言结构图、固定关系查询、自然语言图查询；可选资源/数据流和 Python 运行调用证据 | watcher/reingest 更新文件及图中依赖者；语言和解析器变化后的范围需验证 | Python + Memgraph（默认）或 Neo4j 服务；自然语言流程需模型，向量功能另有依赖；MIT | **深度调查候选**。需要资源/数据流或运行证据时优先评估；基础查询无需再套 LLM |
| **[Lordymine/codegraph](https://github.com/Lordymine/codegraph)** | Go 使用 go/packages + VTA；TS/JS 使用 scip-typescript；MCP 调用者、被调用者和结构查询 | 增量重建与启动时索引；两次重建之间可陈旧，解析失败可能保留定义而缺调用边 | Go 工具与 SQLite；目标语言工具链/依赖需要就绪；MIT | **Go/TS 专项试验**。覆盖面窄，适合验证编译器解析是否改善具体消歧问题 |

GitNexus、Code-Graph-RAG 与本地索引的细节来源见[图工具研究](codegraph-alternatives-graph.md)、[本地索引研究](codegraph-alternatives-indexes.md)与[Codegraph 既有核验](codegraph-as-is-role.md)。Graphify 见[专项研究](graphify-assessment.md)与[维护审计](graphify-maintenance-audit.md)；CodeGraphContext 与 Lordymine 的源码依据见第 6 节。表中能力表示已找到对应文档或实现，不表示在目标仓库通过测试。

## 4. 邻近工具：什么时候值得一起比较

| 工具 | 擅长的能力 | 与结构图工具的关系 |
| --- | --- | --- |
| **[Serena](https://github.com/oraios/serena)** | LSP 或 JetBrains 后端的定义、引用、符号操作；MCP | 可以替换部分代码导航/编辑能力。引用查询不等于完整影响图；当前开发 HEAD 应用 GPL-3.0-or-later，最新发行版 v1.7.0 仍 MIT，SolidLSP 组件 MIT |
| **[CocoIndex Code](https://github.com/cocoindex-io/cocoindex-code)** | AST 分块、embedding 检索及增量刷新；CLI/MCP | 适合“不知道代码叫什么，但知道功能描述”的检索缺口；不自动提供 Codegraph 的调用/影响图；Apache-2.0 |
| **[code-index-mcp](https://github.com/johnhuang316/code-index-mcp)** | 文件、符号、全文检索，shallow/deep 索引 | 更轻的搜索/符号目录候选；watcher 更新浅索引不等于深层数据全部刷新；MIT |
| **[SCIP](https://github.com/scip-code/scip) / [Zoekt](https://github.com/sourcegraph/zoekt)** | SCIP 表达精确代码导航索引；Zoekt 提供代码文本搜索 | 是可复用组件；搭出完整 Agent 图查询服务还要存储、接口和维护适配，首版优先消费已集成它们的工具 |

Sourcegraph 产品与上述开放组件分别评估；不能把组件的 Apache-2.0 许可或能力等同于整个产品。托管上下文检索另有部署与工作区同步边界，见[语义导航与平台研究](codegraph-alternatives-semantic.md)。

## 5. 比功能清单更重要的差异

### 5.1 调用图的边是怎样得到的

同一文件中出现 `client.save()`，至少需要知道 client 的类型、save 属于哪个实现，以及导入/注入如何绑定。语法树只给出表达式，其他信息要由解析器补充。

- **Codegraph：** 导入与名称解析，加框架/动态连接合成；合成边有 heuristic 标识，可保留到调查结论。[解析说明](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/core-concepts/resolution.md)
- **Graphify：** AST 加自身符号解析，并混合显式文档链接与语义推断。EXTRACTED 表示来源显式陈述，不意味着 ADR 已实现；不能将概念关联路径当成运行调用链。其 SCIP 风格 JSON 模块仍为未接 CLI 的简化骨架。[源码核验](graphify-assessment.md#42-关系标签和调用精度要怎样读)
- **codebase-memory-mcp：** 采用内嵌类型解析，官方称 Hybrid LSP；其机制不是启动每种语言的完整 LSP。要测具体语法与框架，不据名称断言达到 IDE 精度。[源码核验](codegraph-alternatives-indexes.md)
- **CodeGraphContext / Lordymine：** 可以借助外部 SCIP 或语言工具链，但依赖构建信息、项目配置与解析器支持；失败后的回退/缺边也要作为结果的一部分。
- **Serena：** 利用真实语言服务/IDE 后端，适合符号消歧与编辑；引用结果并不自动等于一份覆盖所有动态调用的完整影响图。[导航机制](codegraph-alternatives-semantic.md)

这几条路线各有取舍。语言服务/编译器索引也不会自动解决所有反射、动态路由与运行时依赖；最终需要在项目实际模式上验证。

### 5.2 “增量”必须拆成三件事

| 层次 | 例子 | 本项目应检查什么 |
| --- | --- | --- |
| 内容更新 | 修改函数体，搜索返回新内容 | 索引是否读取本地文件，是否遗漏未提交/新增文件 |
| 关系更新 | 改变接口实现或导入目标 | 没改动的调用方是否重新解析，旧边是否被移除 |
| 查询可判断新鲜度 | 索引尚在更新或更新失败 | 返回是否标明旧结果、缺失范围和实际基线 |

Codegraph 的 watcher/pending/catch-up 提供了相关机制，但已核验到 catch-up 超时后继续服务的路径。GitNexus 的显式 status/analyze 与 MCP 默认新鲜度判断也并非完全等价；code-index-mcp 的 shallow 与 deep 刷新不同。这些差异直接影响 Agent 是否会依据旧结构制定 Plan。[Codegraph 边界](codegraph-as-is-role.md)、[GitNexus 核验](codegraph-alternatives-graph.md)、[本地索引核验](codegraph-alternatives-indexes.md)

Graphify 还需要区分 AST/语义 manifest、抽取缓存及 MCP 图文件热加载。仅修改 ADR frontmatter 时，完整文件变化可被检测，但正文缓存仍可能复用；只重新加载图也不证明语义来源已更新。[维护源码审计](graphify-maintenance-audit.md)

### 5.3 自然语言搜索不等于语义调用解析

“搜索支付失败重试”是检索相关实现；“这次改动影响哪些调用者”是解析与遍历关系。FTS、embedding、LLM 生成图查询分别解决不同问题，不能因为都有 semantic 字样就认为能力相同。

例如 CocoIndex Code 侧重 AST 代码块向量检索；Codegraph 的结构查询不要求额外模型；Code-Graph-RAG 连接图服务，固定关系查询不需 LLM，自然语言查询再引入模型。需要比较完整查询链路的结果和成本，而非只比较一次数据库查询延迟。[本地检索机制](codegraph-alternatives-indexes.md)、[Graph RAG 机制](codegraph-alternatives-graph.md)

## 6. 补充源码核验：CGC 与语言专项候选

### CodeGraphContext

读取基线：[2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf](https://github.com/CodeGraphContext/CodeGraphContext/tree/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf)，提交日期 2026-09-06；实际 [LICENSE 为 MIT](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/LICENSE)。

- **图和接口：** 有代码/调用/继承等关系查询、Cypher、作业状态与 watcher 入口；CLI 和 MCP 均可用。不能把“自然语言与 Agent 对话”直接当成该工具自带完整语义检索模型。[MCP 接口](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/docs/MCP_TOOLS.md)
- **SCIP 可选：** `SCIP_INDEXER` 对部分语言启用外部索引；C/C++ 的 scip-clang 需要编译数据库，C# 的 scip-dotnet 需要工程和依赖恢复。实现中仍会补 Tree-sitter 结果，不能把整张图所有边都标为编译器确认。[README](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/README.md)、[SCIP pipeline](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/src/codegraphcontext/tools/indexing/scip_pipeline.py)
- **文件监听：** 已读实现处理创建、修改、删除和移动；修改路径扩展到相关调用者/继承者再重新连接。初次 SCIP 图在持续更新时的完整能力与来源标识仍需端到端验证。[watcher](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/src/codegraphcontext/core/watcher.py)
- **向量消歧是可选推断：** VectorResolver 在启用后用函数 embedding 相似度辅助候选选择；相似度并不是调用真实性证明，不应将此类结果与编译器解析混同。[实现](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/src/codegraphcontext/tools/indexing/vector_resolver.py)
- **部署：** 当前支持 FalkorDB Lite、Kuzu/Ladybug 等内嵌选择，也支持远端图后端。不能沿用“必须搭 Neo4j/Docker”印象；内嵌后端仍有安装和内存配置成本，SCIP 另有工具链依赖。[数据库选项](https://github.com/CodeGraphContext/CodeGraphContext/blob/2ef71b05a2ad1c5fd644c3ba52d77b502adaf1cf/README.md#database-options)

### Lordymine/codegraph

读取基线：[a82876289a1a5040a4f6c399b4635ac9d3efb390](https://github.com/Lordymine/codegraph/tree/a82876289a1a5040a4f6c399b4635ac9d3efb390)，提交日期 2026-06-23；实际 [LICENSE 为 MIT](https://github.com/Lordymine/codegraph/blob/a82876289a1a5040a4f6c399b4635ac9d3efb390/LICENSE)。这是另一项目，不是用户 Codegraph 的配置项。

源码确实按 TS 配置范围调用 SCIP，并为 Go 调用专门的 VTA 解析；失败时会 best-effort 跳过相应范围。保留符号索引不表示调用解析完成。增量按范围控制调用边重建，README 明确两次索引之间可能陈旧。[调用解析](https://github.com/Lordymine/codegraph/blob/a82876289a1a5040a4f6c399b4635ac9d3efb390/internal/index/calls.go)、[增量实现](https://github.com/Lordymine/codegraph/blob/a82876289a1a5040a4f6c399b4635ac9d3efb390/internal/index/incremental.go)、[README](https://github.com/Lordymine/codegraph/blob/a82876289a1a5040a4f6c399b4635ac9d3efb390/README.md)

可以作为 Go/TS 项目的解析质量参照；没有证据表明它在多语言覆盖、日常自动维护和插件集成上全面优于用户当前工具。

## 7. 应如何做一次有意义的横测

按[统一选型页的首轮名单](../../docs/tools/existing-tools-reuse-plan.md#a1-shortlist)固定真实 brownfield 仓库及本地文件状态开展横测。Codegraph 和普通搜索/直接读取作为现状对照；代码结构、语义导航与资料关联按各自需求评分，未覆盖某一需求不自动代表整个工具落后。

| 场景 | 人工建立的判断依据 | 记录什么 |
| --- | --- | --- |
| 同名方法、导入别名、跨包调用 | 核实真实定义与调用位置 | 抽样关系的误连、漏连及来源可定位性 |
| 接口实现、回调、事件与路由 | 明确实际注册/绑定逻辑 | 能否找到路径；推断是否有标记；未覆盖处是否被误称为无依赖 |
| 从功能描述寻找实现 | 固定问题及相关源码集合 | 首批结果的相关性、证据完整度、额外读取成本 |
| 变更影响与相关测试 | 真实近期变更及人工核验影响集合 | 找到必要调用方/测试的比例；无关结果与遗漏 |
| 未提交修改、新增文件 | 相同工作区状态 | 无需 commit 是否可检索；多久可用；等待期间是否提示陈旧 |
| 重命名、删除、导入目标变化 | 明确旧边/新边 | 旧节点清除、调用方重解析、指向不存在路径的结果 |
| 断开服务、切分支再恢复 | 记录前后代码状态 | catch-up 行为、失败可见性；是否把旧图当作最新 |
| 解析/构建失败 | 缺依赖、错误配置或不支持模式 | 回退范围、缺边是否可观察；不能只看 index 命令是否成功 |
| 同步持续变化 | 查询与编辑交错 | 结果能否绑定已检查范围；是否混合前后版本 |

性能分别记录首次索引、无变化检查、小改动更新、冷/热查询、峰值内存和索引体积；Agent 效果固定宿主、模型、问题及读取规则，计入索引/更新/额外读取的完整成本。速度、关系正确率和回答质量分别记录，不能相互替代。上表是待执行方案，本轮没有实测数据。

## 8. 对 AI SDLC 插件的影响

保留“代码结构提供者”这一可替换位置，先确定共同输入输出与现状基线，再根据精选结果决定适配对象和支持范围。当前研究不触发新增工具安装或适配开发。

适配至少要能表达：仓库与范围、符号/源码定位、关系类型、关系来源或无法确定、索引状态、未解析/截断范围，以及本次实际代码基线。上游没有的字段如实标为未知，不能统一包装成高置信度。

提供者分能力声明：符号检索、调用/引用、影响、相关测试候选、语义搜索、显式刷新、新鲜度查询。流程按已有能力调用；不要求每个候选伪装成拥有全部功能。MCP 统一调用形式，不自动统一这些语义。

Graphify 增加“文档引用/设计原因/概念关联”的可选能力，并需要分别表达结构更新和语义更新状态。前者辅助寻找 ADR，不能替代适用性判定；图导出的 Wiki 仍是派生调查材料，不能增设第二个 As-Is 正文权威。

对 OpenWiki 的组合保持不变：结构工具提供调查和影响线索，Agent 阅读原始代码形成或复核知识页。切换索引工具不迁移 ADR/Intent/Spec/Plan 的权威位置，也不把结构图缓存变成 As-Is 正文。

## 9. 研究依据导航

- [Codegraph 在 As-Is 中的作用](codegraph-as-is-role.md)：基线源码、图关系、调用合成、增量与 catch-up 限制。
- [Graphify 专项研究](graphify-assessment.md)与[维护审计](graphify-maintenance-audit.md)：代码/资料关系、Wiki、模型与证据性质、分层更新及 hooks 边界。
- [GitNexus 与 Code-Graph-RAG](codegraph-alternatives-graph.md)：当前源码、图机制、更新、模型与许可。
- [codebase-memory-mcp、code-index-mcp、CocoIndex Code](codegraph-alternatives-indexes.md)：结构图与搜索工具差异，以及 dirty/deep-index 等边界。
- [Serena、SCIP/Zoekt 与托管检索](codegraph-alternatives-semantic.md)：真实语言服务与开放组件/商业产品的区别。

项目读取基线固定到提交；官方文档的动态页面按核验日期理解。源码存在某项实现只证明发现了能力入口，真实仓库兼容性和效果以横测为准。

<a id="a1-retrieval"></a>

## 10. A1 定向复核与检索层入围处理（2026-09-16）

**当前处理：codebase-memory-mcp 已按用户明确决定排除，不安排安装、同题检索比较或接入；继续使用 Codegraph 和原文读取。** 用户给出的原因是 star 太少，未给定通用数量门槛。本节下方保留原入围依据、来源与适配分析作为历史研究，相关测试建议不再是当前行动；除非用户重新提出，否则不重开该工具。

### 10.1 本次来源、许可和适配差异

本次读取点是源码，不等于目标项目安装版本。旧节中 catch-up、缓存等机制结论继续绑定其原提交；升级是否改变边界由试点前差异核验及行为测试判断。

| 对象 | 本次固定来源与许可 | A1 判断、维护和退出 |
| --- | --- | --- |
| 用户已有 Codegraph | [8f8081968ed5](https://github.com/colbymchenry/codegraph/tree/8f8081968ed52bdb2e5a05136da632e898329fe1)；[package](https://github.com/colbymchenry/codegraph/blob/8f8081968ed52bdb2e5a05136da632e898329fe1/package.json) 1.6.0 / Node ≥20,<25；[MIT](https://github.com/colbymchenry/codegraph/blob/8f8081968ed52bdb2e5a05136da632e898329fe1/LICENSE) | **沿用基线**。本次复核版本/许可及索引文档，未把最新提交全量重新审计；用户实际安装版本仍由 A2 获取。检验误连、遗漏和陈旧结果可见性。退出新增试验后保留现有入口，不迁移业务正文 |
| codebase-memory-mcp | [59a05eb1bf9e](https://github.com/DeusData/codebase-memory-mcp/tree/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866)；[v0.11.0 release](https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.11.0) 为历史阅读候选，未核定与 HEAD 的全部差异；[MIT](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/LICENSE) | **已排除，原入围建议失效**。未安装或测试；下文保留二进制、后台协调、缓存及来源更新的历史分析，不安排对应实施 |
| Graphify | [c7ec1082083e](https://github.com/Graphify-Labs/graphify/tree/c7ec1082083e3e876443f643ecf86ebcfae177c2)；[pyproject](https://github.com/Graphify-Labs/graphify/blob/c7ec1082083e3e876443f643ecf86ebcfae177c2/pyproject.toml) 0.9.62 / Python ≥3.10；[Apache-2.0](https://github.com/Graphify-Labs/graphify/blob/c7ec1082083e3e876443f643ecf86ebcfae177c2/LICENSE) | **条件候选**。当代码/SQL/ADR/文档关联确有遗漏时增加同题试验；本轮只复核包/许可/README，分层更新边界按前次审计保留为待测项。额外维护 Python、结构/语义层与可选模型；不默认安装 Git hooks。退出需核对本次配置/导出文件，保留原文 |
| Serena | [1bbe53546124](https://github.com/oraios/serena/tree/1bbe53546124c00e4238972f1599a91fbf8c6539)；[pyproject](https://github.com/oraios/serena/blob/1bbe53546124c00e4238972f1599a91fbf8c6539/pyproject.toml) 1.7.1.dev0 / Python ≥3.11,<3.15；[应用 GPL-3.0-or-later，SolidLSP MIT](https://github.com/oraios/serena/blob/1bbe53546124c00e4238972f1599a91fbf8c6539/LICENSE) | **条件候选**。仅当现有检索不能可靠处理目标语言符号时评估 LSP 路线；不把完整语言服务等同于业务影响图。运行语言服务器/可选 IDE 后端有维护成本；停用后保留源码，不另建 memory 权威。1.7.0 与当前源码许可不同，分发时按实际版本核对 |

**CBM 当前需要实际测试的边界：**

- 其“Hybrid LSP”是内嵌 C 类型解析，不是启动真实语言服务器。当前 watcher 源码仍对非 Git 项目跳过常规轮询；Git 项目采用轮询与 dirty 签名，不能把索引命令成功或后台运行当成所有结果最新。[README](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/README.md)、[watcher](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/src/watcher/watcher.c)、[增量管线](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/src/pipeline/pipeline_incremental.c)。
- CLI 不启动后台 watcher；MCP 的注册与后台启用是不同配置。README 声明索引会写入/刷新 `.codebase-memory/graph.db.zst`，导出还会生成自身目录内的 `.gitattributes`。A2 记录这些真实副作用及配置归属，缓存无需提交，不把自动导出误判成已完成交付。[运行与 artifact 说明](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/README.md)。
- 向量排序使用随包数据，许可证需连同实际分发的第三方 notices 核对；它不是需要远程模型服务的完整 Nomic 推理，也不是调用边正确性的证明。[语义实现](https://github.com/DeusData/codebase-memory-mcp/blob/59a05eb1bf9e11deb060d782cd7d3a29f2ae2866/src/semantic/semantic.c)。

### 10.2 其余候选为何不扩大首轮

| 路线 | A1 处理与重新进入的条件 |
| --- | --- |
| CodeGraphContext、Code-Graph-RAG、Lordymine/codegraph | 条件候选：明确需要外部 SCIP/Cypher、资源/数据流/运行证据或 Go/TS 专项时，按第 3/6 节固定来源评估；目前没有目标技术栈或相对必需覆盖，额外解析器/服务不列通用依赖 |
| code-index-mcp、CocoIndex Code、Repomix | 条件候选：现有文件搜索、自然语言检索或离线上下文导出存在具体缺口时分别试验。它们不替代完整调用/影响分析，已有结构图和宿主读取够用时避免再建同类索引 |
| GitNexus | 不进首轮：当前 PolyForm Noncommercial 1.0.0 的使用适用性未明确；没有实际场景前不列商业开发插件默认依赖。不是准确性不合格结论 |
| SCIP、Zoekt、Sourcegraph、Augment | 开放组件需要服务集成，托管产品有不同条款和数据/账户条件。已有部署或明确检索缺口时复评；首轮不为调查另建搜索服务 |

**成熟度与退出判据：** 当前候选有公开可读取实现和许可，但提交活跃、语言数量及自报 benchmark 不能证明目标框架稳定。A2 固定实际安装版本/依赖；A3 同时查已知调用链和已知易遗漏边，加入未提交/新文件、配置变化、重命名、索引中断，再复核维护/停用是否遗留进程、配置或误删文件。记录完整索引成本和人工补查；质量不达标时不以速度换取采用。具体执行组见[首轮试验安排](../../docs/tools/existing-tools-reuse-plan.md#a1-trials)。
