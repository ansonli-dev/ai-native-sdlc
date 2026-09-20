# AI-native SDLC：当前方案与阅读入口

目标：为既有项目建立可复用的 AI 开发流程，让 Agent 根据项目现状与约束，完成规格、计划、本地实现和验证。

**A1–A3 已完成；下一步 A4。** OpenSpec / Spec Kit 两组已完成文档场景、原生机制调查、较简适配、维护操作及隔离实施比较，并通过独立审查；没有证据支持优先 OpenSpec，详见[补充比较报告](docs/tools/openspec-speckit-comparison.md)。试点仍为 explicit-architecture 的定价币种一致性校验；原项目业务代码保持，隔离实验不等于正式采用。OpenWiki 沿用，codebase-memory-mcp 已排除；Codegraph 无入口时直接核对原文。

**当前实施路线：** 在原版 Superpowers 上比较“项目规则”与“项目规则＋阶段 Hook”，依据质量结果决定是否增加 Hook。[跨机正式验证方案](docs/superpowers/plans/2026-09-17-a4-context-validation.md)和[移交入口](validation/a4-context/README.md)已准备；用户在另一台已安装并登录 Claude 的机器执行。H1 只有部分旧机证据，语义对照尚未运行；插件打包按需要后置，不要求新增 Skill。A3 两组结果保留。

## 1. 已经明确的方向

以下是当前共识的摘要；完整内容由对应主题文档维护。

| 主题 | 当前约定 |
| --- | --- |
| 开发主线 | **Intent → Spec → Plan → 实施 → 验证 → 审查与修正 → 本地交接** |
| 三个准备产物 | BA 负责 Intent 的生成维护与业务确认，AI 可辅助起草；Spec 包含需求、验收条件和 Design；Plan 包含工作清单与验证安排 |
| 需求粒度 | 默认一项清楚的需求沿用一套三产物，按独立设计、验收与交接需要拆分；Feature/Story 为可选外部分类，共同依据引用复用 |
| 记录粒度 | 默认按步骤记录输入、产出、完成判断和未决事项；不要求逐条 AC—Task—测试—运行结果追踪 |
| 当前进度系统 | BA 先生成 Intent，再经 MCP 同步 Colla；Colla 管理整体进度，Plan 保留工程执行细节，见[衔接约定](docs/method/project-documentation-system.md#colla-mapping) |
| 项目知识 | As-Is 记录仓库可验证的现状；工程规范与长期工程决定统一放 ADR。ADR 从 Spec 开始导入；Intent 依据业务来源形成。决定已采纳不等于代码已实现 |
| As-Is 复杂度 | 一个入口、按需知识页，使用前核对、变更后更新；八个方向仅作调查提示，来源与状态优先复用工具，不另建事实管理系统 |
| 工具选择 | [A3 比较与建议](docs/tools/existing-tools-reuse-plan.md#a3-result)保留 OpenSpec / Spec Kit 两组结果；另评估 Superpowers 全流程，知识接入比较项目规则与候选 Hook，正式采用留到 A4；OpenWiki 沿用，codebase-memory-mcp 已排除 |
| 优化前提 | 质量优先，速度与 token 成本优化不得以质量退化为代价；人工可以参与审核，效果与成本按完整工作流程评估，采用条件见[配置回归规则](docs/roadmap/ai-sdlc-plugin-roadmap.md#configuration-evaluation) |
| 实现范围 | 优先复用工具、配置和模板；只为实测暴露的重复问题补代码，可没有自研 runtime |
| 当前终点 | 本地代码、必要文档、验证与审查结果；不要求先提交代码或安装 Git hooks |
| 目标设计范围 | 已补充团队交付与运行反馈的目标设计，保留本地 MVP 边界；当前无生产告警，自动恢复留待后续场景决定，见[九项缺口处理结论](research/method/anthropic-playbook-gap-audit.md#resolved-coverage) |
| 后续扩展 | 基础 BA→Intent 交接已在主线；多项目分发、更多宿主及 BA/QA 专业增强按实际需求推进；当前不绑定具体 Agent |

## 2. 按层级和主题归拢后的目录

这是**本方法仓库的资料组织**。目标业务项目中的“方法、项目知识、变更、证据”四层产物，另见[统一文档体系](docs/method/project-documentation-system.md)。

```text
README.md                         总入口：当前共识、资料地图、下一步
CONTEXT.md                        术语速查
docs/                            方案正文：怎样工作、怎样选择和实施
├── method/                      三产物、执行流程、业务项目的文档体系
├── knowledge/                   As-Is、上下文与 ADR
├── tools/                       工具筛选、实现机制与自研边界
└── roadmap/                     行动路线图、长期阶段与产品化规划
research/                        研究依据：按核验日期理解，按需阅读
├── method/                      SDD、Anthropic、Loop/Graph 的对照
├── tools/                       知识、SDD、宿主、检查工具调查
├── code-intelligence/           Codegraph 同类横评、Graphify 等专题
└── execution/                   执行可靠性、hooks、宿主兼容性
```

## 3. 每个主题到哪里找

| 层级 / 主题 | 主文档及职责 | 何时阅读 |
| --- | --- | --- |
| 入口 / 术语 | [CONTEXT](CONTEXT.md)：Intent、Spec、Plan、Design、Task、ADR 的含义 | 对词义有疑问时 |
| 正文 / 开发方法 | [产物约定](docs/method/sdd-artifact-contracts.md)：每步输入、输出和交接；[执行流程](docs/method/sdd-spec-to-commit-workflow.md)：本地实施、验证、审查，以及后续 MR/发布/运行反馈 | 验证方法或演练真实变更时 |
| 正文 / 文档组织 | [统一文档体系](docs/method/project-documentation-system.md)：目标项目每类产物的落点、归属和生命周期 | 初始化项目或处理文档重复时 |
| 正文 / 项目知识 | [As-Is 指南](docs/knowledge/brownfield-as-is-implementation-and-reuse.md)：现状内容、初始化与维护；[上下文与 ADR](docs/knowledge/sdd-context-and-project-knowledge.md)：每步如何选材料、读原文及演进决定 | 整理项目知识或准备 Spec/Plan 时 |
| 正文 / 工具与实现 | [工具选型](docs/tools/existing-tools-reuse-plan.md)：候选、筛选与复用；[机制分工](docs/tools/sdd-capability-implementation-map.md)：Skill、工具、Agent、hooks 的职责和条件自研项 | **当前重点**：收敛工具与实际工作量 |
| 正文 / Superpowers 接入 | [跨机验证方案](docs/superpowers/plans/2026-09-17-a4-context-validation.md)：两组对照、证据与采用条件；[上下文 Hook 插件设计](docs/tools/project-context-hook-plugin-design.md)：两种调用路径、项目配置、阶段规则、降级与验证；[全流程评估](docs/tools/superpowers-full-workflow-assessment.md)：其他输入输出和执行差异 | **当前重点**：先验证知识接入，再判断完整流程 |
| 执行 / 行动路线图 | [行动路线图](docs/roadmap/action-roadmap.md)：步骤、依赖、完成条件、当前状态与接续记录 | **后续逐步推进的主入口** |
| 规划 / 产品里程碑 | [产品路线图](docs/roadmap/ai-sdlc-plugin-roadmap.md)：试点、复用分发、BA/QA 等阶段的目标和进入条件 | 确定建设范围与后续投入时 |
| 依据 / 外部研究 | [研究资料索引](research/README.md)：按主题定位全部专题；[代码工具横评](research/code-intelligence/codegraph-tools-comparison.md) | 核对某个能力、边界或候选理由时 |

**不必顺读所有长文。** 本页负责定位，正文各自维护详细约定；研究笔记是选型证据，不自动成为当前要求。路线图中的模块、目录和版本是规划选项，不是全部必须实现的待办。

**如何生成 intent.md：** 见 [Intent 生成与 BA 交接](docs/method/sdd-artifact-contracts.md#intent)，覆盖业务部门诉求、BA 分析/方案/原型、材料采用与澄清、成稿及进入 Spec 的条件。

**整项需求或部分范围怎样开发：** 见[范围与复用](docs/method/sdd-artifact-contracts.md#scope)及[默认布局](docs/method/project-documentation-system.md#scope-layout)。先明确本次结果与边界，沿用共享设计，按需拆分；无需先建立 Feature/Story 层级。

## 4. 已有产出与仍待解决的问题

| 已有 | 尚待完成 |
| --- | --- |
| 三产物、步骤交接、文档归属、As-Is/ADR 方法草案 | 用真实变更检查这些约定是否足够简洁、能否支持下一步 |
| A1 案例目录；A2 真实基线；A3 两组三产物、受控场景、维护探针及隔离代码验证/审查 | A4 在实际项目接续、知识刷新、组合回归及正式采用；12 组总体案例不等于均已通过 |
| 实现机制与条件复用方案 | 在选定组合上验证配置能覆盖什么、是否确需补脚本 |
| 产品化和角色扩展路线 | 通过实测后再确定插件范围、支持版本和扩展次序 |
| Playbook 九项缺口的设计处理与分期 | 验证工程授权、配置质量和 MR/Colla 收尾；生产监测与自动恢复按后续进入条件推进 |

OpenWiki 用户试用、A3 三产物衔接及两组隔离实施已有依据；实际项目知识刷新、正式采用及外部连接仍需各自验证。

## 5. 推荐的 next action

**逐步推进统一使用[行动路线图](docs/roadmap/action-roadmap.md)。** 它维护行动总表、每步输入/产出/完成条件，以及换会话后的接续记录；实际进度以该表为准。

**下一步：将[移交材料](validation/a4-context/README.md)和试点项目资料搬到目标机器，按[正式方案](docs/superpowers/plans/2026-09-17-a4-context-validation.md)从环境核验开始。** 复用已移交的 H1 诊断器，补齐真实双入口；再实现最小 B 组注入器并运行同要求 A/B 质量对照。已准备材料不计为目标机实测通过。

后续主线为 **协议核验 → brainstorming 规则/Hook 对照 → 全流程契约 → 计划/审查接入 → 业务闭环与采用**。插件打包为条件步骤，可延后到 A7 的分发与第二项目验证；MR/Colla 按 A5/A6 独立推进。[A3 比较](docs/tools/openspec-speckit-comparison.md)及原执行记录继续作为有效依据。
