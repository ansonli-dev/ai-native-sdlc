# SDD 中 Plan 与 Tasks 的职责比较

[总览与下一步](../../README.md) · 研究依据 · 框架原生术语不等于本项目约定 · [研究索引](../README.md)

调研日期：2026-09-15。以官方命令、模板和脚本为证据；以下结论区分默认行为、可选编排和设计推论。

本文的框架章节保留上游原始术语。本产品现采用 [AI SDLC 词表](../../CONTEXT.md)：准备阶段采用 Intent、Spec、Plan 三个步骤与三份产物，Design 属于 Spec、Tasks 属于 Plan；该约定不改变外部框架的定义。

关于“Spec 是否就是需求、Design 是否就是方案”的专门核验，见 [Spec 与 Design 的框架对照](sdd-spec-design-crosscheck.md)，其中补充 Kiro 的整体 spec 用法及 Superpowers 的设计/spec 用法。

## Spec Kit

核对版本：`github/spec-kit` 的 main 提交 [`fd490fac952cc6baeb421905b28031b4c5fe8a99`](https://github.com/github/spec-kit/commit/fd490fac952cc6baeb421905b28031b4c5fe8a99)，提交日期 2026-09-14。未安装或运行 Spec Kit。

### 1. 默认流程将技术设计与执行拆解分为两个命令、两份主文件

`speckit.plan` 在 Phase 1 设计完成后结束。`plan-template.md` 明确把 `tasks.md` 标为后续 `speckit.tasks` 的产物，且明确说明它不由 Plan 生成。Plan 命令头部提供转到 Tasks 的 handoff，但这是后续命令入口，不改变两个命令的生成职责。[Plan 命令](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/plan.md)、[Plan 文件结构](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/plan-template.md)、[handoff 声明](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/plan.md)。

### 2. Plan 的核心是技术决策、结构和验证设计

`plan.md` 包含技术上下文（语言、依赖、存储、测试工具、平台、性能目标和约束）、宪章检查、实际代码目录及结构决策；复杂度例外需要说明理由。它还组织设计附件：`research.md` 记录选择、理由和替代方案；`data-model.md` 记录实体、关系与约束；有外部接口时生成 `contracts/`；`quickstart.md` 记录可运行的端到端验证步骤和预期结果。Quickstart 明确不放完整实现代码或完整测试套件。[Plan 模板](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/plan-template.md)、[设计附件职责](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/plan.md)。

### 3. Tasks 是从设计和用户故事派生的可执行清单

Tasks 必须读取 `plan.md` 和 `spec.md`；研究、数据模型、接口契约和 Quickstart 按存在情况使用。Bash 初始化脚本也会在前两份文件缺失时直接失败。因此这里的先后关系落实在工具前置检查中。清单要求任务编号、完成复选框、明确动作和文件路径；故事任务带故事编号，可并行任务带 `[P]`。粒度标准是足够明确，让 LLM 能直接完成；默认命令没有规定每项必须耗时几分钟。[Tasks 输入与格式](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/tasks.md)、[粒度与格式规则](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/tasks.md)、[实际前置检查](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/scripts/bash/setup-tasks.sh)。

### 4. Tasks 还负责执行顺序、增量验收和完成状态

清单先列初始化与公共基础，再按用户故事优先级组织实现，最后处理跨故事收尾；每个故事有目标和独立验证标准。模板提供依赖、并行机会及 MVP 增量交付策略。`[P]` 需要文件不同且不存在未完成依赖；若生成测试任务，则测试先于对应实现。Tasks 命令默认仅在规格要求测试或用户要求 TDD 时生成测试任务。Implement 会同时读取 Plan 与 Tasks，按依赖执行，并在 Tasks 内把完成项改为 `[X]`。这说明 Tasks 同时承担运行中的工作状态，Plan 继续提供技术约束。[Tasks 模板](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/tasks-template.md)、[测试条件与排序](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/tasks.md)、[实现读取职责](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/implement.md)、[执行与状态更新](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/implement.md)。

### 5. 一个入口可以串联两步；默认产物职责仍保持分开

当前官方已经提供可选的 `specify workflow run speckit` 编排入口，串联 Specify → Plan → Tasks → Implement；内置 Full SDD Cycle 在 Plan 与 Tasks 之间还放置了人工评审关卡。这是减少命令操作的现成例子，不代表 Plan 自动生成 Tasks。[工作流入口](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/workflows.md)、[内置工作流](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/workflows/speckit/workflow.yml)。

官方同时允许项目覆盖、presets 改写模板和命令，以及 extensions 增加能力；无覆盖时才使用核心默认值。因此自定义合并属于产品/项目选择，不能当作 Spec Kit 默认流程。所核对的默认命令与模板没有按任务规模自动合并 Plan/Tasks 的规则。[定制与默认值说明](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/README.md#making-spec-kit-your-own-extensions--presets)。

**针对本插件的推论：** Spec Kit 支持保留“技术决策与验证设计”以及“执行单元、依赖与状态”两种逻辑职责；它也证明统一调用入口与分离产物可以同时成立。是否在小变更中把两者放进一个文件，不能仅凭 Spec Kit 默认设计推出，需由本插件自己的复杂度与交接需求决定。

## OpenSpec

核对版本：`Fission-AI/OpenSpec` 的 main 提交 [`9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461`](https://github.com/Fission-AI/OpenSpec/commit/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461)，提交日期 2026-09-09。以下描述默认 `spec-driven` schema 和当前命令文档，未安装或运行。

### 职责与默认依赖

`design.md` 记录技术选择、理由、风险和适用的迁移安排；`tasks.md` 是有编号、依赖顺序和完成验证方式的复选框清单。默认 schema 中，specs 和 design 都依赖 proposal，tasks 依赖 specs 与 design；apply 跟踪 tasks.md 的状态。这是产物依赖关系，不要求 specs 与 design 只能串行生成。[默认 schema](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/schema.yaml)

设计模板主要围绕上下文、目标、技术决定和风险；任务模板采用分组复选框。这使技术解释与执行状态分别维护。[设计模板](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/design.md)、[任务模板](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/schemas/spec-driven/templates/tasks.md)

边界：设计指引包含按复杂度创建 design 的说明，但同一默认 schema 的 tasks 依赖仍列出 design。适配时需要检查实际 schema 与工具行为；不能仅凭条件化的文字就断言当前默认流程可直接删除 design 文件。

### 统一生成入口

当前 core profile 的 `/opsx:propose` 可以创建变更并生成实施所需的规划产物，默认包括 proposal、specs、design、tasks；扩展流程提供 `/opsx:ff` 批量生成和 `/opsx:continue` 逐项生成。因此，用户一次发起规划与保留多份职责明确的文件能够同时成立。[命令文档](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs/commands.md)、[工作流文档](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs/workflows.md)

## Superpowers

核对版本：`obra/superpowers` 的 main 提交 [`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`](https://github.com/obra/superpowers/commit/b36e0829c6d0140e93cfef2ca599b1b07d4a7797)，提交日期 2026-08-12。它提供 Agent 开发方法与技能流程，本节用来比较术语和产物组织，未执行这些技能。

在 architectural 路径中，brainstorming 先形成并评审设计/spec，再交给 writing-plans；当前 bounded 路径的文档要求更轻。因此下面的完整产物链适用于其需要书面实施计划的路径。[Brainstorming](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md)

writing-plans 的 Implementation Plan 自身包含任务：每项列出修改与测试位置、输入输出接口，以及可跟踪的执行步骤。计划同时引用上游 spec/design，并保留方案概要与全局约束。执行者据此按任务开展工作；这里没有再生成独立 tasks.md 的默认步骤。[Writing Plans](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/writing-plans/SKILL.md)、[Executing Plans](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/executing-plans/SKILL.md)

**推论：** Superpowers 的 Implementation Plan 更接近“实施任务计划”，包含 Tasks 并引用上游设计。接入本产品时，可通过这些内容与引用组成 Plan；其具体文件与本产品的逻辑产物无需一一对应。

## 跨框架的语义对应

以下是基于上述来源的归纳，不表示三个框架拥有完全相同的阶段、字段或审批规则。

| 逻辑职责 | Spec Kit 默认流程 | OpenSpec 默认 schema | Superpowers 的完整规划路径 |
| --- | --- | --- | --- |
| 定义目标行为 | spec.md | proposal 与 specs 承担不同部分 | brainstorming 的设计/spec；与纯行为 Spec 不完全同构 |
| 说明技术方案 | plan.md 及设计附件 | design.md | 上游设计/spec，以及实施计划中的必要概要 |
| 组织执行工作 | tasks.md | tasks.md | Implementation Plan 内的任务与步骤 |
| 更新执行进度 | Tasks 清单 | Tasks 清单 | 实施计划中的步骤及执行记录 |

术语 `Plan` 不是统一接口。集成时读取实际内容，把技术决定和执行单元映射到相应职责；原产物位置与来源修订保留。

## 本套件采用的组织方式

2026-09-15 按当前设计决定，准备阶段固定 Intent → Spec → Plan 三个步骤与三个产物。默认使用 intent.md、spec.md、plan.md；小变更缩短内容，保留三份产物。

- Intent 从来源和澄清中形成目标、边界与约束。
- Spec 承接 Intent，记录需求、验收条件和关键方案。
- Plan 承接 Spec，记录 Tasks、依赖、验证安排和实际执行状态。

这是本产品的选择，不是各框架共有的阶段或文件规则。已有外部产物按职责引用；缺少 Intent 时从明确来源整理，不能反向虚构意图。关键方案变化回到 Spec，目标和边界变化回到 Intent，再复核下游工作。

产物内容、生成输入和继续条件集中在 [产物约定](../../docs/method/sdd-artifact-contracts.md)，产品范围见 [路线图](../../docs/roadmap/ai-sdlc-plugin-roadmap.md)。
