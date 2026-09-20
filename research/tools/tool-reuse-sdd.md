# 已有 SDD 与执行工具的复用选型

[总览与下一步](../../README.md) · 研究依据 · 能力核验不等于已入围或采用 · [研究索引](../README.md)

初次核验日期：2026-09-15；A1 的定向复核与当前入围建议见 [2026-09-16 补充](#a1-sdd)。前五节为历史研究，入围状态及记录粒度以补充节和统一选型页为准。范围：Intent → Spec（含 Design）→ Plan（含 Tasks）→ 本地实施、验证、审查。没有安装、执行或评测候选；推荐与成本是针对本项目既有约定的判断。

## 结论

1. **OpenSpec 自定义 schema 与 Superpowers 方法分别是产物组织和本地执行的候选。** 两者都有可复用资产，但默认流程均需适配；本研究未确定试点顺序或采用组合，后续按[统一选型方法](../../docs/tools/existing-tools-reuse-plan.md#11-调研到精选怎样推进)收敛。
2. **GitHub Spec Kit 是同层底座候选。** 当前已支持 presets、extensions、workflows 和版本化 bundles，不能沿用“流程完全固定”的早期印象。比较组织级分发、命令覆盖、条件编排与最小接入成本后，再决定入围工具和一个主入口。
3. **Agent OS 可补 ADR 发现与导入方法；BMAD 留到 BA、QA 扩展或采用其完整文档体系时评估。** 当前没有充分理由同时运行数套任务状态和产物管理器。

## 1. 读取基线与许可证

以下为读取时主分支快照，版本字段不代表该快照已经发布；链接固定到 commit，避免搜索缓存与后续改版混淆。

| 工具与官方仓库 | 已读取基线 | LICENSE 实际内容 |
|---|---|---|
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | `9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461`；package.json 为 1.13.0 | [MIT](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/LICENSE) |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | `fd490fac952cc6baeb421905b28031b4c5fe8a99`；pyproject.toml 为 1.0.7.dev0 | [MIT](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/LICENSE) |
| [Superpowers](https://github.com/obra/superpowers) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`；插件 manifest 为 6.3.0 | [MIT](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/LICENSE) |
| [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) | `94b6727b00c8316557828c8a8ff2a48ff60d60cc` | [MIT](https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/LICENSE) |
| [Agent OS](https://github.com/buildermethods/agent-os) | `475b0cac4c7c5cf2336ad5a663b691a6d3415e05` | [MIT](https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/LICENSE) |

复用或改编源码、模板、技能时保留相应版权及许可证文本；本表只核验列出的仓库 LICENSE，不自动覆盖第三方扩展、依赖或品牌资产。

## 2. 覆盖与适配比较

| 工具 | 官方输入 → 输出 | 本项目映射与复用方式 | 主要成本、缺口与状态冲突 |
|---|---|---|---|
| **OpenSpec** | 变更描述、项目 context/rules → schema 指定的产物；默认 proposal → specs → design → tasks | **适配采用**：定义 intent、spec、plan 三个 artifact，Design 写入 spec，Tasks 写入 plan；CLI 复用 schema 检查、依赖发现和指令生成 | Node.js 与宿主安装适配；默认 change/spec 路径及归档语义需处理。文件存在、checkbox 全勾不能证明内容合格或代码通过；不原生表达本项目四种 Task 状态。[schema](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs-lab/reference/schemas/schema-yaml.md) |
| **Spec Kit** | 描述 → spec；spec＋技术信息 → plan/research/contracts 等；再生成 tasks 并实施 | **底座备选**：用 preset 覆盖模板、命令、脚本，定制 workflow；Intent 新增，原 plan 方案并入 Spec，原 tasks 并入 Plan | 默认文件、命令及前置检查相互关联，不能只改文件名；constitution 需映射 ADR；workflow run state 只能作运行指针，Tasks 仍由 Plan 管理。[presets](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/presets.md)、[默认流程](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/workflows/speckit/workflow.yml) |
| **Superpowers** | 需求/方案 → 含文件、接口、代码与检查步骤的实施 Plan → 实施者、任务审查、整体审查 | **选择性适配**：Plan 后实施/审查优先复用；Plan 文档本身含 Tasks，语义较接近；保留原始 Spec 直读 | 默认每 Task 提交、每 Task 审查、固定修正轮数及进度 ledger，与本地未提交改动和 Plan 唯一状态约定有差异；需改写规则及脚本输入。[Plan](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/writing-plans/SKILL.md)、[执行](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/SKILL.md) |
| **BMAD** | 混合来源 → SPEC kernel＋companions；可拆 stories；build → 实施、验证与审查 | **暂作方法库**：借鉴需求提炼、专业视角和分步上下文；完整接入需要重做产物映射 | 当前 SPEC 由 memlog 重新推导且限定单写入者；故事/迭代路径存在 stories 与 sprint 状态。直接接入会改变本项目文档权威与演进规则；还需 `_bmad` 配置、渲染及 Python/uv 运行环境。[Spec](https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-spec/SKILL.md)、[Build](https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/SKILL.md) |
| **Agent OS** | 仓库惯例/已有 standards＋当前工作上下文 → 标准文档、索引和按需注入 | **局部借鉴**：将索引选取、原文读取和引用嵌入适配到 ADR；不接管 Intent/Spec/Plan | 默认 `agent-os/standards/`、AskUserQuestion 与 plan-mode 交互需改写；发现的代码模式先记为事实或 ADR 候选，不能自动成为 accepted 决策。[发现](https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/commands/agent-os/discover-standards.md)、[导入](https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/commands/agent-os/inject-standards.md) |

这些项目均有跨工具使用入口或说明，**不等于每个宿主都拥有相同的子 Agent、恢复和交互能力**。适配层仍需能力检测；缺少子 Agent 时降级到顺序执行和另开审查上下文。官方入口：[OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/README.md)、[Spec Kit](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/README.md)、[Superpowers](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/README.md)、[BMAD](https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/README.md)。

## 3. 可以真正省掉哪些自研

### OpenSpec：复用产物声明与发现

- schema 的 artifact ID、`generates`、`requires` 与模板可自定义，`apply.tracks` 可设成 `plan.md`，因此不必为了执行再复制一份 tasks.md；`schema validate` 已检查字段、路径、模板与依赖环。[字段约定](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs-lab/reference/schemas/schema-yaml.md)
- 边界：artifact complete 由文件存在判定，apply 的 ready/all_done 由 checkbox 判定。适配层必须把这些解释成“工具发现/计数状态”；继续执行和最终完成仍由原始要求、有效检查证据及 Plan 状态决定。
- `generates` 相对于 change 目录，禁止绝对路径和 `..`；不能声称只改 schema 就能任意重定向到 `docs/changes/`。首轮可在项目入口映射 `openspec/changes/<id>/` 为唯一物理位置，不双写。默认 spec 同步/归档不自动等于 As-Is 更新。
- 自定义 schema 是快照，上游更新不会自动合入；需维护小型差异清单。文档还标明 schema 命令为 experimental，应锁定版本并做升级兼容检查。[定制说明](https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs-lab/customize/schemas.md)

### Spec Kit：复用分发和可配置流程，而非再写一个相同 CLI

- presets 已可覆盖模板、命令、脚本；workflow 支持 shell、command、条件、循环、fan-out/fan-in 与暂停恢复；bundles 可组织版本化工具组合。[presets](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/presets.md)、[workflows](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/workflows.md)、[bundles](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/README.md)
- `check-prerequisites.sh` 复用价值是定位文件、检查存在性、解析模板和返回 JSON；它没有证明 AC 满足或设计正确。合并 Tasks 后，其 `tasks.md` 依赖也要覆盖。[脚本](https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/scripts/bash/check-prerequisites.sh)
- `.specify/workflows/runs/<run_id>/state.json` 保存步骤状态；本项目应仅将其当恢复指针。业务 Task 结论回写 Plan，实际检查落 evidence；workflow completed 不直接表示变更完成。

### Superpowers：复用执行节点、审查提示和局部脚本

- `task-brief` 已能抽取指定 `Task N` 段落，减少协调 Agent 转述任务；要适配本项目稳定 Task ID 和上下游引用，并继续直读 Spec、ADR。[脚本](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/scripts/task-brief)
- `review-package` 已收集 commit 列表、stat、扩展上下文 diff；**只比较 BASE 与 HEAD，未覆盖工作区未提交和新增文件**，无法原样覆盖当前本地流程，需改为实际受检快照。[脚本](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/scripts/review-package)
- 独立实施/审查、问题证据和复查范围值得复用。默认 `.superpowers/sdd/<plan>/progress.md` 被用作完成与恢复依据，并在结束时清理运行目录；适配后 Plan 是唯一 Task 状态，需保留的证据移到既有 evidence 位置，临时 ledger 只保存运行指针。[执行约定](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/SKILL.md)
- 上游还有“当前消息重新运行检查”、每 Task 提交、明确轮数等强规则。本项目应采用证据与实际状态匹配、按影响复验的既有约定；关键方案或边界变化返回上游，不用执行者 ledger 裁决替换正式 Spec/ADR。[验证技能](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/verification-before-completion/SKILL.md)

## 4. 首轮试验的判定标准

用同一小型 brownfield 变更比较“OpenSpec 自定义 schema”和“Spec Kit preset/workflow”；实际实施与审查采用同一套适配后的约定，避免同时改变所有变量。

| 必须验证 | 通过条件 |
|---|---|
| 三产物与单一权威 | 只有 Intent、Spec、Plan 三份主产物；Task 状态只维护在 Plan，临时状态可重建 |
| 已有文档导入 | 能定位并直接读取适用 ADR、As-Is 和原始要求；记录依据与版本 |
| 完成语义 | 空文件、漏 AC、全部勾选但测试未执行等情况，不被宣称为完成 |
| 本地代码验证 | 纳入相关未提交修改和新增文件；结果能对应实际受检状态 |
| 中断与上游变更 | 恢复不重复已完成动作；Spec/ADR 改动后复核受影响 Task 和证据 |
| 工具升级与宿主差异 | 自定义内容保留；宿主不支持的协作机制有明确降级方式 |

仍需本项目补齐的是**适用 ADR 的采用判断、来源及版本关联、四种 Task 状态、AC→检查证据关联、真实工作区快照、按影响复验和知识回写规则**。优先以少量适配器补这些差异，不重写已有模板解析、产物依赖或通用编排能力。

## 5. 检索边界

本轮另检索了 GSD。旧官方仓库 `gsd-build/get-shit-done` 在已读取 [README 快照](https://github.com/gsd-build/get-shit-done/blob/bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815/README.md) 声明迁往 `open-gsd/gsd-core`；搜索结果仍显示旧状态文件与流程，故没有把旧版当作当前主推荐。新仓库未在本轮完成同等深度核验。

本文负责 SDD 与 Plan 后执行工具，Wiki/代码检索、通用文档检查和 Git hooks 另行选型。上面的“未覆盖”是相对于所核验能力及本项目约定的差异，不表示整个生态绝无相关扩展。

<a id="a1"></a>

<a id="a1-sdd"></a>

## 6. A1：统一比较与首轮名单建议

补充核验日期：2026-09-16。**本节是 A1 的来源核验与入围建议，不是采用决定，也不是本项目实测结果。** 前五节保留为 2026-09-15 基线；本节修正其排序假设和新增证据，最终组合仍由[统一选型页](../../docs/tools/existing-tools-reuse-plan.md#11-调研到精选怎样推进)收敛。只阅读官方文档、模板及源码，未安装或运行候选，未验证上游测试能否在目标项目复现。

### 6.1 比较口径与证据等级

固定需求来自[三产物约定](../../docs/method/sdd-artifact-contracts.md)：BA 维护并确认 Intent 的业务含义；Design 在 Spec，Tasks 与 Task 状态在 Plan；已有业务确认和工程授权直接复用。步骤级输入、检查与交接记录是默认粒度，**逐项 AC—Task—测试编号映射不是入围门槛**，因此前文第 3、4 节对该映射的描述不应读成首版必建能力。终点为本地实现、验证、审查及交接，不要求提交，也不普遍强制严格 TDD。质量先过关，再比较效率和人工负担；允许人工审查，存在人工节点本身不是排除理由。

以下标签含义统一：**原生**＝已读默认实现或指令明确支持；**配置**＝已找到公开配置接口，但未做本项目配置；**改编**＝需改模板、命令、方法或连接代码，不能用“支持配置”掩盖；**未验证**＝没有足够证据，不能推断支持或不支持。源码中的能力不等于宿主会可靠遵循提示，也不等于本项目质量已经达标。适配成本只按需变更的接口和权威关系估计，没有工时或代码量实测。

### 6.2 固定读取版本与许可补充

前五项继续使用第 1 节的固定提交，避免把主分支的新能力混入旧基线；下表补充版本字段及新增候选。版本号来自该提交中的文件，**不是“已安装版本”或发布成熟度结论**。

| 对象 | 本轮固定基线 | 许可与边界 |
| --- | --- | --- |
| OpenSpec | `9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461`；`package.json`：1.13.0 | MIT；schema 命令仍标 experimental。[版本文件][o-version]、[schema 说明][o-custom] |
| Spec Kit | `fd490fac952cc6baeb421905b28031b4c5fe8a99`；`pyproject.toml`：1.0.7.dev0；所读 Full SDD Cycle workflow：1.0.1 | MIT；开发快照的功能不能直接等同于任意已发布安装包。[版本文件][k-version]、[默认 workflow][k-flow] |
| Superpowers | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`；manifest：6.3.0 | MIT；研究的是此提交，不能套用早期“两阶段 Task 审查”或其他版本规则。[manifest][s-version] |
| BMAD Method | `94b6727b00c8316557828c8a8ff2a48ff60d60cc`；本轮以提交锁定，未认定统一发布版本 | MIT；所读 `bmad-build/workflow.md` 标题为 Build New Preview Workflow，不据此推断所有稳定版具有同样行为。[build workflow][b-flow] |
| Agent OS | `475b0cac4c7c5cf2336ad5a663b691a6d3415e05`；`config.yml`：3.0 | MIT；仅把规范发现/导入作为局部方法候选。[配置][a-config] |
| MADR | `ba75bb1b20d42af5746b246ad348c202419ae681`；`package.json`：4.0.0 | **MIT OR CC0-1.0**，不是单独 MIT；复用时选择并保留适用许可信息。[版本][m-version]、[LICENSE][m-license] |
| GSD Core | `49f313d611448a63c2b8b503ff564ed2abbc754c`；`package.json`：1.14.0 | MIT；当前官方仓库为 `open-gsd/gsd-core`。[版本][g-version]、[LICENSE][g-license] |

### 6.3 同一需求下的能力与权威比较

| 对象 | Intent / Spec / Plan 映射 | 状态与恢复 | 关键适配判断 |
| --- | --- | --- | --- |
| **现有宿主＋普通模板** | **配置**：直接使用本项目三产物；既有材料作为来源或共享上游 | Plan 与步骤记录为权威；会话能否准确接续、漏读/重复操作情况仍需实测 | 正式对照基线。没有新增生命周期管理器，仍须验证生成质量，不能因为简单而默认达标 |
| **OpenSpec** | **配置**：schema 的三个 artifact、依赖及 `apply.tracks: plan.md`；**改编**：业务确认、设计/任务内容及交接语义 | **原生**：从文件存在性重建 artifact 完成集，从 checkbox 重建 apply 进度；这提供可重读的发现状态，**不是**验证/审查结果或四种 Task 状态 | **改编**：本项目主入口必须区分“已生成/全勾”与“可交接/完成”。只写 schema 或 project rules 不够，见下节。[schema][o-schema]、[状态源码][o-state]、[apply 模板][o-apply] |
| **Spec Kit** | **配置接口＋改编资产**：preset 可覆盖模板、命令、脚本；增加 Intent，把默认技术 plan 纳入 Spec、tasks 纳入 Plan。不能只重命名文件 | **原生**：workflow run 保存 `state.json`，暂停/失败可从停止步骤恢复；**改编**：run 完成只是运行结论，业务 Task 仍回写 Plan。副作用发生后、状态写入前崩溃的准确恢复**未验证** | **改编**：默认 specify/plan/tasks/implement、文件定位脚本与 constitution 规则需成套映射。公开 override/overlay 比维护任意内部补丁更有利，但实际改编面比 OpenSpec schema 广。[preset][k-preset]、[workflow 接口][k-workflow]、[前置脚本][k-check] |
| **Superpowers 选择性改编** | Plan 含 Task 的结构接近；Intent 的 BA 确认与本项目 Spec 必须由本项目入口提供，不能由 brainstorming 替代 | **原生**：按 plan 建 progress ledger，恢复读完成行、修复轮次与 git 历史；**改编**：Plan 保留唯一 Task 状态，ledger 仅作运行指针；未提交工作区不适用原样审查包 | 复用任务原文交接、独立实施/审查及限定范围复查。commit、严格 TDD、固定五轮后裁决与双状态必须改编；不是启用整个插件再加一段例外。[执行][s-exec]、[review-package][s-review] |
| **BMAD** | **配置**：spec 文件名/路径/模板，build handoff/review layers；**改编**：三产物责任、业务确认与 Plan 状态归属。Story Breakdown 在 bmad-spec 中是可选项，不能将 BMAD 一概说成强制 Story 层级 | **原生**：bmad-spec 的 `.memlog.md` 才是决定权威，SPEC 及自写 companions 每轮派生；build 用 spec frontmatter 从 draft/ready-for-dev/in-progress/in-review 恢复，故事模式另同步 sprint 状态 | 已有材料可引用为 adopted companions，有源内容保留检查，不能低估其输入能力；但把 memlog 降为运行指针会改变核心派生机制。默认 build Task/状态也在其 Spec 内，与本项目职责不一致。[spec][b-spec]、[spec 定制][b-custom-spec]、[build 路由][b-route] |
| **MADR** | 相邻能力：ADR 内容模板，不是三产物/运行工具 | **原生**：普通 Markdown 可表达 proposed/accepted/superseded、决策人、后果；没有运行恢复需要 | **配置/轻改编**：采用 full/minimal/bare 模板，按项目需要保留状态和采纳依据。Confirmation 可记录自动或人工符合性检查，不能误作业务确认或执行通过的自动证明。[完整模板][m-full]、[最小模板][m-min] |
| **Agent OS** | 相邻能力：规范发现/索引/注入；完整 shape-spec 另生成自身规划材料，需改编才适配三产物 | **原生**：从 `agent-os/standards/index.yml` 选文件再读取；没有在已读命令中证明业务 Task 恢复或来源变更失效机制 | **选择性改编**：把索引入口映射现有 ADR，并区分已发现代码模式与已采纳决定。原生命令含 AskUserQuestion、plan mode 假设；显式指定标准可跳过推荐选择，不能笼统说每次都要确认。[发现][a-discover]、[导入][a-inject]、[shape-spec][a-shape] |
| **GSD Core** | **原生**：PROJECT、REQUIREMENTS、ROADMAP、各 phase PLAN/SUMMARY/VERIFICATION；映射三产物要跨多个生产者/消费者改编，未找到等价的三 artifact schema 配置 | **原生**：STATE、HANDOFF、`.continue-here.md` 和中断 agent 接续；resume 会核对 handoff 的未提交文件与 `git status`；状态与完成推导依赖其规划材料和 SUMMARY | 恢复更丰富是有价值的新证据，但不等于能让本项目 Plan 成为唯一 Task 状态。完整流程仍把提交写入完成协议。[产物][g-artifacts]、[恢复][g-resume]、[执行][g-execute] |

**所有候选的共同未验证项：** 原生文档生成/澄清能力尚不能证明它正确保留本项目 BA 已确认的版本、范围与原型含义；更不能证明 AI 草稿不会被误标为业务已确认。该项必须同题测试，不因模板包含 approval/status 字段加分。

### 6.4 默认审批、提交与测试规则：哪些只靠配置，哪些要改编

| 对象 | 已核验的默认行为 | 本项目处理与证据限度 |
| --- | --- | --- |
| OpenSpec | propose 是规划边界；apply 对缺材料、歧义、设计问题、超范围和错误暂停。apply 对 `all_done` 直接输出完成并建议 archive；其 context/operationGuidance **不得覆盖**内置 workflow、CLI 状态与 instruction | 自定义 schema 能调整产物，不能把“全勾即完成”的提示自动变成本项目完成判据。首轮以独立主入口调用 CLI 的发现/指令能力，或明确改编 apply；不要同时把原版 apply 当权威入口。所读 propose/apply 未见强制逐 Task commit 或普遍 red-green TDD，不能推广为全仓不存在。[propose][o-propose]、[apply][o-apply] |
| Spec Kit | 默认 Full SDD Cycle 在 spec、plan 后设人工 gate；tasks 命令强制按 user story 组织，测试 Task 仅在 spec 要求或用户要求 TDD 时生成；implement 对已有测试 Task 要求 test-first；tasks 模板仍提示先见失败、每 Task/逻辑组提交 | **配置**：workflow overlay 可以 insert/replace/remove 步骤，保留必要工程接受并复用已有授权。**改编**：preset 同时覆盖 Story 分类、提交和 TDD 提示，以及阶段文件/脚本引用。不能只引用“tests optional”就宣称无严格测试顺序要求。[workflow][k-flow]、[overlay][k-workflow]、[tasks 命令][k-tasks]、[tasks 模板][k-task-template]、[implement][k-implement] |
| Superpowers | brainstorming 有设计批准、提交设计文档及继续前复核；writing-plans 带 TDD 与频繁提交；TDD 技能要求先失败测试，例外需问用户。执行技能则强调连续执行，由控制者作 ruling，五轮后可 park 并记 Task complete | 不启用这套默认顶层流程作为本项目方法。保留可用节点，去除重复批准/提交前提与普遍 TDD；改变业务或关键技术决定必须回到原权威并按既有责任处理，不能凭 ledger ruling 扩权。人工可承担独立审查，尚无可靠自动审查时保留人工成本。[brainstorming][s-brain]、[Plan][s-plan]、[TDD][s-tdd]、[执行][s-exec] |
| BMAD build | full 路线批准 Spec 后继续或停止；`frozen-after-approval` 内容禁止执行者修改；默认最终 dirty tree 时建立本地 commit。审查 diff 原生包含未跟踪文件；intent_gap 返回人，bad_spec 路径会回退并重派生 | 不因存在人工审查而排除；核心冲突是三产物权威、回退边界与强制本地提交。review/handoff 可配置，最终 commit 与冻结/派生流程不能假设一个 TOML 开关即可全关。所读 build 步骤未见普遍先失败测试规则，不能将其标为严格 TDD；仍有实际运行测试的核验要求。[规划][b-plan]、[实施][b-implement]、[审查][b-review]、[收尾][b-present]、[定制][b-custom-build] |
| MADR / Agent OS | MADR 是模板，没有逐 Task commit/TDD/审批执行器；Agent OS 发现规范会逐项确认，shape-spec 要求宿主 plan mode，导入可选引用或复制 | MADR 的空状态字段不构成 accepted。Agent OS 改编为“发现→判断适用→读 ADR 原文”，沿用已有授权；为保持单一正文采用引用。命令交互的人工负担要计入测量。[MADR][m-full]、[发现][a-discover]、[导入][a-inject] |
| GSD Core | 配置模板默认 interactive、多项确认 gate、`commit_docs: true`；支持自定义 gate/yolo，PLAN 可选 `execute` 或 `tdd`。Git 约定每 Task 提交，execute-plan 的完成顺序包含 production commits、SUMMARY commit、STATE/ROADMAP 更新 | `commit_docs=false` 只解决规划文档提交，**不证明无代码提交模式成立**。不以“需要人工”或“全部强制 TDD”排除；以原生完成协议与本地终点冲突、三产物改编面大为当前不入围理由。[配置模板][g-config]、[Plan 类型][g-plan]、[Git 约定][g-git]、[执行][g-execute]、[文档本地化][g-private] |

### 6.5 改编、升级与退出成本

| 对象 | 最小改动面与维护判断（来源推导，尚未计量） | 升级与退出 |
| --- | --- | --- |
| 普通模板基线 | 三模板、现有入口和步骤记录；没有新增状态翻译，但内容质量全由现有宿主/方法承担 | 只维护项目自己的约定；退出无新增数据转换 |
| OpenSpec | schema/模板＋项目入口＋apply 完成语义适配；接受原生 change 根的路径登记，避免双写 | 官方 update 不改自定义 schema，也不会为 fork 自动合并上游改进；却会刷新安装的命令/skills，因此直接改生成文件容易漂移。锁定版本并保存差异。退出保留三份 Markdown 与证据，去除发现/归档入口；移路径属于可选搬迁。[定制][o-custom] |
| Spec Kit | preset 覆盖命令、模板与脚本，workflow overlay 对齐授权；需要跟踪的面较多，但均有公开入口 | overlay 不直接编辑安装 workflow，可跨 bundle/workflow 更新保留；preset remove 有命令清理/重算机制。退出仍要保留项目正文并移除生成入口，不能把“卸载 preset”视为整个项目内容迁移已完成。[preset][k-preset]、[overlay][k-workflow] |
| Superpowers 选择性方法 | 明确来源的派生 Skill/提示；未提交及新增文件的审查包、Plan 状态/证据落点、授权与复查判据是实际改编面 | 视为固定版本派生资产，逐项比对上游；不要声称插件自动更新能合并这些方法差异。退出只保留项目产物/证据；临时 ledger 不是唯一记录。这是根据执行/脚本依赖作出的维护判断。[执行][s-exec]、[审查包][s-review] |
| BMAD | 路径/模板/实现 handoff/review layer 有公开 TOML 定制；memlog 派生权威、build 状态位置、收尾提交仍涉及核心流程改编，成本预计高于字段改名 | 默认定制文件会被更新覆盖，官方要求把覆盖写进 `_bmad/custom/*.toml`；配置保存不等于改变后的核心流程可无冲突升级。退出须保存 memlog 决定历史与 adopted companions，核对导出的三产物，不能只拿走派生 SPEC。[spec 定制][b-custom-spec]、[build 定制][b-custom-build]、[派生约定][b-spec] |
| MADR / Agent OS | MADR 是轻量模板选择；Agent OS 要做路径/状态/宿主交互改编 | MADR 可直接以普通 Markdown 继续维护。Agent OS 安装脚本复制 profile 中的 standards，故不能把 profile 更新等同于本地修改自动合并；本项目若仅借鉴导入方法，无需运行其安装器。退出保留 ADR 原文与来源即可。[模板][m-full]、[安装脚本][a-install] |
| GSD Core | 新宿主接口有公开版本协商，是比旧仓库更好的集成证据；但接口 state/artifact 支持不等于现有 workflows 自动理解三产物 | 官方建议通过安装器进行跨宿主转换；文档说明声明式宿主的模型配置在安装时生成，变化后需重装刷新。接口协议有弃用窗口，方法/产物迁移仍需单独验证。退出要整理 PROJECT/REQUIREMENTS/ROADMAP/CONTEXT/PLAN/SUMMARY 中的内容和未决状态，转换成本较高。[宿主接口][g-eos]、[版本政策][g-versioning]、[产物][g-artifacts] |

### 6.6 入围建议与 GSD 迁移结论

以下为本研究组建议，质量与稳定性还需本项目验证。**首轮同时入围不等于同时安装或同时接管状态**：每个方案在同一案例的隔离副本中运行，一个方案只有一个主入口和一处 Task 状态。

| 选择 | 对象与范围 | 理由与进入下一轮的条件 |
| --- | --- | --- |
| **首轮对照** | 现有宿主＋本项目普通模板、原生检查、人工/独立审查 | 检验新增工具是否实际省掉重复工作；允许最终沿用基线。基线也执行同样的输入保留、错误完成与恢复测试 |
| **首轮入围：产物组织两个互斥方案** | OpenSpec 自定义 schema/独立主入口；Spec Kit preset/最小 workflow | 前者可复用产物依赖/发现，后者有更明确的覆盖、步骤恢复及升级接口；当前差异足以值得同题比较，不能仅凭“轻量”或“功能多”定胜负。二者共同门槛是三产物、Plan 权威及本地无提交完成。若某方案必须大改内部引擎才能达标，回退基线 |
| **首轮方法变量** | Superpowers 的任务交接、独立审查和局部复查方法；MADR 的 ADR 内容结构 | 二者不是第三个组织底座。先固定同一组产物/受检工作区，再与基线执行/审查比较；MADR 可作为共同 ADR 输入模板，已有 ADR 足够时不迁移。Superpowers 只测明确改编的节点，不以完整默认插件的行为作为通过结果 |
| **后备** | Agent OS 的规范发现/导入方法 | 已有 ADR 索引＋直接读取是首轮基线。若暴露稳定的漏选/漏读问题，再测试其导入方法是否提高正确性；不预先引入 standards 的第二权威 |
| **不进入首轮整套接入** | BMAD、GSD Core、Superpowers 默认完整流程 | 都有可取能力；排除依据是已证实的权威/流程适配冲突，不是质量差或不能人工审查。BMAD 在需要采用其 memlog/派生文档模式时复评；GSD 在确需里程碑/phase 编排且提交进入终点后复评；Superpowers 完整流程须先证明可取消本项目不需要的强约束 |

**GSD 迁移已经核实，不再以“新仓库未查”作为排除原因。** 旧仓库固定 README 明确迁至 Open GSD；新仓库已有宿主协商、可配置 gate、非 TDD Plan、脏工作区接续与文档不提交选项。这些修正了“只看旧流程”的信息缺口；但本轮未发现它能以较小配置替代上述入围方案，同时维持三产物和本地无提交终点的证据。因此，迁移本身不足以替换首轮名单。[旧仓库迁移声明][g-move]、[新仓库说明][g-readme]、[恢复][g-resume]、[文档本地化][g-private]

### 6.7 首轮必须实测的用例与记录

所有用例在相同仓库、输入、初始工作区和模型/宿主条件下比较。先检查质量与错误完成，再看时间、模型用量及人工介入。允许人审，但记录读了什么、作了什么决定与实际耗时；不要把有人兜底的结果归因于工具自动能力。

| 用例 | 必须观察的结果 |
| --- | --- |
| 只有原始业务描述；另给已确认 BA 需求/流程/原型 | 两种输入都能生成有来源的 Intent；后者继承已确认规则与版本，前者不伪造 BA 确认；访问不到的原型状态明确保留未知。静态画面读取与交互检查分开记录 |
| 同一整体设计，先做全部、再只做一部分；分别有/无 Feature/Story 标签 | 共享 Intent 可直接引用，Spec/Plan 明确本次与剩余范围；不强制复制正文或补建 Story 层级；公共规则修改后正确识别影响 |
| Spec 发现历史 ADR 与业务要求冲突 | 工程调查给出证据和处理建议，不静默改写 Intent；既有充分授权直接复用，超出范围的决定返回正确负责人 |
| 空 artifact；全 checkbox 勾选但未验证；只有旧测试报告 | OpenSpec/Spec Kit 的发现/运行状态不冒充完成；Plan 与步骤结论如实未完成/受阻，指出缺失证据 |
| 初始工作区已有修改，新增未跟踪文件，过程中仍不提交 | 实现/审查覆盖实际相关差异；不自动提交、不漏新增文件、不把用户已有工作误判为本次新增或回退对象 |
| 内容修改、配置改动、正常代码修复三类任务 | 依据实际风险选择有意义的检查；没有默认普遍严格 TDD；未执行的测试如实写明；检查覆盖及结果仍满足 Spec |
| 写产物后中断；实现副作用后、写进度前中断；审查修复中断 | 从磁盘原文、实际代码和证据恢复；不只信会话/ledger，不重复已完成副作用；步骤位置与业务完成分开 |
| Spec/ADR/代码在验证后改变 | 识别证据的适用版本，按影响复核，不能沿用失效结果；也不因文字整理无差别重跑所有步骤 |
| 独立审查指出实现与 Plan 一致、但违反 Spec 的缺陷 | 主入口读取原 Spec；修正/上游决定有明确归属；不能用控制者 ruling 或达到固定轮数静默降低验收含义 |
| 升级与退出演练；宿主没有子 Agent | 自定义资产不被重置，冲突能显式发现；停止工具后仍能从三产物/证据继续；缺子 Agent 时顺序执行＋人工或新上下文审查的质量和负担单独计量 |

每方案记录：改动过的配置/模板/命令/脚本清单，是否触及内部引擎，错误或遗漏完成次数，实际保留/丢失的来源内容，恢复重复动作，非目标文档变动，人工工作与总用时。**尚无这些实测结果，本节不宣称任何工具优于现有宿主的质量。**

[o-version]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/package.json
[o-custom]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs-lab/customize/schemas.md
[o-schema]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/docs-lab/reference/schemas/schema-yaml.md
[o-state]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/src/core/artifact-graph/state.ts
[o-apply]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/src/core/templates/workflows/apply-change.ts
[o-propose]: https://github.com/Fission-AI/OpenSpec/blob/9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461/src/core/templates/workflows/propose.ts
[k-version]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/pyproject.toml
[k-flow]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/workflows/speckit/workflow.yml
[k-preset]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/presets.md
[k-workflow]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/docs/reference/workflows.md
[k-check]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/scripts/bash/check-prerequisites.sh
[k-tasks]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/tasks.md
[k-task-template]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/tasks-template.md
[k-implement]: https://github.com/github/spec-kit/blob/fd490fac952cc6baeb421905b28031b4c5fe8a99/templates/commands/implement.md
[s-version]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/.claude-plugin/plugin.json
[s-exec]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/SKILL.md
[s-review]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/subagent-driven-development/scripts/review-package
[s-brain]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/brainstorming/SKILL.md
[s-plan]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/writing-plans/SKILL.md
[s-tdd]: https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/test-driven-development/SKILL.md
[b-flow]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/workflow.md
[b-spec]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-spec/SKILL.md
[b-custom-spec]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-spec/customize.toml
[b-custom-build]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/customize.toml
[b-route]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/step-01-clarify-and-route.md
[b-plan]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/step-02-plan.md
[b-implement]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/step-03-implement.md
[b-review]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/step-04-review.md
[b-present]: https://github.com/bmad-code-org/BMAD-METHOD/blob/94b6727b00c8316557828c8a8ff2a48ff60d60cc/skills/bmad-build/step-05-present.md
[a-config]: https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/config.yml
[a-discover]: https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/commands/agent-os/discover-standards.md
[a-inject]: https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/commands/agent-os/inject-standards.md
[a-shape]: https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/commands/agent-os/shape-spec.md
[a-install]: https://github.com/buildermethods/agent-os/blob/475b0cac4c7c5cf2336ad5a663b691a6d3415e05/scripts/project-install.sh
[m-version]: https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/package.json
[m-license]: https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/LICENSE
[m-full]: https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/template/adr-template.md
[m-min]: https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/template/adr-template-minimal.md
[g-version]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/package.json
[g-license]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/LICENSE
[g-artifacts]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/docs/reference/planning-artifacts.md
[g-resume]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/gsd-core/workflows/resume-project.md
[g-execute]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/gsd-core/workflows/execute-plan.md
[g-config]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/gsd-core/templates/config.json
[g-plan]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/docs/reference/plan-md.md
[g-git]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/gsd-core/references/git-integration.md
[g-private]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/docs/how-to/keep-planning-docs-private.md
[g-eos]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/docs/explanation/embeddable-orchestration-system.md
[g-versioning]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/docs/explanation/interface-versioning-policy.md
[g-move]: https://github.com/gsd-build/get-shit-done/blob/bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815/README.md
[g-readme]: https://github.com/open-gsd/gsd-core/blob/49f313d611448a63c2b8b503ff564ed2abbc754c/README.md
