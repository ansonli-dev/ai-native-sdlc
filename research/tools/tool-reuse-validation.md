# 确定性工具复用：检查、证据、ADR 与 Git hooks

[总览与下一步](../../README.md) · 研究依据 · 能力核验不等于已入围或采用 · [研究索引](../README.md)

初次核验日期：2026-09-15；2026-09-16 的 A1 定向复核见[第 8 节](#a1-validation)。本文依据官方仓库、文档和源码，对照[实现分工](../../docs/tools/sdd-capability-implementation-map.md)评估；未安装或运行候选工具。下面是候选与替换关系，不是全部安装清单。发布版本仅用于定位，不等于已完成兼容性验证。

## 1. 候选与组合假设

**复用现有 Git、构建和测试命令；新增候选集中在 Markdown/链接检查。** 方法与配置先行，只有实测发现反复出现的缺口才补适配代码；不另建通用测试平台，也不要求业务仓库更换任务运行器或 hook 管理器。

- 纯 Markdown 的待比较组合：现有命令；缺少等价检查时，再比较 `markdownlint-cli2` + `lychee`。
- 采用明确结构化元数据后：选择 `check-jsonschema`；若插件运行时已经采用 Node.js，则可选 Ajv 代替，不同时引入两套验证器。
- 项目准备存在多语言工具版本和环境一致性问题时：增加 mise；已有可靠方案则继续复用。
- ADR：借用 MADR 模板内容，保留本项目的适用范围、采纳、生效条件、替代和证据约定；无需先安装 ADR 管理 CLI。
- Git hooks：当前本地实现/验证不要求安装；后续复用现有管理器，无现有工具时在 pre-commit 与 Lefthook 中选择一个，并核验候选快照行为。

以上是待验证的组合假设，尚未确定采用；按统一需求与已有项目工具比较后再精选。工具各自覆盖的客观能力和边界如下。

## 2. 八个核心候选

| 候选 | 实际可复用能力 | 本项目用法与尚未覆盖的内容 |
| --- | --- | --- |
| [mise](https://mise.jdx.dev/tasks/) | 管理项目开发工具版本、环境及命名任务；任务可以调用已有脚本并组织依赖 | 可统一 setup/check/test 入口。其任务依赖是运行命令的依赖，不会校验 `plan.md` 的 Task ID、AC 关联或产物版本；不把成功退出变成需求完成 |
| [check-jsonschema](https://check-jsonschema.readthedocs.io/en/latest/usage.html) | CLI 按 JSON Schema 检查 JSON/YAML 实例，支持本地 schema 和 JSON 诊断输出 | 检查状态枚举、字段、类型、引用格式。Markdown front matter/任务表须先解析成实例；跨文档 ID 解析、业务覆盖和 Task 无环检查仍需关系适配 |
| [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) | Markdown/CommonMark 规则检查、范围配置、自定义规则及 JSON/JUnit/SARIF 等报告格式 | 直接承担排版和 Markdown 结构规则。默认检查不等于本项目章节契约，更不证明内容正确；front matter 可忽略不等于元数据验证。检查入口不启用自动修复 |
| [lychee](https://lychee.cli.rs/guides/cli/) | 检查 Markdown/HTML 中链接，支持本地离线检查、片段检查、过滤和报告输出 | 直接承担路径/链接可达性检查，按实际版本配置锚点规则。`ADR-001` 等纯文本 ID 需先解析；链接可达不证明引用内容支持结论，也不证明 As-Is 新鲜 |
| [MADR](https://github.com/adr/madr) | 可复制的 Markdown ADR 模板，含背景、备选、决定、后果、确认方式及可选状态元数据 | 作为模板来源；它不是采纳权限、替代关系或变更影响运行时。保留现有 `docs/adr/` 映射，无需改用模板示例目录 |
| [adr-tools](https://github.com/npryce/adr-tools) | Shell CLI 创建编号 ADR、建立记录关系，可配置目录和模板 | 有现成机械操作可参考，但默认行为与本项目生命周期冲突，首版不直接采用 `adr new`/`-s` 作为权威写入入口；详见下一节 |
| [pre-commit](https://pre-commit.com/) | 声明并安装多语言 Git hook 检查，支持可复用 hook 仓库和直接运行 | 已采用项目可保留。提交检查通过临时隐藏未暂存修改处理部分暂存，需与本项目“不自行 stash/reset”约定明确适配；核心检查依然可绕过 hook 管理器直接调用 |
| [Lefthook](https://lefthook.dev/configuration/run/) | 配置 Git hook 命令、文件过滤和并行执行，可调用项目已有工具 | pre-commit 的替代入口，适合已有运行环境。`{staged_files}` 传递文件名单，不能单凭该占位符推断命令读取了索引内容；所读快照仍需适配 |

**替换选项：**[Ajv](https://ajv.js.org/guide/getting-started.html) 是 JavaScript JSON Schema 验证库，可将 schema 编译为验证函数。若插件本身是 Node.js 程序，可直接使用它承担 check-jsonschema 的角色；Markdown 解析、跨文件关系和语义判断仍不由 schema 自动完成。[源码与 MIT 许可证](https://github.com/ajv-validator/ajv/tree/f177fe323420ccb23e1a79445fd470cbf80aee7c)

## 3. 两处必须显式处理的默认行为

### ADR 创建不应自动采纳或提前替代

adr-tools 的固定版本源码在 `adr new` 中把默认状态替换成 `Accepted`；`-s` 会写入新旧记录的替代关系，并移除历史记录的 Accepted 状态。这些操作发生在创建新记录时。[固定源码](https://github.com/npryce/adr-tools/blob/b3279baf9be2207d1a4f4bbd608fd0b591c72aee/src/adr-new)

本项目的提议必须保留 proposed，采纳依据和生效条件形成后才能应用相应替代。因此首版先复用 MADR 内容结构和现有文件编辑能力创建草稿，无需专门写入函数。后续若适配 adr-tools，需要验证模板、状态和关系更新行为，不能只改目录就声称兼容。

### 传递暂存文件名不等于验证暂存内容

pre-commit 官方明确说明：它在提交检查时暂时隐藏未暂存修改，以检查暂存内容。[官方机制说明](https://pre-commit.com/#pre-commit) Lefthook 的 `{staged_files}` 则定义为将要提交的文件列表。[占位符说明](https://lefthook.dev/configuration/run/#staged_files)

本项目建议：保留业务仓库既有工具行为；新增接入先定义检查对象是 working-tree、index 还是 commit。当前规则下，自有适配器不额外执行 stash/reset；需要索引内容的检查直接读索引或在明确构建的候选快照中执行。尚不支持时报告限制，不把工作区通过写成索引通过。不能为引入某个管理器而静默改掉既有约定。

## 4. Git 与已有验证工具直接复用，薄适配只补缺口

Git 已提供脚本友好的状态和差异能力：`git status --porcelain=v2 -z` 可区分索引、工作区和未跟踪路径；`git diff` 与 `git diff --cached` 对应不同差异范围。[git-status](https://git-scm.com/docs/git-status)、[git-diff](https://git-scm.com/docs/git-diff) 调用时需按所用选项验证实际范围；没有 Git 的目录采用文件清单和内容标识，不能假造提交基线。

| 仍需由本项目定义/适配 | 可复用底座 | 应产生什么 |
| --- | --- | --- |
| 项目发现和受检状态 | Git、文件系统、现有包管理器/任务入口；按需 mise | 路径映射、实际版本、已改/新增文件、源码与配置内容标识；区别工作区与索引 |
| 产物结构和引用检查 | Markdown/链接检查；明确采用结构化元数据后再选解析器与 schema 验证器 | 必要章节、实际引用、缺失目标与未解析项；逐条 AC/Task/证据关联、重复 ID、依赖环仅在项目确需该粒度时增加 |
| 验证执行和证据记录 | 仓库已有测试、构建、类型检查、lint 命令与原生报告 | 命令/目录、实际退出结果、受检状态、必要环境说明、原始报告位置、未执行范围；沿用已有活动记录，不另设强制 run 台账 |
| 受控产物写入 | 文件操作和已有模板 | 核对当前修订、保留并发修改、避免重复追加；不自动采纳 ADR 或宣告 Task 语义完成 |

这四类是方法需明确的边界，不预设四个待开发模块。现有测试工具若已能输出 JUnit/JSON/HTML 等报告，保留原始报告，在既有记录补必要上下文与引用；不要把所有报告转换成另一套可独立编辑的权威结果。

项目明确维护逐项关联时，确定性检查可以判断“AC-3 没有任何测试/验证引用”，但不能判断“引用的测试充分覆盖 AC-3”；后者仍需 Agent/审查者读取要求、实现和实际结果。架构/代码依赖检查优先复用仓库已有机制，不把代码依赖图与 Plan Task 依赖图混为一类。

## 5. 核验基线与许可证

以下固定提交均经官方 GitHub API/文件核验；提交表示本次阅读基线，不是建议直接安装开发分支。许可证结论来自仓库正文，未仅使用 GitHub 自动识别标签。发布与在线文档读取日期均为 2026-09-15。

| 项目 | 固定读取提交 | 许可证与相关注意 |
| --- | --- | --- |
| mise | [55d3b4fc789d](https://github.com/jdx/mise/tree/55d3b4fc789d76fbaa486cb523f92cc974ce67c7) | [MIT](https://github.com/jdx/mise/blob/55d3b4fc789d76fbaa486cb523f92cc974ce67c7/LICENSE) |
| check-jsonschema | [d86c4c6736ee](https://github.com/python-jsonschema/check-jsonschema/tree/d86c4c6736ee4d6ea40765d34bd924630d88d6fd)；文档 0.38.0 | [Apache-2.0](https://github.com/python-jsonschema/check-jsonschema/blob/d86c4c6736ee4d6ea40765d34bd924630d88d6fd/LICENSE)；内置第三方 schema 等随具体分发文件核对 |
| markdownlint-cli2 | [55d5a6c74127](https://github.com/DavidAnson/markdownlint-cli2/tree/55d5a6c74127a24f4c369611ee0d3e972b7097ab) | [MIT](https://github.com/DavidAnson/markdownlint-cli2/blob/55d5a6c74127a24f4c369611ee0d3e972b7097ab/LICENSE) |
| lychee | [4e065481e857](https://github.com/lycheeverse/lychee/tree/4e065481e8571d0b270c5f4e2332b74cc8342758)；CLI 文档声明基于 0.24.2 | [MIT OR Apache-2.0](https://github.com/lycheeverse/lychee/tree/4e065481e8571d0b270c5f4e2332b74cc8342758#license) |
| MADR | [ba75bb1b20d4](https://github.com/adr/madr/tree/ba75bb1b20d42af5746b246ad348c202419ae681)；develop 阅读基线 | [MIT OR CC0-1.0](https://github.com/adr/madr/blob/ba75bb1b20d42af5746b246ad348c202419ae681/LICENSE) |
| adr-tools | [b3279baf9be2](https://github.com/npryce/adr-tools/tree/b3279baf9be2207d1a4f4bbd608fd0b591c72aee)；默认分支最后提交日期 2020-03-30 | [程序 GPL-3.0-or-later；工具添加到项目的内容 CC BY 4.0](https://github.com/npryce/adr-tools/blob/b3279baf9be2207d1a4f4bbd608fd0b591c72aee/LICENSE.txt) |
| pre-commit | [a9bba55a3f74](https://github.com/pre-commit/pre-commit/tree/a9bba55a3f74068b53f4bd4d831d7e05e34eae6c) | [MIT](https://github.com/pre-commit/pre-commit/blob/a9bba55a3f74068b53f4bd4d831d7e05e34eae6c/LICENSE)；调用的 hooks 各有自己的许可证 |
| Lefthook | [1e23553eec23](https://github.com/evilmartians/lefthook/tree/1e23553eec2392753c5420d348e63a63f517cd45) | [MIT](https://github.com/evilmartians/lefthook/blob/1e23553eec2392753c5420d348e63a63f517cd45/LICENSE) |

## 6. 最小试点的通过条件

选一个真实变更，用已有命令运行本地验证，再检验以下情况：必要章节缺失和断链能定位；旧证据不会被当成当前结果；失败和未执行可区分；冲突写入不覆盖新内容；Markdown 结构通过不会直接将 Task 标为完成。项目采用逐项 ID/依赖图时再测重复 ID 和依赖环。后续启用 hooks 时再加入部分暂存、新增文件和现有 hooks 共存场景。

本次完成来源与功能边界核验；跨平台安装、中文标题锚点、当前模板解析、部分暂存快照、性能与报告兼容性均需试点验证。

<a id="quality-method-evals"></a>

## 7. 按需质量检查与方法评估

以下五项是按项目技术栈和检查缺口选用的补充，不加入通用插件的强制依赖。能力、源码与许可证读取日期为 2026-09-15，均未安装或运行；固定提交为阅读基线。

| 工具与类别 | 可覆盖的需求、引入条件 | 必须保留的边界 | 源码/许可证基线 |
| --- | --- | --- | --- |
| [Semgrep CE](https://semgrep.dev/products/community-edition/)：静态代码模式与规则检查 | 项目语言受支持且存在可编码的禁用 API、安全模式、项目代码规则时，复用 CLI 和自定义规则；可将部分 ADR 规则落实为检查 | 命中是静态发现，未命中不证明没有漏洞或业务符合。CE 引擎与商业平台、规则包分别核验，不把付费分析能力算入 CE | [0516c0f23a3d，引擎 LGPL-2.1](https://github.com/semgrep/semgrep/blob/0516c0f23a3dceac5c8f5ff3fecd402af4450182/LICENSE)；Semgrep 维护的规则另见下文 |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)：代码架构依赖规则 | JS/TS 等支持的项目需要禁止跨层导入、检测循环依赖或约束模块边界时，根据 ADR 编写规则并输出违规报告 | 检查可解析的代码依赖，不是业务架构正确性证明；不检查 `plan.md` 的 Task 依赖，也不替代 Codegraph 的通用调查角色 | [ab42c712c045，MIT](https://github.com/sverweij/dependency-cruiser/blob/ab42c712c045a2ea5b78d1cd33defd1ecd0ec880/LICENSE) |
| [Schemathesis](https://schemathesis.readthedocs.io/en/stable/)：API 性质与契约测试 | 已有 OpenAPI/GraphQL schema 和可测试服务时，从 schema 生成性质测试、边界输入，并按可发现关系执行有状态请求序列 | 需要可控测试数据、鉴权和清理；schema 或生成关系不完整会限制覆盖。schema 一致性与异常发现不能代替特定业务 AC 的场景断言 | [56ab32b1b10a，MIT](https://github.com/schemathesis/schemathesis/blob/56ab32b1b10a8509a17c66ca63eb448efd731d95/LICENSE) |
| [Playwright](https://github.com/microsoft/playwright)：浏览器 UI 测试 | 有 Web 用户流程且现有测试不足时，用浏览器操作与断言验证场景；保留原生报告及 [trace](https://playwright.dev/docs/trace-viewer) 作为定位证据 | 要映射具体 AC、数据和运行环境；截图或操作完成本身不是验收。Mock、浏览器覆盖和外部集成范围必须写清 | [500c9c822ce7，Apache-2.0](https://github.com/microsoft/playwright/blob/500c9c822ce7664539a4c8a88810048dfe090c3b/LICENSE) |
| [promptfoo](https://www.promptfoo.dev/docs/getting-started/)：Agent 方法/提示回归评估 | 方法包有可重复案例后，比较 Skill/提示版本；通过 [自定义 provider](https://www.promptfoo.dev/docs/providers/custom-script/) 接入执行器，用 [确定性断言、定制检查或评分规则](https://www.promptfoo.dev/docs/configuration/expected-outputs/)评估输出与已接入的行为 | 它不自动复现任意宿主、持久工作区和多 Agent 协作；真实文件修改、恢复、交接、重复动作等须由适配器实际执行并检查。模型评分需校准，不能替代真实结果 | [29a15d1edb25，MIT](https://github.com/promptfoo/promptfoo/blob/29a15d1edb256c789d0035ce3f36ad7cf91db6bb/LICENSE) |

**Semgrep 分发边界：**官方说明引擎保持 LGPL-2.1，Semgrep 维护的规则采用 Semgrep Rules License v1.0，具有使用范围限制。[官方说明](https://semgrep.dev/blog/2024/important-updates-to-semgrep-oss/) 因为本项目未来会包装插件，规则包不能仅凭引擎许可证就被直接打包；可先调用项目已有配置或自行编写的规则，具体分发再核验所选规则许可证。

**方法评估的最小案例建议：**为 promptfoo 准备“缺少输入时保留未知”“发现 ADR 冲突时返回正确步骤”“旧证据不算当前通过”等输入与可检查结果；先比较单节点产物和判断。随后用真实临时仓库演练代码修改、独立审查、失败修正和中断恢复，再由适配器交回实际文件/命令结果。只对一段最终回复评分，不能声称验证了整个 Loop/Graph 协作。

这五类结果可以成为 `evidence/` 的证据，前提是记录版本、范围和实际执行，并说明对应的要求或方法案例。任何工具的统一“通过”都不能直接替代整个变更的完成判断。

<a id="a1-validation"></a>

## 8. A1 定向复核与首轮处理（2026-09-16）

本节是来源阅读结论，未运行安装、项目检查或效果评测。沿用原生检查作为基线，新增小型检查器列为待测；首轮不建设统一评估平台。

| 对象 | 本次固定来源 / 许可 | 实际覆盖与未知项 | 适配、维护与退出；A1 处理 |
| --- | --- | --- | --- |
| 项目原生命令、报告、环境 | 目标项目尚未选定，版本和许可在 A2 登记 | 项目已有测试/lint/build 为第一入口；真实命令、环境和基线失败仍未知 | 沿用；保留原始报告和工作区标识，避免第二套 runner。不能用本方法仓库的文件检查代替项目验证 |
| markdownlint-cli2 | [55d5a6c74127 的 package](https://github.com/DavidAnson/markdownlint-cli2/blob/55d5a6c74127a24f4c369611ee0d3e972b7097ab/package.json)：0.23.2、Node ≥22；MIT，许可见第 5 节 | Markdown 规则已核验；本项目模板、规则冲突与报告消费未测，不能证明章节语义 | **入围待测**，仅在无等价现有工具时引入；先关闭自动修复。小型配置可移除，文档原文保留；Node 要求计入成本 |
| lychee | [4e065481e857 的 Cargo](https://github.com/lycheeverse/lychee/blob/4e065481e8571d0b270c5f4e2332b74cc8342758/Cargo.toml)：0.24.2；MIT OR Apache-2.0 | [官方 CLI](https://lychee.cli.rs/guides/cli/)的 `--offline` / `--include-fragments` 可用于本地与片段检查；中文锚点、显式 anchor、鉴权页面和网络失败判定未测 | **入围待测**，与 Markdown 检查分工；复用已有等价工具时跳过。维护排除规则，不能用宽泛忽略让坏链接“通过”；移除后仍是标准链接 |
| promptfoo | [37608b614c87 的 package](https://github.com/promptfoo/promptfoo/blob/37608b614c87bba1cf858e4be0bb08693519e661/package.json)：0.123.0、Node ≥22.22.0；[MIT](https://github.com/promptfoo/promptfoo/blob/37608b614c87bba1cf858e4be0bb08693519e661/LICENSE) | [exec provider](https://github.com/promptfoo/promptfoo/blob/37608b614c87bba1cf858e4be0bb08693519e661/site/docs/providers/custom-script.md)把 stdout 作为输出；结构化返回和真实副作用仍需匹配的 provider/执行器。不能自动复现任意宿主 | **条件候选**：A3/A4 先积累真实案例，反复比较配置的成本足够高时再引入；保留独立于平台的案例和原始结果，避免为首轮先写执行平台 |

其余处理：MADR 只参考内容；mise、schema 验证器及专项 QA 工具按真实缺口选择；保留已有 hook 管理器，不新增强制提交链。第 5/7 节的源码基线仍用于这些条件候选，未宣称它们在 9 月 16 日又全部复核或运行过。

**成熟度与质量判断：** 三个新增候选都有明确代码、许可和配置入口；这支持进入评估，不能据此宣布跨平台稳定或本项目兼容。A2 固定可安装版本并核对与阅读提交的差异；A3 测文档案例，A4 用有效实现、失败、恢复和权限案例判断完整流程。新增运行时、配置升级和人工修正均计入成本；无可测收益时保留现有工具即可。统一案例和状态见[首轮试验安排](../../docs/tools/existing-tools-reuse-plan.md#a1-trials)。
