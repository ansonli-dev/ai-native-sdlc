# OpenSpec 与 Spec Kit：面向本方案的比较

[工具选型入口](existing-tools-reuse-plan.md#a3-result) · [行动路线图](../roadmap/action-roadmap.md#a3)

2026-09-16。**补充比较已完成并通过独立审查；未证明质量优胜者，撤回优先 OpenSpec 的建议。** 固定 OpenSpec 1.13.0 / `9d4e5974e5c0` 与 Spec Kit 1.0.7.dev0 / `fd490fac952cc`；这里比较实际固定版本，不声称代表未来发行版。只有两组，各组内分别调查原生机制、适配现有方法和完成隔离试验。

**核心差异：** OpenSpec 提供以变更增量积累长期规格的机制；Spec Kit 提供可覆盖/组合的命令与模板、质量检查指引及可选持久化工作流。本题中两组都正确完成了局部实现，维护方式有差异，却没有“OpenSpec 必然更轻或质量更好”的证据。

完整来源：[OpenSpec 组报告](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/report.md)、[Spec Kit 组报告](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/report.md)、[最终独立审查](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/review/final-review.md)。

## 1. 上一轮为什么不足以选型

上一轮把两套工具适配为相同的 Intent / Spec / Plan，再由 Agent 完成同一小变更的文档及修订。结果证明两套组合都可行，但没有充分回答以下问题：

- 原生工具分别提供了什么价值？强制统一产物以后失去哪些能力？
- Spec Kit 的持久化 workflow 是可选增强，为什么把它全部计作三产物必需负担？
- 修改规则、更新已安装配置、切换另一个变更，到底需要做哪些实际操作？
- 文档能否真正指导正确实现、有效测试和审查？

另外，[既有文档约定](../method/project-documentation-system.md#lifecycle)允许有明确归属的 Design / Tasks 附件。三产物是三种权威职责，不强制恰好三个物理文件。上一轮的三文件适配只是一个方案；比较不能把它放弃的原生能力说成方法或工具的必然限制。此点已作为[共同条款解释](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/common/artifact-mapping-clarification.md)同发两组。

因此保留[第一轮证据](/Users/yuan.li/Documents/projects/explicit-architecture/docs/project/evidence/ai-sdlc-a3.md)，撤回优先 OpenSpec 的倾向。补充试验先固定[协议 r2](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/common/protocol.md)，经过[独立协议审查](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/review/protocol-review.md)，再分别执行。

## 2. 原生工作方式：差异先于适配

以下为固定上游文档及源码调查；实际命令和业务结果另列，不能把官方指引当作强制执行或效果已验证。

| 维度 | OpenSpec | Spec Kit | 对本方案的意义 |
| --- | --- | --- | --- |
| 主要组织方式 | 以 change 组织提案、变更规格、设计和任务；领域规格独立积累 | 以 feature 目录组织需求、技术计划、任务；constitution 提供共同原则 | 两者默认都不是我们的三个文件；需明确改编语义，而非仅改文件名 |
| 已有系统接入 | 从当前小变更的增量规格开始，按变更逐步累积 | 从当前小变更开始，采用现有规则、代码与检查作为上下文 | 两者都适用既有项目；不能用“OpenSpec 适合老项目、Spec Kit 只适合新项目”作选型依据 |
| 长期规格 | 原生把 ADDED / MODIFIED / REMOVED 变更合入领域规格，归档保留变更历史 | 官方列出历史记录、持续维护规格、变化回写等策略，由团队选择 | OpenSpec 提供具体的规格积累机制；Spec Kit 留出策略选择。都需与现有 As-Is / ADR / 变更权威划清职责 |
| 质量检查入口 | explore / verify 等 Agent 指引；CLI 的结构和进度检查不等于语义验收 | clarify / analyze / checklist / converge 等 Agent 指引；不等于 CLI 自动证明正确 | 应比较实际继承了哪些检查方法，以及路径/产物改编后是否仍适用 |
| 需求变化 | 可直接修改当前变更文件，由 Agent 复核并继续 | 可按团队选定策略修改既有 feature 或建立后继 feature | 两组上一轮都没有自动传播“下游语义过期”，这一点没有胜者 |
| 多变更 | 原生 change 容器及选择入口 | feature 容器及当前 feature 定位机制 | 容器切换与语义冲突检测是不同能力，不能混为一谈 |

一手依据：[OpenSpec 原生示例](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/README.md)、[已有项目](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs/existing-projects.md)、[修改既有变更](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs/editing-changes.md)；[Spec Kit 命令](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/README.md)、[已有项目](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/guides/existing-projects.md)、[规格持续维护策略](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/concepts/spec-persistence.md)。

## 3. 补充实验的相同要求

两组保持三权威文件、Plan 四态、真实验证、既有规则及授权、不增加强制提交或审批；原生阶段持久化是可选收益。各自先冻结可运行的较小配置，再做相同维护动作和币种实现。所谓最小配置仅指本轮已经运行的较小接法，不声称找到全局最小。

| 实验 | 要回答的问题 | 当前状态 |
| --- | --- | --- |
| 最小适配与实施接续 | 哪些源配置真正必要，哪些是可选增强；Agent 实际读取了什么原生入口 | 两组已冻结、接续并独立复核 |
| M1：Task 增加“重新打开条件” | 改哪份源文件、是否需重新安装、旧业务文档会不会自动更新 | 两组实际运行及独立复核完成 |
| M2：增加第二个变更再切回 | 如何选择当前变更、是否依赖 Git 分支、原有正文是否保持 | 两组实际运行及独立复核完成 |
| M3：同版本刷新配置 | 方法源、生成技能、人工正文分别如何处理，有无实际覆盖或保留 | 两组实际运行及独立复核完成 |
| 同题隔离实现 | 新反例能否有效失败、实现后是否通过、原四类回归是否保持 | OpenSpec 58/58、Spec Kit 59/59；断言及原31项保留均已独立复核 |
| 独立审查 | 正文、代码、断言及日志是否支持结果，工具与 Agent 的贡献有无夸大 | 已完成；没有阻断缺陷或修正要求 |

原试点工作区保持；试验只在各自隔离目录修改业务代码。生成 Wiki 不手改，原来未提交的其他工作不混入比较。测试数量不能替代断言质量；一次小变更不能证明普适模型效果、统计速度或总成本优势。

## 4. 已运行出的操作差异

以下基于已保存实际输出，并经独立复核。

| 同一操作 | OpenSpec 本次实测 | Spec Kit 本次实测 | 实际取舍 |
| --- | --- | --- | --- |
| 保持三文件并进入实施 | 自定义 schema、模板、project config 和入口；原生 apply 指令定位三产物和未完成任务 | preset 覆盖相关命令/模板，包括 implement；以现有 Spec 作为前置条件，Tasks 从 Plan 读取，不需要独立 workflow / overlay / runner | 上一轮“Spec Kit 必须额外工作流、更重”的印象不成立；两组均可由当前 Agent 接续 |
| 给 Task 模板加一项字段 | 直接修改项目 schema 的一个 Plan 模板；下一次 native instructions 即带新字段 | 项目本地 override 模板修改后，下一次 native resolve 即可读取，无需重装；维护外部 preset 包时另走安装同步 | 两组本地模板修改都可即时生效；不能把外部分发路径与本地编辑混成成本差异。两组旧正文均不自动改 |
| 切换另一个变更 | 建立具名 change，命令显式选择 `--change`；原三产物保持 | 原生建立编号 feature，路径脚本通过 `SPECIFY_FEATURE_DIRECTORY` 定位原 feature；原三产物保持 | 具名 change 与编号 feature/路径选择不同；本版本 Spec Kit 不能简单等同于“靠 Git 分支切换” |
| 同版刷新 | 普通 update 因版本相同未重写；强制 update 覆盖生成 apply skill 中的标记，保留 schema/config 与业务正文 | 普通 integration upgrade 检测到被修改技能后退出并保留；备份后强制刷新，重新生成技能且采用 preset，自定义源及业务正文保留，直接改生成技能的标记丢失 | 要区分不刷新、拒绝覆盖、确认强制重建三种行为；两组长期定制都应落在源配置中 |

探针原始结果：[S1 M1](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/probes/M1/result.json)、[M2](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/probes/M2/result.json)、[M3 强制刷新](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/probes/M3/force-result.json)；[S2 M1 本地覆盖](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/disposable/m1/local-override-result.json)、[M2](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/disposable/m2/result.json)、[M3 普通刷新](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/disposable/m3/result.json)、[强制刷新](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/disposable/m3/force-result.json)。S1 首次刷新探针影响了本组共享的实验 XDG 状态，已保留并隔离改正，详见其 force-result；不是原项目文件变化。

## 5. 真实代码与测试结果

| 项目 | OpenSpec 组合 | Spec Kit 组合 |
| --- | --- | --- |
| 生产代码 | 在 calculate 开始规范化请求币种，逐项比较，通过后沿用原定价；返回规范化币种 | 相同机制；变量名、异常文案和 equals 调用方向不同 |
| 修正前反例 | 定价/Money 33 个测试中 7 个预期失败：混币、请求不符、不同位置不符未抛异常 | 四类 59 个测试中 7 个预期失败，同样暴露拒绝缺口 |
| 修正后四类回归 | 58 通过、0 失败/错误/跳过 | 59 通过、0 失败/错误/跳过 |
| 修改边界 | 1 个领域服务 + 4 个测试文件；其他 557 个基线文件及配置保持 | 相同文件边界；其他 557 个基线文件及配置保持 |
| 独立审查 | 通过本次范围，无阻断发现 | 通过本次范围，无阻断发现 |

测试数受参数化拆分和检查粒度影响，不表示 59 优于 58。两组沿用各自首轮产物，结论属于工具、适配、继承产物与 Agent 的组合；无法由本次小变更单独证明工具提高了模型正确率。[S1 红灯记录](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/logs/red-counts.json)、[最终回归](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/logs/regression-counts.json)；[S2 红灯记录](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/logs/red-four/summary.json)、[最终回归](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/logs/green-four/summary.json)。

## 6. 保留原生文件的另一种映射

三产物职责不等于三文件限制，因此不能只评价已测的三文件改编：

| 方法职责 | OpenSpec 可保留的原生文件 | Spec Kit 可保留的原生文件 |
| --- | --- | --- |
| Intent | proposal.md 补业务责任、采用来源与接受依据 | 额外补 Intent，承接 BA 已确认成果 |
| Spec，含 Design | specs 下的行为增量 + design.md 作为所属设计附件 | spec.md + 原生 plan.md 作为技术 Design 附件 |
| Plan，含 Tasks | tasks.md 补依赖、验证、四态与交接 | tasks.md 承载执行安排，补四态与交接；避免与技术 plan.md 的职责混淆 |

OpenSpec 保留 native specs artifact / 路径，可保留 delta/sync 的输入接口；Spec Kit 保留默认文件入口，可能减少 analyze/implement/converge 的路径适配。但两组仍需补本方法的责任、四态及真实完成语义。**这只是固定源码支持的映射方向，未完成同等端到端试验，不能说已经验证零适配或最低成本。** [OpenSpec 映射核对](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s1/native/mapping-note.md)、[Spec Kit 报告 B.3](/Users/yuan.li/Documents/projects/ai-native-sdlc/.local/pilots/explicit-architecture/a3-followup-20260916/s2/report.md)。

## 7. 结论与适用取舍

独立审查确认以下取舍未超出证据；正式采用仍由工程负责人决定。

| 你需要解决的实际问题 | 更值得利用的机制 | 需要承担的约束 |
| --- | --- | --- |
| 每次变更以后，按领域积累一份长期有效的行为规格，并保留增删历史 | OpenSpec 的 change / delta / specs / archive 链路 | 采用其规格增量结构及同步规则，明确长期规格与 OpenWiki 当前事实的职责；本次三文件路线没有获得这项收益 |
| 将团队已有方法包装为命令、模板和宿主 Skills，并按层覆盖/组合和刷新 | Spec Kit 的 preset / project override / integration 机制 | 分清源包、已安装模板与生成命令；默认分析/收敛命令仍需按实际产物语义适配；同版升级会提示 preset 造成的技能修改 |
| 需要工具记录某次编写流程停在哪一步 | Spec Kit 可选 workflow 的持久化 run/checkpoint（第一轮已有恢复实测） | 这是一项额外能力及维护投入；本轮较简 preset 路线没有启用它，不能两边重复计算收益 |
| 保留现在的三份文件，由 Agent 管推进、检查和恢复，只完成本地代码闭环 | 两组已测配置都能接续；质量未拉开差距 | 必须保留语义审查、真实测试与有效来源，原生文件完成/流程完成均不能当作验收 |

**针对当前已确定的本地 MVP，尚无证据说明必须优先 OpenSpec。** 它最有区别的原生价值是长期规格增量维护，而不是“会生成更好的三份文档”；Spec Kit 的较简 preset 路线也已经消除了上一轮人为增加的工作流负担。选择应对应要保留的原生机制，不能凭模板行数、任务数量或框架名称决定。

这次比较仍不是全能力、跨版本或统计性能认证：默认完整流程未从相同新业务输入各自重跑，附件职责映射未完成端到端验证，多人并发/跨仓库共享、跨版本升级、真实原型、完整卸载、远端交付均未验证。它提供固定版本下的机制、可运行配置、维护动作和一次真实隔离实现证据，足以说明这些范围内的取舍；不把未验证维度包装为胜负。

A4 的实际项目接续、知识刷新与工程负责人采用仍独立于这些试验。已通过的隔离代码可成为后续输入，不能未经起点复核直接覆盖原工作区。
