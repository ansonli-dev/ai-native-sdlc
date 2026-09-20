# Graphify：代码与项目资料关系图的适用性研究

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。对象为 **Graphify-Labs/graphify**。本轮阅读官方文档与固定提交的实现，未安装、运行索引或进行同仓库效果评测。状态：已做部分来源核验的候选，未确定入围或采用。本文记录能力、边界与条件接入成本；持续更新的细节见[维护源码审计](graphify-maintenance-audit.md)。

## 1. 结论

**Graphify 是覆盖“代码、SQL、配置与 ADR/文档关联发现”的候选之一。** 这一能力与 brownfield 调查需求相关；是否优于其他工具或现有调查方式尚无同题依据。它同时与 Codegraph 的结构索引、OpenWiki 的材料组织部分重叠，但两处重叠的深度不同。

- **作为 Codegraph 的替代候选：** 已有代码抽取、关系查询、反向影响及 CLI/MCP 接口；能否替换取决于实际语言、框架解析和增量维护质量。
- **作为 As-Is 调查助手：** 混合资料图可帮助选取源码、文档和决定，减少逐一寻找相关材料的工作；这一用途应独立于代码调用图准确率评估。
- **作为 OpenWiki 的替代：** 当前 Wiki 导出以图社区、节点、关系和来源索引为主；尚不足以据此判断它能承接完整的 Topic 正文、逐条结论与来源变化复核。

目前将上述差异纳入统一候选比较，不据单篇专题决定试点顺序。若后续入围，需同时验证代码关系质量和资料关联的实际收益，并与其他单工具、组合及沿用现状的成本比较。用户提供链接只表示补充调研对象；详细阅读也不构成优先采用依据。[官方能力][G1]、[Wiki 实现][G5]

## 2. 核验基线与运行成本

| 项目 | 当前读取结果 |
| --- | --- |
| 源码 | 默认分支 `v8`，固定提交 `fe66389083369c3159aa391117185c8f58b4d07c`，提交时间 2026-09-12 UTC |
| 包与命令 | Python 包 **`graphifyy`**，命令 `graphify`；源码版本 **0.9.61**。这不是对已发布安装包内容的验证 |
| 本地运行 | Python >=3.10，NetworkX、Tree-sitter 及语言语法包；SQL、MCP、watch、文档转换和模型提供者等有独立 extras |
| 图与模型 | 核心代码结构抽取、图查询不要求向量库或 LLM；文档/图像等语义抽取使用宿主模型或配置的后端。Markdown 标题/链接与 SQL 等也有确定性抽取器，不能笼统说“文档都靠 LLM” |
| 接口与输出 | CLI、Python 模块和可选 MCP；`graphify-out/graph.json`、图报告、HTML，可选 Markdown Wiki |
| 许可 | 当前产品为 **Apache-2.0**；NOTICE 保留历史 MIT 贡献的相应条款，不能因仓库同时出现两个 LICENSE 就写成任意二选一 |

依据：[包配置][G2]、[LICENSE][G11]、[NOTICE][G12]。README 中另有托管平台的 early access 与持续整合代码/文档/会议的方向描述；本评估只采用本地开源实现已核验的能力，不混入托管路线图。[G1]

## 3. 从输入到输出：它实际补了什么

| 输入 | 已找到的机制 | 产出的关系/材料 | 对后续步骤的作用 |
| --- | --- | --- | --- |
| 源代码 | Tree-sitter、语言专项处理、导入/名字/类型线索解析 | 文件、符号、调用、导入、继承等节点和边 | Spec 调查当前实现；Plan 找改动位置与影响候选 |
| SQL 文件 | SQL 语法树及部分方言回退处理 | 表、视图、函数、外键引用、读取关系；未解析名称可保留为 stub | 查数据依赖与迁移背景；不能据此确认数据库真实状态或迁移已执行 |
| Markdown/ADR | 标题、frontmatter、Markdown 链接、引用定义和 wikilink 抽取 | 文件/标题节点、包含关系、引用关系及元数据 | 按链接发现相关决定和原文入口；不自动解释 ADR 的生效或替代规则 |
| 部分代码中的设计原因 | 已核验 Python docstring/NOTE/WHY/HACK，JS/TS rationale 和 ADR/RFC 引用处理 | rationale 内容及与代码/文档的连接 | 帮助回答“为什么这样写”，仍需判断注释是否反映当前实现 |
| 文档、论文、图片等语义材料 | Agent/模型生成概念与关系片段，再合并到图 | 概念、原因属性、显式/推断/不确定关系 | 扩展跨资料发现；模型推断保留为调查线索 |
| 已有图 | 查询、路径、节点解释、反向影响、聚类与导出 | 范围化子图、来源位置、关系标签、报告和 Wiki | 为调查 Agent 提供阅读候选；正文与完成判断仍回到三产物和证据 |

代码与原因依据：[extract.py][G3]、[符号解析][G4]；资料依据：[Markdown][G6]、[SQL][G7]、[语义抽取指令][G8]；查询依据：[serve.py][G9]、[affected.py][G10]。能力是否覆盖特定语言或项目写法仍需测试；“支持语言数”不能代替关系正确性。

一个适合我们的例子：从“修改退款重试规则”找到相关服务、SQL 文件、说明文档和 ADR，再直读原文核实当前重试条件、被采纳的约束及验证入口。图中连起来不表示这些材料一致，更不表示 ADR 已实现。这个例子是拟定用法，不是本轮运行结果。

## 4. 与 Codegraph、OpenWiki 如何区分

| 维度 | Codegraph（用户已有版本） | Graphify | OpenWiki |
| --- | --- | --- | --- |
| 主要产物 | 可查询的代码结构索引 | 代码与多类资料的关系图、图报告及 Wiki 导出 | 解释性知识页、Claims 与来源依据 |
| 调查优势 | 符号、调用、影响及测试候选入口 | 代码结构加文档引用、SQL、设计原因、概念连接 | 将调查结果组织为可复用的主题正文 |
| 证据表达 | 源码位置、结构/启发式关系 | 来源文件/位置、关系标签；语义位置允许为空 | 结论关联文件/行范围、内容版本与失效状态 |
| 持续维护 | watcher、sync、pending/catch-up；部分失败路径可能继续返回旧结果 | 代码结构与语义更新分开；缓存、needs_update、watch、MCP reload 各有边界 | 来源变化检查、逐页维护、未完成与恢复处理 |
| ADR 的位置 | 调查可借助索引，适用原文由流程读取 | 可辅助关联，状态及适用性仍直读 ADR | 可解释知识与决定差异，仍不能用 Wiki 转述替代 ADR |
| 本项目角色 | 现有代码结构提供者及对照基线 | 混合资料图候选，尚未确定入围 | As-Is 知识维护候选，尚未确定采用 |

Codegraph 与 OpenWiki 的具体源码依据分别见[Codegraph 定位](codegraph-as-is-role.md)与[仓库知识研究](../tools/tool-reuse-knowledge.md)。此表是用途和机制比较，不是性能排名。

### 4.1 Graphify 的 Wiki 有什么内容

当前社区文章生成器写入 Key Concepts、Relationships、Source Files、Audit Trail：列出高连接节点、跨社区连接、来源及关系标签统计；还生成索引和高连接节点页面。它确实能输出 Markdown，但该生成器主要是图的可读投影。[G5]

与我们的 Topic As-Is 相比，尚需补业务行为、前置条件、异常路径、数据生命周期、验证入口、未知项，以及具体结论何时需要复核。图社区可能帮助发现主题，但社区 ID/名称不宜直接作为业务主题的长期身份。采用时将 Graphify 报告/Wiki 视为可重建的调查材料，As-Is 正文只维护在项目已映射的知识位置。

### 4.2 关系标签和调用精度要怎样读

- **EXTRACTED** 表示从来源显式抽取；如果来源是 ADR，只能证明文档这样写。语义抽取的标签也由模型按指令填写，不是独立真实性认证。
- **INFERRED / AMBIGUOUS** 分别表示推断或不确定；`confidence_score` 有预设离散评分规则，不能解释为经实测校准的正确概率。
- 语义 schema 允许 `source_location: null`，没有强制每条关系附逐字引文。`validate.py` 主要检查结构、枚举和端点，未验证原文是否支持结论。[G8]、[校验实现][G13]
- 默认代码路线是 AST 加自身解析；仓库中的 `scip_ingest.py` 明确为简化 SCIP 风格 JSON 骨架，未接 CLI，也非完整 SCIP protobuf 实现。不能把它算作已经接通的编译器索引能力。[SCIP 源码][G14]
- `affected` 有按关系反向遍历的实现，保留调用/引用位置。一般概念连接、相似关系与方向明确的依赖是不同含义；图上找到一条路径不能直接写成实际执行链或完整影响范围。[G10]

### 4.3 “自然语言查询”还依赖宿主做什么

CLI/MCP 查询有词项匹配、评分和图遍历；Skill 另外要求 Agent 从图词表扩展用户问题，处理领域词、同义表达和跨语言问题。因此，中文提问与英文标识符的效果应连同宿主一起测，不能只看到 `query "问题"` 入口就认为有独立模型完成全部语义理解。[查询实现][G9]、[查询 Skill][G15]

查询 Skill 还包含保存 Q&A、后续抽取以及反思记录的机制。这可帮助会话恢复，但在本方法中需要保留“生成答案”来源性质：它不能成为与原代码、原 ADR 同级的第二份证明。语义相关、历史回答和真实依赖应可区分。[G15]

## 5. 初始化与持续维护：重点边界

详细函数、路径和固定引用见[维护审计](graphify-maintenance-audit.md)。对采用决策最重要的是：

1. **更新入口不是同义词。** `graphify update` 刷新代码/结构层；`graphify extract` 与 `/graphify --update` 有混合抽取和语义维护流程。代码刷新完成，不能直接声称所有资料图均已更新。
2. **自动监听覆盖不同材料的方式不同。** watch 可自动重建代码；存活非代码文件变化可能只是设置 `needs_update`，等待语义更新。删除、重命名、失败来源与图缩减已有专门处理，但不同入口的行为仍需统一试验。
3. **MCP reload 只解决已生成图的加载。** 文件变化触发重新读取 `graph.json`，不代表检查并重建了当前源码与 ADR。
4. **ADR 元数据需要额外处理。** `cache.file_hash` 对 `.md` 忽略 YAML frontmatter，只 hash 正文与路径；只修改 `status`、`supersedes` 等元数据可能不使抽取缓存失效。完整文件 manifest 仍可检测变化，但缓存命中后是否另行覆盖所需元数据应实测。适用性检查直接读取原文，并对相关元数据变化安排复核。[缓存源码][G16]
5. **Git 集成不能原样成为方法默认。** 内置 hooks 后台写入派生图、报告等，安装时还注册图合并驱动；读取到的 hook 脚本未调用 `git add`。合并驱动使用图 compose，不能据此保证三方删除语义。首轮显式刷新和检查结果，后续再单独接入与项目规则相容的可选 Git 事件适配。

维护审计还标出了未改调用方重新连接、代码文件旧语义层保留等需要同仓库复现的场景；这些是源码推断的待测风险，不能写成已复现缺陷。初始索引仍只纳入仓库允许范围，不默认启用远端资料抓取、实时数据库或跨项目全局图。

## 6. 若后续入围，需要评估哪些适配

本节用于比较接入成本，不表示已经决定集成 Graphify。

| 位置 | Graphify 提供 | 方法/插件需要补的约定 | 产出落点 |
| --- | --- | --- | --- |
| 项目初始化 | 抽取、建图、报告、可选 MCP | 锁定工具及抽取版本，登记仓库根/范围/排除项/实际路径与模型配置；显式执行首轮构建 | 工具配置登记在项目入口；图保留原生 `graphify-out/`，作为派生缓存 |
| As-Is 初始化 | 相关符号、SQL、文档和概念候选 | Agent 阅读原始文件，按 Topic 内容标准形成结论；分清代码事实、文档决定和未知 | 唯一 As-Is 知识位置；采用 OpenWiki 时仍为 `openwiki/` |
| Intent → Spec | 现状调查与相关 ADR 候选 | 先查代码/语义待更新状态，直读适用 ADR 与原始来源；明确当前行为及设计变化 | `spec.md` 的要求、AC、Design 与依据引用 |
| Spec → Plan | 依赖、影响及实施位置候选 | 核验关系方向和推断，读取 Spec 与适用 ADR；为实际任务选择检查 | `plan.md` 的 Tasks、依赖和验证安排 |
| 本地实现后 | 图更新及影响候选 | 分别处理结构和语义变化；检查 ADR 元数据、增量遗漏；按实际影响复核主题 | As-Is 更新；实际检查与局限进入变更 `evidence/` |

适配响应至少保留：仓库/范围、来源路径及可用位置、关系类型/方向、抽取性质、实际已知的更新状态、缺失或截断范围。上游未提供的状态标为未知，不把 `graph.json` 时间包装成整个仓库的已核验时间。

不另造知识库、Task 状态库或 ADR 管理器。原生 Skill 中查询后自动保存答案、优先图查询和 Git 集成等行为需要按本方法改编；CLI/MCP 可以先独立试用，Agent-neutral 流程通过薄适配消费能力。本轮未验证 Graphify 与 OpenWiki 的专用直连。

## 7. 若后续入围，需要哪些实测

先按[统一选型方法](../../docs/tools/existing-tools-reuse-plan.md#11-调研到精选怎样推进)完成跨候选筛选。若 Graphify 入围，与其他入围工具及现有 Codegraph/普通搜索共用同一真实仓库、主题、变更、Agent 和原文读取要求。以下是条件实测用例，尚未安排试点或安装。

| 用例 | 应回答的问题 |
| --- | --- |
| 业务能力 → 实现/SQL/ADR | 相比 Codegraph 加普通文件搜索，是否多找到关键且正确的材料？误连与额外读取成本是多少？ |
| 有引用、无引用、过期三类 ADR | 能否分清显式引用与推断？只改 frontmatter 状态后，流程是否仍读到正确决定？ |
| 同名函数、跨包导入、接口实现 | 代码关系误连/漏连是否足以阻碍替代 Codegraph？哪些边只来自推断？ |
| 未提交修改、新文件、删除和重命名 | 图是否反映实际本地文件？旧节点清除、未修改调用方重连是否正确？ |
| 只更新代码，文档同时变化 | 是否能观察语义更新仍待处理？MCP 是否仅换图就误被 Agent 判断为全部最新？ |
| 抽取失败、中断、图规模缩减 | 失败范围是否可见？恢复后是否保留已删除或陈旧关系？ |
| 用调查结果生成 Spec/Plan | 原文引用、ADR 适用性、设计约束和 Tasks 是否比基线完整；不能仅用图节点数评分 |

分别记录首次构建、代码更新、语义更新、查询、额外原文读取的时间和模型用量，再评价生成产物。上游 benchmark 包含对话记忆任务；代码题样本和执行适配也有特定边界，不能直接推导在本项目全面优于 Codegraph。[官方评测说明][G17]

**比较判据：** 资料关联收益、代码关系质量和总维护成本分别记录，再与其他入围候选比较。满足需求是入选的必要条件，还需说明相对优势及替换/组合的成本。没有明显增益时可不采用。

## 8. 一手来源

以下源码均固定到本次读取提交；其他候选的提交与依据见各自研究笔记。

[G1]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/README.md
[G2]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/pyproject.toml
[G3]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/extract.py
[G4]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/symbol_resolution.py
[G5]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/wiki.py
[G6]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/extractors/markdown.py
[G7]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/extractors/sql.py
[G8]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/skills/agents/references/extraction-spec.md
[G9]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/serve.py
[G10]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/affected.py
[G11]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/LICENSE
[G12]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/NOTICE
[G13]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/validate.py
[G14]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/scip_ingest.py
[G15]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/skills/agents/references/query.md
[G16]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cache.py
[G17]: https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/BENCHMARKS.md
