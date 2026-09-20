# Spec 与 Design 的交叉核验：Spec Kit、OpenSpec、Superpowers 与 Kiro

[总览与下一步](../../README.md) · 研究依据 · 框架原生术语不等于本项目约定 · [研究索引](../README.md)

核验日期：2026-09-15。范围：Spec Kit、OpenSpec、Superpowers 官方仓库的默认流程、实际 schema、模板和 skill；补充 Kiro 官方产品文档作为对照。核验采用文档与源码阅读，未安装或运行框架。本项目的术语约定与各框架原生定义分别表述。

## 结论

**Spec 没有跨框架统一的内容边界。本项目准备阶段采用 Intent、Spec、Plan 三份产物；Spec 含需求与方案，Plan 组织 Tasks。** Spec Kit 和 OpenSpec 直接支持需求规格与技术方案的职责区分；Kiro 将二者分为 requirements/design 文件，同时用 spec 统称整套材料；Superpowers 的 spec/design 文档同时承载要求和技术设计。不能把“spec 必定只指需求”作为框架通用词义。

本项目将关键 Design 放入 Spec，Plan 引用 Spec 并组织实施工作。Spec Kit 的 plan 主要承载技术规划；OpenSpec 默认没有名为 Plan 的独立产物；Superpowers 的 implementation plan 读取先前的 spec/design 文档并展开执行任务。

## Spec Kit

基线：`github/spec-kit`，核验时 `main` 为 `fd490fac952cc6baeb421905b28031b4c5fe8a99`，通过 `git ls-remote` 确认。[固定版本](https://github.com/github/spec-kit/tree/fd490fac952cc6baeb421905b28031b4c5fe8a99)

`specify` 命令明确要求面向用户需要与动机，避免实现方式；Spec 模板包括用户场景、验收场景、功能要求、关键领域实体、可衡量结果及假设。这支持将其 `spec.md` 理解为经过规格化的需求。[Specify 指引](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/specify.md)、[Spec 模板](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/spec-template.md)

`plan.md` 的输入是 feature spec，内容包括技术上下文、规范检查、项目结构和结构选择，并组织研究、数据模型、接口契约及验证附件；`tasks.md` 由后续 Tasks 命令产生。技术方案在此主要名为 Plan，不能据此要求所有方案文件都叫 design.md。[Plan 模板](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/plan-template.md)

Tasks 命令同时读取 `spec.md` 和 `plan.md`，从需求提取用户故事，从方案提取技术栈与结构，再形成依赖与执行工作。这也支持本项目让 Tasks 直接消费需求与方案两类内容的约定。[Tasks 命令](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/tasks.md)

## OpenSpec

基线：`Fission-AI/OpenSpec`，commit `9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461`，提交时间 2026-09-09 20:59:22 UTC。[固定版本](https://github.com/Fission-AI/OpenSpec/tree/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461)

| 原生概念 | 内容和用途 |
|---|---|
| Proposal | 变更动机、变化范围、新增或修改的能力及影响；为后续规格和方案建立范围依据。 |
| Specs | 可观察行为、输入输出、错误条件、外部约束，以及可验证场景；约束系统应当做什么。 |
| Design | 实现方法和技术选择依据，包括上下文、设计边界、决策、风险及适用时的迁移安排。 |
| Tasks | 实施检查清单；按依赖组织小任务，每项说明如何验证完成。 |

以上是当前默认 [schema](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/schema.yaml) 的职责划分。可直接对照的短引文：

> A spec is a behavior contract, not an implementation plan.

> Create the design document that explains HOW to implement the change.

实际模板也对应这些职责：[proposal](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/proposal.md)、[spec](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/spec.md)、[design](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/design.md)、[tasks](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/tasks.md)。

### 两个需要保留的区别

1. **主规格和变更规格的生命周期不同。** `openspec/specs/` 是长期维护的当前行为契约；`changes/<change>/specs/` 描述对它的新增、修改、移除等差异，归档时合入主规格。主规格属于规范性文档；其声称的行为是否已被代码实现、是否通过验证，仍需仓库证据核验。因此不能把它自动等同于本项目的已验证 As-Is。[概念说明](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs/concepts.md)
2. **内容职责不等于严格线性生成顺序。** 默认 schema 中 specs 和 design 都依赖 proposal，tasks 才同时依赖 specs、design。不能把它描述成工具强制执行的 `specs → design` 单线流程。默认文档也允许按实际工作调整产物顺序。[依赖定义](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/schema.yaml)

本项目 Spec 的背景和范围，在 OpenSpec 中部分分散于 proposal；其完整需求与方案输入需要读取 proposal、相关 specs 和 design，不能只按文件同名直接替换。

## Superpowers

基线：`obra/superpowers`，commit `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`，提交时间 2026-08-12 16:53:21 UTC。[固定版本](https://github.com/obra/superpowers/tree/b36e0829c6d0140e93cfef2ca599b1b07d4a7797)

| 原生概念 | 内容和用途 |
|---|---|
| Design / Spec | Architectural 路径经上下文调查、澄清、方案比较后形成的设计文档；保存于 `docs/superpowers/specs/*-design.md`，兼有需求、约束与架构设计。 |
| Implementation Plan | 读取 spec/design 文档，明确文件分工，生成包含具体任务的实施计划。 |
| Task / Step | Task 以可独立测试的产出为边界；其中 Step 是写测试、执行测试、实现等更细操作。 |

[Brainstorming skill](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md) 明确使用以下表达：

> Write the validated design (spec)

设计覆盖范围直接列出：

> architecture, components, data flow, error handling, testing

由此可见，Superpowers 的 spec 不能直接翻译为纯需求规格。[Writing-plans skill](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/writing-plans/SKILL.md) 的计划头部要求引用：

> path to the spec/design doc this plan implements

计划随后写入目标、架构摘要、技术栈、全局约束，以及带真实文件、接口输入输出、测试和操作步骤的 Tasks。计划还需逐项检查对 spec 要求的覆盖。

**适用范围：** 上述有正式 spec 和 plan 文件的链路是 Architectural 路径；当前 Bounded 路径采用对话中的简短设计，随后直接实施，不要求 spec 或 implementation plan 文档。[路径定义](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md)

## Kiro：产品文档对照

官方 Specs 总览将一个 spec 的基础材料分为 `requirements.md`（缺陷场景为 `bugfix.md`）、`design.md` 和 `tasks.md`，分别记录要求/验收条件、技术架构/实现考虑和可跟踪的实施任务。因此在 Kiro 的用语中，spec 的范围包含需求、设计与任务。[Specs 总览](https://kiro.dev/docs/specs/)，页面标注更新日期 2026-08-27。

Feature Specs 的需求采用可测试的结构化表述，设计包含架构、组件关系和交互。官方同时提供 Requirements-First 与 Design-First 两种路径，因此内容分工可以稳定，生成顺序仍可根据入口调整。[Feature Specs](https://kiro.dev/docs/specs/feature-specs/)，页面标注更新日期 2026-08-04。

本项目的 Spec 需求部分对应 Kiro 的 requirements；本项目 Design 对应其 design。对于 Brownfield 缺陷，Kiro 的 `bugfix.md` 明确区分当前错误行为、预期行为和应保留行为，修复方法及根因分析放入 design。这支持我们区分行为变化与技术实现。[Bugfix Specs](https://kiro.dev/docs/specs/bugfix-specs/)

## 对本项目的直接影响

- 对内固定 Intent、Spec、Plan 三个步骤与三个产物。Intent 保存目标与边界，Spec 保存需求、验收与方案，Plan 保存任务与实施安排。需求是 Spec 的内容，Design 和 Tasks 分别位于 Spec、Plan 内。
- 对外按内容职责适配：Spec Kit 的 spec 对应需求、plan 及附件对应技术方案；OpenSpec 从 proposal/specs 提取需求层，从 design 提取方案层；Superpowers 从其 spec/design 文档分别识别需求和方案，再读取 implementation plan 中的任务；Kiro 的 requirements/design/tasks 分别对应三类内容。
- 原始来源或前置讨论用于整理 Intent；外部框架没有同名产物时，补齐意图记录并引用来源。保留来源路径、版本及原生名称。术语相同不能自动判定语义等价，也不能要求所有框架采用本项目的文件划分或阶段顺序。
- 本项目对齐 Superpowers 与 Anthropic 的共同产物思路；各框架的命名和阶段依赖仍以其自身定义为准，Spec Kit 的 plan 等原生产物按内容映射。

本套件的详细产物内容以 [产物约定](../../docs/method/sdd-artifact-contracts.md)为准。

补充对照：[Anthropic AI-native SDLC Playbook 与内部实践](anthropic-playbook-sdd-comparison.md)。该对照进一步说明 spec 的内容边界并不统一；官方推荐方法与内部团队实际流程需要分别判断。
