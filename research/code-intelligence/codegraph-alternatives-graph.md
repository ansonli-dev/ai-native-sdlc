# Codegraph 同生态位：GitNexus 与 Code-Graph-RAG

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。范围为仓库结构索引、关系查询、影响调查和 Agent 上下文；不是 As-Is 正文管理或 SDD 主流程。本文只读取官方文档、实际 LICENSE 和固定提交源码，未安装、未运行目标仓库、未复现准确率或性能基准。

## 1. 版本与定位

| 项目 | 核验提交 / 源码包版本 | 实际许可证 | 初步位置 |
|---|---|---|---|
| GitNexus | `401fc96c16426cd5c261ae7e54b5a667516fa452`；CLI `1.6.11` | PolyForm Noncommercial 1.0.0 | 图检索、流程和影响调查一体化强候选；不能预设为可商业分发的宽松开源依赖 |
| Code-Graph-RAG | `5b47825f1182683f6f7ee7bc284091a2ec35cd1b`；包 `0.0.943` | MIT | 服务型多语言代码图，偏深入的结构、数据流、运行证据调查 |

GitNexus 的当前 GitHub API 仓库归属为 **nxpatterns/gitnexus**，旧 `abhigyanpatwari/GitNexus` 名称仍见于官方包元数据。Code-Graph-RAG 的归属是 **vitali87/code-graph-rag**。上述包版本来自固定提交，不等于已经核验所有发布渠道版本。[G1], [G2], [G12], [C1], [C2]

## 2. 横向能力

| 比较维度 | GitNexus | Code-Graph-RAG |
|---|---|---|
| 输入与产出 | 本地仓库 → `.gitnexus/` 内嵌 LadybugDB、解析缓存、文件 hash 和元数据；全局 registry 定位仓库 | 本地目录/仓库 → 共享图服务中的 Project/文件/符号/关系；仓库内保留 hash、解析器指纹等缓存 |
| 基础图关系 | 文件包含、定义、导入、调用、继承、实现、属性访问、方法覆盖；另有 Community、Process | 包/目录/模块、定义、导入导出、调用、引用、实例化、继承、实现、覆盖，以及参数/返回类型关系 |
| 更高层关系 | 路由处理、DI、消息发布/消费等框架模式；流程由入口和调用图派生 | Resource 与 READS_FROM/WRITES_TO；启用 `io` 后有 FLOWS_TO；可附运行调用证据 |
| 跨文件解析 | Tree-sitter + 分语言 import resolver、作用域/类型/接收者解析；MRO/DI 等后处理 | Tree-sitter + import mapping、qualified name registry、类型推断与调用解析；特定语言可叠加编译器事实 |
| Agent 查询 | MCP/CLI `query`、`context`、`impact`、`detect_changes`、Cypher 等；自然语言检索聚合到流程 | MCP/CLI 既有自然语言→Cypher，也有不依赖 LLM 的 resolve/definition/callers/callees/implementors/importers/tests_reaching |
| 影响调查 | 面向修改的直接入口较多：符号上/下游、Git diff 到符号/流程、API 影响；结果带置信度/消歧 | 调用/引用/继承等固定查询可组合影响调查；tests_reaching 提供候选测试，不能视为测试覆盖证明 |
| 数据流 | `--pdg` 可生成 CFG、REACHING_DEF、CDG 和 taint 层；当前文档限定 CFG 为 TS/JS | opt-in `io`；Python 深度分析，其他已覆盖语言使用较轻的 walker；不同资源和语言仍有明确缺口 |
| 增量入口 | 重跑 analyze 的文件 hash 差异路径；`analyze --watch` 监听本地文件并串行刷新 | `update_repository`/更新图 + 显式 `reingest(paths)`；watcher 走同一个 reingest 路径 |
| 本地依赖 | Node 22.x（至少 22.18）或 >=24.11、原生 Tree-sitter/LadybugDB；可选 embedding/ONNX；无需独立图服务 | Python >=3.12；**外部 Memgraph 或 Neo4j**；官方 bundled 本地栈用 Docker；语义搜索增加 embedding/向量组件 |

关系与查询依据：[G1], [G3], [G4], [G5], [C3], [C4], [C5], [C6]；依赖与后端依据：[G12], [C2], [C7], [C8]。表中是静态代码关系和推断，不能解释成运行时完整调用链。

## 3. GitNexus：强在面向 Agent 的影响调查

### 已核验的实现

- 源码 pipeline 确有跨文件、作用域解析、MRO/DI、community/process 和 opt-in taint/call-summary 阶段；不只是 README 功能名。[G4]
- 图 schema 包含 CALLS/EXTENDS/IMPLEMENTS/ACCESSES/METHOD_OVERRIDES，以及路由、注入、消息和 PDG 边。但 **schema 有边类型不等于所有语言都实际产出**。README 的逐语言矩阵中，Go named bindings、C++ imports 等列与 TS 不同。[G1], [G3]
- CFG/PDG 当前应按 **TS/JS 可选能力**评价，不能用其总语言数外推；`pdg_query` 查询控制依赖与 def-use，未启用 PDG 会返回说明。[G1], [G5]
- `analyze --index-only` 可以压制 Agent 文档/skills 等集成写入，适合我们保留自己的方法入口；默认 analyze 会部署部分 skills、上下文文件/集成，不宜不加配置直接嵌入统一插件。[G1], [G6]

### 工作区与新鲜度必须分三个通道

1. **analyze**：相同 HEAD 也检查工作树 dirty，随后按文件 hash 识别实际变化；`git status --porcelain` 会看见未提交/未跟踪文件，工具自写路径被排除。源代码还保留了索引写入中标记与恢复逻辑。[G7], [G8]
2. **watch / status**：watch 监听保存后的文件变化，串行增量；status 比较索引覆盖文件与磁盘内容，区分 current / drifted / unmeasurable，并考虑索引时 dirty 的路径，能表达新增、删除和恢复文件的变化。[G9], [G10]
3. **MCP 结果的通用 staleness**：当前后端调用 `checkStalenessAsync(lastCommit)`，核心检查为 `lastCommit..HEAD`。**没返回 staleness 警告不等于当前 dirty 工作树已入图。** 必须搭配 status 或显式刷新。[G11]

需要试点验证的边界：曾在 dirty 状态建索引，随后还原到相同 HEAD 的干净文件；status 有内容比较，但 analyze 的 `alreadyUpToDate` 快路径仍检查“相同 HEAD + 当前 clean”。应测试普通 analyze 是否正确修复，以及必要时 force 重建的行为。[G7], [G10]

README Roadmap 中旧的 “Incremental Indexing” checkbox 仍未勾选，与当前正文和实现不一致；不能据此判定工具没有增量。[G1], [G7], [G9]

### 对本项目的判断

功能上值得进入同仓库 A/B：检索→符号上下文→影响→改后 diff 调查较连贯。作为开发工具的默认依赖，先处理当前 **Noncommercial** 许可与使用/分发方案；仅因源码公开不能当成 MIT 类依赖。[G2]

## 4. Code-Graph-RAG：深度调查更丰富，运行成本更高

### 已核验的实现与语言边界

- `CallResolver` 实际结合 import mapping、函数 registry、类型推断、接收者解析，并记录 resolution 信息；并非只按名称建 CALLS 边。[C9]
- C/C++ 可以叠加 libclang；C# 可以叠加 Roslyn。配置与源码有这些入口，但没有运行目标项目，不能宣称其解析准确率优于其他候选。[C3], [C7]
- “结构支持”语言层明确只有 Module/Function/Class/IMPORTS，**没有 CALLS 解析**；例如 Ruby/Kotlin/Swift 的该层不可按“支持语言”直接计入调用图覆盖。[C4]
- 数据流有资源→资源、参数传递、返回传播，覆盖因语言、source/sink registry、控制流特性而不同。`flow_verdict` 将结果分 FOUND / NO_FLOW / UNKNOWN；UNKNOWN 表示覆盖缺口。即使工具给 NO_FLOW，也只表示其静态模型中的缺路，不是运行时安全证明。[C5], [C10]
- 可选 Python 动态 tracing 能标记静态边被执行观察到、补充静态漏掉的边并记录 workload 来源；这比纯静态图多一种证据，但只覆盖实际执行路径，本轮没有运行。[C11]

### 持续更新与证据

- 全量更新有 hash cache、mtime 优化、parser fingerprint；源码指纹还纳入语法、编译器和捕获配置，用于提示解析结果可能过期。**版本/配置变化后的提示不等于所有未变化文件自动重解析**，仍应确认重建策略。[C4], [C12]
- `reingest(paths)` 对显式文件和图中一层依赖者重解析，恢复其他入边，并返回重解析/删除/跳过路径；watcher 对 create/modify/delete 事件调用同一路径。读取磁盘文件，不要求先 commit。[C13], [C14]
- 影响展开依赖现有图边；漏边、反射、框架注册关系可能影响增量集合。试点应将增量结果与完整重建结果比较，不能把“一层依赖”理解成业务影响已穷尽。[C13]
- Glosses 注释有 EXACT/STALE/MOVED/AMBIGUOUS/LOST 锚点状态，适合保留局部调查笔记。它不能代替我们 As-Is/ADR 的正文权威和采纳规则。[C6]

### 图引擎与 Docker 的准确边界

当前 `GRAPH_BACKEND` 支持 `memgraph`（默认）与 `neo4j`；配置文件和 `MemgraphIngestor` 内的 driver/dialect 分支都已核验。Neo4j 需要 extra 和自备服务。官方安装说明仍推荐 Docker/Compose 运行 bundled Memgraph 栈，但 **Docker 不是 Python 客户端连接已有图服务的必要机制**；本轮未发现内嵌图后端。[C8], [C15]

因此在本项目中优先作为“需要更深数据流/调用证据时的候选”，不要为普通符号查询立即增加图服务、embedding 和整套编辑 Agent。[C6], [C8]

## 5. 共同试点标准

用同一代表仓库、同一初始工作区、同一目标语言分别测试，记录版本/配置/被忽略文件/解析缺口，不先设置主观总分。

| 样例 | 要核对的结果 |
|---|---|
| 同名函数、别名导入、跨包调用、继承/接口 | 正确目标、错误边、漏边、消歧与来源位置 |
| 回调注册、DI、反射、HTTP/消息边界 | 区分真实解析、模式推断和未覆盖，不将“无结果”当无依赖 |
| 未提交修改、新增未跟踪文件、删除/重命名、修改后还原 | 查询何时更新；status/MCP 是否明确报告旧索引；增量与完整重建是否一致 |
| 修改被多个文件引用的公共接口 | 增量能否更新原本未改文件的关系，测试候选是否遗漏已知回归 |
| 解析器/配置升级、索引中断、忽略规则变化 | 能否发现失效、说明不完整并恢复；不悄悄返回旧结果 |
| Spec/Plan 调查中的 10 个真实问题 | 有用证据比例、误导边、原文复核成本、延迟、磁盘/内存；不使用作者营销准确率代替实测 |

两者都只给知识调查提供证据和候选关系。无论选谁，仍保留当前 Codegraph 基线，并由原始源码/测试验证事实，最终 As-Is/ADR/Spec/Plan 的内容约定由本插件管理。

## 一手来源

[G1]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/README.md
[G2]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/LICENSE
[G3]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus-shared/src/lbug/schema-constants.ts
[G4]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/core/ingestion/pipeline.ts
[G5]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/skills/gitnexus-pdg-query.md
[G6]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/cli/analyze.ts
[G7]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/core/run-analyze.ts
[G8]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/storage/git.ts
[G9]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/cli/analyze-watch.ts
[G10]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/core/index-content-drift.ts
[G11]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/src/mcp/local/local-backend.ts
[G12]: https://github.com/nxpatterns/gitnexus/blob/401fc96c16426cd5c261ae7e54b5a667516fa452/gitnexus/package.json
[C1]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/LICENSE
[C2]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/pyproject.toml
[C3]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/architecture/graph-schema.md
[C4]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/architecture/language-support.md
[C5]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/architecture/data-flow-edges.md
[C6]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/guide/mcp-server.md
[C7]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/getting-started/installation.md
[C8]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/getting-started/configuration.md
[C9]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/codebase_rag/parsers/call_resolver.py
[C10]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/codebase_rag/flow_verdict.py
[C11]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/docs/guide/dynamic-tracing.md
[C12]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/codebase_rag/parser_fingerprint.py
[C13]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/codebase_rag/graph_updater.py
[C14]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/realtime_updater.py
[C15]: https://github.com/vitali87/code-graph-rag/blob/5b47825f1182683f6f7ee7bc284091a2ec35cd1b/codebase_rag/services/graph_service.py
