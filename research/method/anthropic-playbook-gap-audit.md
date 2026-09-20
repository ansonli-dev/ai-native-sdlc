# 现有方案与 Anthropic AI-native SDLC Playbook：差异与覆盖审计

[总览与下一步](../../README.md) · [研究索引](../README.md)

核验日期：2026-09-15。原文：[The AI-Native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)，页面日期 2026-08-21，作者 Louis Claxton。以下区分原文事实、本项目选择和分析建议。

**阅读时点：** 第 1～6 节保留 2026-09-15 初次审计的发现；2026-09-16 已按用户澄清补充方法正文。当前处理状态见[第 8 节](#resolved-coverage)，不要把历史缺口描述当作更新后的覆盖结论。全部“已补充”均指设计，尚无本项目集成或效果实测。

## 1. 结论与范围

**现有方案对准备产物和本地开发闭环已有较完整的方法设计；主要距离在组织治理、共享交付和运行反馈。** 三产物分工没有发现根本冲突，当前方案尚未覆盖完整生命周期。

“现有方案”指本仓库 README、CONTEXT 及 docs 下的方法、文档体系、知识、工具和路线图。研究笔记只作背景，不将相邻项目或候选工具的能力计为已覆盖。下文“覆盖”指设计约定；[总览](../../README.md#4-已有产出与仍待解决的问题)明确尚无工具集成和效果实测结果。

| 对照阶段 | 当前设计依据 | 判断 |
| --- | --- | --- |
| Plan | [Intent](../../docs/method/sdd-artifact-contracts.md#intent) | 基本覆盖；发起角色、小变更路径有主动取舍 |
| Design | [Spec](../../docs/method/sdd-artifact-contracts.md#spec)、[ADR 导入](../../docs/knowledge/sdd-context-and-project-knowledge.md#stage-inputs) | 需求、验收和方案已有；接受责任、组织规则执行待补 |
| Build | [Plan](../../docs/method/sdd-artifact-contracts.md#plan)、[实施闭环](../../docs/method/sdd-spec-to-commit-workflow.md#post-plan) | 本地设计较完整；共享版本、动作权限和自动接续不完整 |
| Test | [变更验证](../../docs/method/sdd-spec-to-commit-workflow.md#local-verification)、[路线图第 10 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md) | 业务验证和方法回归有基础；配置回归准入约定未闭合 |
| Deploy | [本地审查](../../docs/method/sdd-spec-to-commit-workflow.md#local-review)、执行流程第 9 节 | 只覆盖局部前置工作；远端 PR、发布和回滚是范围缺口 |
| Maintain | [知识回写](../../docs/method/sdd-spec-to-commit-workflow.md#local-handoff)、[As-Is 维护](../../docs/knowledge/brownfield-as-is-implementation-and-reuse.md) | 项目知识维护已有；运行监测、事故处置和持续扫描未形成流程 |

对照基准为原文六阶段及其治理、度量与前置依赖。[Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)

## 2. 三处明确不同的选择

差异不自动代表现有方案错误；需要说明适用范围，并在试点中观察代价。

| 编号 | 差异 | 现有方案依据 | 分析判断 |
| --- | --- | --- | --- |
| D1 | BA 主维护；原文采用发起者与产品负责人 | [Intent 第 2.1 节](../../docs/method/sdd-artifact-contracts.md#intent) | 保留组织分工合理。观察 BA 是否成为单一排队入口；推广时再评估发起者直接起草、BA 按授权核对的路径。不把 BA 必经写成普遍要求。 |
| D2 | 独立小变更固定三份产物；原文有小修复直接进 PR 的路径 | [产物约定第 1 节](../../docs/method/sdd-artifact-contracts.md)、[原对照的主动选择](anthropic-playbook-sdd-comparison.md) | 这是明确的产品选择。测量小修复的文档和交接耗时，再判断是否需要快速路径；不因本次对照直接取消现有规则。 |
| D3 | 本地完成不要求提交；原文以已提交产物衔接 | [本地交接](../../docs/method/sdd-spec-to-commit-workflow.md#local-handoff)、执行流程第 9 节 | 工作区证据证明本地结果，但不是团队可共同读取的版本记录。保留“本地完成”，后续明确“可共享交接”的版本和证据条件。 |

原文定位：Capture as intent.md、Plays、Claude on call with Claude Tag。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

## 3. 九项未覆盖或覆盖不足

优先级为本次建议：A＝本地试点先明确；B＝扩展团队自动交付前补齐；C＝全生命周期扩展。不是已采纳的新要求。

### G1. Spec / Plan 的接受责任与质量判定未明确分开〔A，部分覆盖〕

**现有：** Intent 明确确认人、版本和范围；Spec/Plan 主要判断内容与证据是否足够，通用地引用已有授权。[产物约定第 2.1、3.5、4.5 节](../../docs/method/sdd-artifact-contracts.md)

**不足：** 模板尚未清楚交代谁有权接受这版规格或计划、授权覆盖什么、何种变化使接受依据失效。

**建议：** 在现有交接栏引用接受依据、版本/范围和超出范围的处理人。Agent 判断内容充分与有权人接受方案分别表达；已有确认复用，不增加每阶段必签一次的审批。原文详细 PR 流程仍保留人工批准，不能只据总览推断普通 PR 免人工批准。参见 Requirements and design、Plan mode、PR review。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G2. 动作权限与验证保护缺少可验证的执行约定〔A/B，部分覆盖〕

**现有：** [机制分工第 5、6 节](../../docs/tools/sdd-capability-implementation-map.md#agents)区分 Skill 与强制权限、Git hooks 与 Agent 生命周期 hooks；[Task 闭环](../../docs/method/sdd-spec-to-commit-workflow.md#post-plan)禁止降低验收标准。

**不足：** 尚未定义宿主必须满足的动作限制、不支持时的运行边界。显式调用检查不证明受保护动作执行前一定被拦截；缺陷复现检查的保护范围和更正责任也未明确。

**建议：** 选定宿主时列出实际限制、执行机制和阻断演练，复用权限、沙箱及 CI。缺陷修复记录复现检查的有效版本，测试更改有独立复核依据；功能开发新增测试不受这一保护范围限制。参见 Hooks as build-time guardrails、Give Claude a feedback loop、Hooks as approval gates。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G3. 组织规则的应用与持续改进机制不完整〔A/B，部分覆盖〕

**现有：** [ADR 方案](../../docs/knowledge/sdd-context-and-project-knowledge.md#organization)已有权威正文、版本、范围、例外和演进，简短宿主指引可导向入口；不需要另建政策库。

**不足：** 从组织政策到 Skill/检查配置，尚缺维护责任、触发验证、采用版本和漂移处理。审查发现如何推动 Agent 指引、回归案例改进，也未形成具体动作。

**建议：** 在既有引用中关联执行配置与维护者，用一条反复出错的真实规则验证应用和更新效果；无需把所有 ADR 改写成 Skill。参见 The CLAUDE.md、Skills as institutional knowledge、AI in the PR review loop。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G4. Agent 配置回归已有案例设计，尚未形成准入机制〔A/B，部分覆盖〕

**现有：** [路线图第 10 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)列出 12 类产品回归场景；[工具选型](../../docs/tools/existing-tools-reuse-plan.md)已有真实仓库样例、确定性断言和 promptfoo 候选。“没有 eval”不成立。

**不足：** 未定义哪些模型、提示、Skill、hook 或宿主配置变化运行哪组案例，如何固定比较条件、何种退化阻止采用，以及真实失败如何进入案例库。

**建议：** 从首轮案例建立可重复基线和配置采用条件；接入 CI 前可手动或离线定期执行。业务代码测试与开发 Agent 的行为回归应区分；基础验证不必等到 M3 QA 扩展。参见 Continuous evals in CI。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G5. 远端 PR 到发布、回滚尚未形成流程〔B，范围缺口〕

**现有：** 本地审查有发现处理和复查，delivery.md 可记录交付；PR/CI 在[路线图 M5](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)列为按需连接，M1 明确止于本地。

**不足：** 缺远端意见与失败 checks 的接续、合并条件、环境权限、发布授权、发布后验证和回滚演练的完整输入输出。记录 PR/制品链接不等于覆盖交付过程。

**建议：** 后续选择既有项目的一条 PR→CI→目标环境流程，明确对象、条件和责任。插件自身发布验收不能代替业务系统发布验收。参见 AI in the PR review loop、CI/CD integration and deployment。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G6. 运行维护尚未闭合，As-Is 更新不能代表已覆盖〔C，范围缺口〕

**现有：** Intent 接受缺陷或事件材料，As-Is 回写仓库事实，已具备部分输入基础。[Intent](../../docs/method/sdd-artifact-contracts.md#intent)、[As-Is 指南](../../docs/knowledge/brownfield-as-is-implementation-and-reuse.md)

**不足：** 尚无运行信号、异常判断、诊断处置边界、值班分流、恢复确认及复盘的流程；定期安全扫描的范围、时效、发现处置和误报复用也未定义。

**建议：** 作为独立后续能力，从一个已有监测信号或事件来源试点，明确调查记录、Intent、实际处置和回归案例的衔接。复用监控与工单系统，不规定某种阈值算法或供应商产品。参见 Maintenance and closing the loop、Recurring codebase scans、Claude on call with Claude Tag。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G7. 已有会话内路由，外部事件接续约定仍缺失〔B，部分覆盖〕

**现有：** [闭环与阶段路由](../../docs/method/sdd-spec-to-commit-workflow.md#loops-and-routing)有输入版本、下一动作、受阻、停止和恢复；[路线图第 4.2 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)将事件调度列为可选入口。

**不足：** 未定义外部事件启动哪个阶段、读取哪个已接受修订、事件重送如何识别已做工作、失败如何交接。

**建议：** 若团队交接成为瓶颈，先补一个事件映射及去重/恢复案例；只让满足接受条件的版本触发下游，接现有 CI 或宿主即可。参见 Plays、Requirements and design、Maintenance and closing the loop。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G8. 已有成本指标，尚不足以定位整体瓶颈〔A/B，部分覆盖〕

**现有：** [路线图第 4.2、10.3 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)已有完成率、错误完成、返工、人工介入、耗时和成本；[实测安排](../../docs/tools/existing-tools-reuse-plan.md)记录遗漏和维护成本，不能说没有度量。

**不足：** 缺阶段等待与处理时间的统一口径、采集来源和负责人，尚不足以判断本地提速是否把排队推给 BA、审查或发布。源码/环境证据较充分，生成配置及关键权限判定的记录仍不完整。

**建议：** 首轮增加每步进入/交接时间、等待原因、人工处理时间和配置引用，以最慢交接决定下一项投入；团队化后复用 PR/CI/运行数据，不另建统一运行台账。参见各节 How to measure it 及治理记录说明。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

### G9. 外部系统的权威记录与写回约定不充分〔B，部分覆盖〕

**现有：** [文档体系第 5、6 节](../../docs/method/project-documentation-system.md#authority)要求一项内容维护一处，允许映射既有框架、CI 和交付系统，BA 原型可保留原位。

**不足：** 外部工单、需求工具或变更系统持有正式记录时，尚缺工作副本的权威范围、外部修订、写回责任、双向关联和同步失败处理。

**建议：** 接入真实系统时，在现有映射中补权威方、外部 ID/修订、可写位置、回写及冲突处理。仓库作为唯一权威同样成立，无需强行增加第二套记录。参见 Legacy systems and the source of truth。[来源](https://claude.com/blog/the-ai-native-sdlc-playbook)

## 4. 不应误报为缺失的内容

- **三产物内容分工已经对齐。** 阶段 Plan 与工程产物 plan.md 需区分；未独立设置 tasks.md 不表示不拆任务。[原文 Plan / Design / Build](https://claude.com/blog/the-ai-native-sdlc-playbook)
- **本地反馈循环已有。** Task 检查、组合验证、独立审查、修正、停止和恢复均有约定；G7 指外部事件后的接续。
- **测试和方法评估已有。** G4 是配置回归的采用机制，不应简单改成把整个 QA 扩展提前。
- **ADR、As-Is 和简短宿主指引可以保留。** 主要问题是应用、维护和执行证据，而非文件名。
- **并行已列入后续设计。** 先串行、再验证独立审查及汇合收益，是实施节奏，不是能力遗漏。[路线图第 4.2 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)
- **工具中立、步骤级证据和复用优先可以保留。** 原文支持分步采纳，没有依据要求改用特定宿主、自研运行时或逐项追踪数据库。[Playbook 的 Plays 与 Prerequisites](https://claude.com/blog/the-ai-native-sdlc-playbook)

## 5. 建议处理顺序

1. **明确主动取舍，补最少的责任和证据约定。** 对应 D1–D3、G1、G2 的本地边界，避免新增重复文档和审批。
2. **用真实案例同时判断质量和耗时。** 对应 G3、G4、G8；工具筛选继续，但以遗漏、返工、等待和维护成本决定投入。
3. **团队化时补共享交付。** 对应 G5、G7、G9，先走通一条真实 PR/CI 及外部记录链，再扩大自动化。
4. **将运行维护显式列为后续范围。** 对应 G6。现有 M0–M5 按开发、角色增强和分发组织，尚无运行维护的完整验收里程碑；若目标保持全生命周期，需要单独安排。

2026-09-15 本轮仅形成审计，未修改方法正文、工具采用结论和路线图。后续澄清及采纳状态见第 7 节；上述发现保留审计时点的含义。

## 6. 旧笔记与来源复核

[既有 Playbook 对照](anthropic-playbook-sdd-comparison.md)的三产物映射、小变更和 BA 分工归因成立，主要覆盖准备阶段；[Loop / Graph 笔记](loop-and-graph-engineering.md)覆盖局部闭环和协作。两者都不能证明生产运行闭环已覆盖。本轮未重新核验旧笔记引用的其他文章。

以下是原文 2026-09-15 文本提取的定位，页面变化后以章节名为准：

| 用途 | 原文章节与位置 |
| --- | --- |
| D1–D3 与准备阶段 | Plays、Plan、Design、Build：L238–403；小修复：L1000 |
| G1 接受与责任 | L338、L403、L415、L737、L763、L875、L908 |
| G2 动作与测试保护 | L534–545、L617–635、L775–846；测试保护针对修复任务 |
| G3 规则应用 | L430–545、L734–741 |
| G4 配置回归 | L656–713；L661 保留离线定期执行选择 |
| G5 共享交付 | L719–899 |
| G6 运行维护 | L904–1003 |
| G7 事件接续 | L238–240、L333–338、L904–930 |
| G8 度量与记录 | 各节 How to measure it / Governance considerations |
| G9 外部权威 | L419–429 |

一手来源：[The AI-Native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)。本报告没有实测网页示例配置，不将其直接视为执行保证。

<a id="clarification"></a>

## 7. 2026-09-16 起的澄清与采纳记录

按用户指定的 grill-with-docs 方法分轮澄清。这里只记录问题状态及权威文档位置；方法结论回写现有正文，术语明确后更新 CONTEXT，不复制另一套方案。

| 问题 | 已确认结论 | 正文位置 / 后续状态 |
| --- | --- | --- |
| Q1：本轮补齐范围 | 补齐全生命周期目标设计，保留本地 MVP 边界；分清当前必需、团队化前必需和后续扩展 | 已写入路线图第 1、7.5–7.7 节；九项处理结果见第 8 节 |
| Q2：无项目既有约定时的关键技术决定接受责任 | 本次工程负责人承担，可以由实施开发者兼任，可在自身权限内明确委托开发者或 Agent；已有授权内继续 | 已写入产物约定的工程接受责任、Spec/Plan 交接和模板，以及 CONTEXT；执行控制按 Q4 落位 |
| Q3：仓库与外部系统的默认权威模式 | 默认仓库权威，允许按产物映射外部权威；冲突按权威修订复核，外部写回沿用已有授权 | 已写入文档体系第 5.1 节及 CONTEXT；后续事件接续采用同一映射 |
| Q4：必要执行限制不足时怎样继续 | 按受影响动作降级；能用可核验的隔离/权限满足要求则继续，否则转为只读分析或建议；其他条件具备的已授权工作继续 | 已写入实现机制分工第 5.1 节；测试更正按 Q9 落位 |
| Q5：团队交付的默认自主范围 | 授权内自主推进到 PR 就绪，合并保留代码负责人批准，生产发布保留发布负责人授权；开发/测试可预授权 | 已写入执行流程第 9.3–9.4 节和路线图第 7.5 节；生产事故自动恢复权限仍待后续澄清 |
| Q6：开发工具配置升级的采用规则 | 质量是一切速度与 token 成本优化的前提；人工可以参与审核，不能用效率收益抵消质量退化 | 已写入路线图第 10.3–10.4 节，并同步工具选型、执行流程与总览；G4/G8 按完整工作流程比较 |
| Q7：生产故障的预授权恢复 | 用户明确目前生产环境没有告警，也没有生产自动处置方案 | 已记录到路线图第 7.6 节；自动恢复权限尚未决定，后续具备实际运行场景时再明确，不计为已覆盖或已授权 |
| Q8：外部事件后的自动接续 | Colla 管理整体进度，BA 先生成 Intent 再经 MCP 同步；MR 实际合并后触发收尾，全部范围及必要验收满足后关闭，Intent 保留正文，无遗留工作的已合并源分支才清理，写回失败保留待同步 | 已写入文档体系第 5.2 节、执行流程第 9.5 节、实现机制分工第 6.1 节与词表；其他事件入口不自动获得执行授权 |
| Q9：缺陷复现测试的合法更正 | 允许引用需求依据，经工程负责人或其授权的独立复核者确认后更正错误测试并重跑；有效测试失败时修代码，需求变化回 BA/Spec | 已写入执行流程第 5.2 节的测试保护与更正，以及实现机制分工第 5.1 节；普通开发新增测试不额外审批 |

本轮按工程接受权限、权威记录与效果判据 → 动作控制、规则/配置回归与交付 → 实际事件接续与分期验收的依赖顺序澄清。Q7 的生产自动恢复未作授权决定，已明确后置条件；其余本轮设计问题已获用户确认。已有 BA 职责、三产物、小变更规则、步骤级记录和复用优先继续作为现有依据。

依据既有约束完成的文档细化：G3 的来源—执行配置—验证—反馈关系已补入实现机制分工第 3.1 节；G8 的步骤历时、等待、人工投入和返工口径已补入路线图第 10.3 节。它们沿用现有责任和证据位置；Q6 已明确配置采用以质量为前提。

<a id="resolved-coverage"></a>

## 8. 澄清后的设计覆盖与剩余边界

本轮已将九项缺口逐项落到方法正文或明确的后续进入条件，未新增插件实现、平台 hook 或生产操作。D1–D3 保留原产品选择：BA 维护 Intent、小变更仍用三份简短产物、本地完成不要求提交。

| 缺口 | 设计处理与权威位置 | 当前边界 / 实测要求 |
| --- | --- | --- |
| G1 接受责任 | [工程接受责任](../../docs/method/sdd-artifact-contracts.md#acceptance)：负责人、委托、有效版本与范围，复用已有授权 | 在真实交接中核对，普通细化不新增每阶段签字 |
| G2 动作与测试保护 | [动作限制及降级](../../docs/tools/sdd-capability-implementation-map.md#action-controls)、[复现检查更正](../../docs/method/sdd-spec-to-commit-workflow.md#reproduction-test-correction) | 选定宿主后验证实际阻断；允许错误测试有依据地更正，不能把 Skill 文字当强制保证 |
| G3 组织规则应用 | [规则进入执行与反馈](../../docs/tools/sdd-capability-implementation-map.md#policy-application)：来源、维护责任、触发验证、变化与反馈 | 首轮手动读取/检查即可；重复需要经实测后再固化配置 |
| G4 配置回归准入 | [Agent 配置回归与采用](../../docs/roadmap/ai-sdlc-plugin-roadmap.md#configuration-evaluation)：变化范围、基线、真实案例、人工参与及退回 | 质量满足要求且无已知退化后才比较速度/token；仍需建立实际基线，未宣称候选已通过 |
| G5 共享交付与发布 | [MR/PR、发布及收尾](../../docs/method/sdd-spec-to-commit-workflow.md#team-delivery)：就绪、批准、合并、环境授权、验证与恢复 | 团队接入前验证一条完整交付链；本地 MVP 范围不变 |
| G6 运行维护 | [问题到修复与复盘](../../docs/method/sdd-spec-to-commit-workflow.md#operations-feedback)、[扩展进入条件](../../docs/roadmap/ai-sdlc-plugin-roadmap.md#operations-extension)：分流、调查、处置、恢复、扫描与回写 | 当前无生产告警/自动处置；告警建设与自动恢复保留后续决定，不能标成能力已覆盖或授权已具备 |
| G7 外部事件接续 | [实际 MR 合并后的收尾](../../docs/method/sdd-spec-to-commit-workflow.md#mr-closeout)：版本/范围核对、重复/并发、部分失败与恢复 | 首个具体场景为 MR→Intent/Colla/分支收尾；其他阶段的外部自动启动按实际需求后置 |
| G8 质量与整体瓶颈 | [路线图第 10.3 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md#103-衡量产品价值)：质量前提、步骤历时、等待、人工投入与返工 | 人工可参与；按完整流程比较，未知不计零，当前没有收益实测 |
| G9 外部权威与写回 | [权威映射](../../docs/method/project-documentation-system.md#external-authority)、[Colla 衔接](../../docs/method/project-documentation-system.md#colla-mapping)：默认仓库正文、Colla 整体进度、MCP 同步与冲突处理 | 具体事项/字段/修订/权限须在接入时核验；未承诺 Colla 双向正文编辑或某个接口能力 |

分期与验收集中见[产品路线图第 7.7 节](../../docs/roadmap/ai-sdlc-plugin-roadmap.md#77-本轮补充约定的分期)。这些是设计结论；后续实施仍需工具筛选、真实项目试点与相应授权。逐步行动和当前进度统一由[行动路线图](../../docs/roadmap/action-roadmap.md)维护，本报告保留设计审计与处理依据。
