# Anthropic AI-native SDLC Playbook：与 SDD 的对照

[总览与下一步](../../README.md) · 研究依据 · 框架原生术语不等于本项目约定 · [研究索引](../README.md)

核验日期：2026-09-15。只使用 Anthropic / Claude 官方发布的资料；客户自述、官方方法建议与内部团队实践分开判断。本文记录外部证据和设计建议，不代替本项目的产物约定。

本文主要对照准备产物与 SDD 术语；当前方案的全生命周期差异、覆盖缺口及优先级见[差异与覆盖审计](anthropic-playbook-gap-audit.md)。

## Playbook 的产物流转

2026-08-21 的 [The AI-Native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook) 正文未使用 SDD / spec-driven 标签。其示例链路为：

| 阶段 | 输入 → 产物及用途 |
| --- | --- |
| Plan | 想法或事件 → `intent.md`：意图、动机、约束 |
| Design | intent 与组织规则 → `spec.md`：需求与设计，供工程规划 |
| Build | intent、spec 与仓库 → `plan.md`：文件、顺序、风险、验证；据此实现 |

示例未另设 `tasks.md`。文中还允许边界明确的小修复直接提交 PR，经过审查。

### 映射到本项目：分析判断

- **Stage Plan 与产物 plan.md 不是同一个概念。** 前者偏向意图形成，后者属于工程实施安排；适配器应区分步骤名和产物名。
- Anthropic 的 `spec.md` 跨越本项目需求层与部分方案层；其 `plan.md` 则覆盖执行安排及进一步的工程决定。Playbook 没有给出完整技术方案 schema，不能假定其中 Design 与本项目的技术 Design 完全等价。
- 本项目准备阶段固定 Intent、Spec、Plan 三个步骤与三个产物；Spec 含需求与方案，Plan 组织 Tasks 与实施安排。外部适配识别内容职责和引用，保留不同框架的布局。
- 在宽泛的“明确规格来指导实现与验证”意义上，它与 SDD 有重叠。这是方法比较，不代表 Anthropic 自称采用某个 SDD 框架。

## 其他官方证据

### 补充核验：Intent 的责任与需求粒度

2026-09-15 复核 Playbook 的 Plan 章节：发起者与 Claude 讨论，Claude 按模板写 Intent，发起者纠正误解；Product Owner 接纳后进入 Design。该链路将用户故事、估点和多次交接列在传统流程对照中，AI-native 示例直接形成 Intent，未要求固定 Feature → Story 层级。这里的角色原文是发起者和 Product Owner，并未指定必须由 BA 执笔。[Playbook 原文](https://claude.com/blog/the-ai-native-sdlc-playbook)

作为另一项边界核验，2020 Scrum Guide 的 Product Backlog 章节以待办项及其持续细化表达范围拆分，未规定必须采用 Feature/Story 两级。它仍强调工作细化、可完成的范围和可用增量。[Scrum Guide](https://scrumguides.org/scrum-guide.html#product-backlog)

对本项目的建议：按用户现有分工，由 BA 负责 Intent 的生成维护与业务表述确认，决策权沿用实际授权；Feature/Story 保留为可选外部分类。保留按结果、风险和验证能力拆分范围的能力，具体约定由[产物约定](../../docs/method/sdd-artifact-contracts.md#scope)维护。此为本项目选择，不宣称所有 AI-native 团队采用同一做法。

### 1. 官方页面出现过 spec-driven 用语

- 官方 Code w/ Claude 2026 活动介绍 Mercari 的 **Agent-Spec Driven Development（ASDD）**。这是客户讲者的实践，不能据此判断 Anthropic 自身采用同名框架。[Mercari 活动页](https://claude.com/code-with-claude/session/tyo-mercari-human-on-the-loop)
- 官方客户采访中，Quantium 受访者称其开发生命周期已转向 **spec-driven**。这证明官方渠道并未避开这个说法，仍然不构成 Anthropic 内部统一方法的证据。[Quantium 采访](https://claude.com/customers/quantium-qa)

### 2. 官方操作建议支持书面规格，但规格边界更宽

Claude Code 最佳实践建议较大功能先访谈并生成 `SPEC.md`，其中可以涉及技术实现、UI/UX、边界与取舍；有效规格要说明文件、接口、范围外事项和端到端验证。它还建议先探索、再规划、实现及提交，并允许明确的小变更跳过规划。这支持本项目把 Spec 定义为包含需求与方案的变更规格。[Claude Code 最佳实践](https://code.claude.com/docs/en/best-practices)

### 3. 内部团队公开描述强调及时规划和原型反馈

Claude Code / Cowork 工程负责人 Fiona Fung 在 2026-06-03 的文章中描述 Claude Code 团队：采用及时规划，规划从设计文档转向 PR 讨论和原型，通过内部使用收集反馈；各小组可调整自身规划方式。证据范围是文中团队，不能外推为公司所有项目。[Running an AI-native engineering org](https://claude.com/blog/running-an-ai-native-engineering-org)

### 4. 内部安全流程仍然使用设计材料和组织上下文

2026-07-21 的内部 SDLC 安全文章说明：规划周期被压缩，原型与内部使用占重要位置；项目安全审查会使用设计文档，并接入组织政策、历史决定和相关系统的知识索引。作者强调让安全 Agent 获取已有上下文，不在已无必要的阶段强制补齐详细文档。这支持按风险与信息需要选择产物深度。[How Anthropic secures its AI-native software development lifecycle](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)

### 5. Playbook 的适用范围需要保留

官方课程将 Playbook 定位为面向大型企业、尤其受监管企业的转型指南；其做法来自 Applied AI 团队服务客户的经验。它是推荐的组织改造路径，不能整体视为 Anthropic 每个团队已经执行的强制流程。[课程说明](https://academy.claude.com/courses/ai-native-sdlc-playbook)

## 未知与结论边界

- 本轮在 `anthropic.com`、`claude.com`、`code.claude.com` 检索 `SDD`、`spec-driven development`、`spec-driven`、`specification-driven`；未找到 Anthropic 宣布全公司统一采用某个 SDD 框架的证据。搜索范围有限，“未找到”不等于“不存在”或“从不用”。
- 可以确认其建议包含书面意图、规格、实施计划和验证；不能把这些共同实践直接归类为某一个框架，也不能推断内部始终使用固定的 Spec → Design → Tasks 文件序列。
- 对本项目的启示（分析判断）：保持需求、方案、执行工作的职责清晰，同时让文档深度、承载文件与交接节奏适应变更复杂度；外部适配按内容映射，不按 `spec` 或 `plan` 名称硬套。

## 本次对齐决定与后续建议

1. 用 AI-native SDLC 组织整体能力，开发主线采用 Intent → Spec → Plan → 实施与验证。默认形成 intent.md、spec.md、plan.md；原始描述与 Issue 作为 Intent 的来源引用。
2. 三份产物分别明确目标与边界、需求与方案、工作与验证安排。其输入、必要内容、交接判据与模板在产物约定中集中维护。
3. 本产品的小变更保留三步和三份简短产物；必要探索作为 Spec 内的可行性调查。上文保留的 Anthropic 与 Superpowers 简化路径是外部事实，不作为本套件省略主产物的规则。
4. As-Is 保持仓库证据基线；目标规格不直接回写为现状。BA 可补充意图和需求，QA 可补充验证能力，复用同一套来源与覆盖关系。

对齐采用双方的共同产物思路。Superpowers 的完整规划路径先形成设计/spec，再生成包含任务的 implementation plan；其具体审核、TDD 和任务步骤规则不自动成为本套件默认约定。[Brainstorming](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md)、[Writing Plans](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/writing-plans/SKILL.md)。

相关约定：[本项目产物输入输出](../../docs/method/sdd-artifact-contracts.md)；其他框架证据：[Spec 与 Design 交叉核验](sdd-spec-design-crosscheck.md)。
