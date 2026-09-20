# 本地执行、审查与 Agent 协作：已有工具复用调查

[总览与下一步](../../README.md) · 研究依据 · 能力核验不等于已入围或采用 · [研究索引](../README.md)

初次核验：2026-09-15；A1 定向复核：2026-09-16，见[第 6 节](#a1-hosts)。范围为 Plan 之后的本地代码生成、验证、独立审查与恢复；只读取第一方仓库、代码和文档，未安装、运行或比较模型效果。下列“适配建议”是本项目判断，不能当作工具已实现能力。

## 1. 结论

**首轮先核验已有宿主；本项目优先建设可移植的方法、证据脚本和薄适配层。** 目标项目的宿主、版本和有效配置尚未核验，不能先断言它已覆盖全部需求。不需要先开发一个 Agent 宿主，也不需要把下面五种候选叠加安装。

- **完整宿主候选：OpenCode。** 现有 Agent Skills、自定义 Agent、子会话、权限、非交互执行和会话导出与本项目分工较吻合。
- **小核心宿主候选：Pi。** 更适合希望控制执行边界、保持极小核心的团队；子 Agent 等是扩展能力，所需适配工作更多。
- **Goose：按需替代宿主。** 当方法需要大量 MCP 工具及参数化配方复用时重点评估；其子 Agent 与审批模式限制须先验证。
- **Aider：局部实施工具候选。** 可用于验证明确、文件范围有限的改动；不能把 architect/editor 分工作为独立审查。
- **OpenHands SDK：后续可编程执行候选。** 当需要服务化、容器工作区、事件记录和恢复时再比较；Agent Canvas 是更上一层产品，首版无需引入。

本节是候选能力概览，列序不表示入围排名。A1 的首轮必要性判断见[第 6 节](#a1-hosts)，统一入围状态以[工具选型页](../../docs/tools/existing-tools-reuse-plan.md)为准。

## 2. 核验基线与许可证

以下为 2026-09-15 的核验基线，由 GitHub API 读取默认分支 HEAD 后核对相应源码；在线文档可能比提交更新。9 月 16 日新增证据另列于第 6 节，不把新能力追记为旧版本已支持。正式试点应固定一个发布版本，再做能力检查，不能混用稳定版与开发版配置。

| 项目及当前官方仓库 | 核验提交 | 仓库许可证 | 位置和变化 |
|---|---|---|---|
| [OpenCode](https://github.com/anomalyco/opencode) | [`e03db9bc6908`](https://github.com/anomalyco/opencode/commit/e03db9bc6908f75c9334d8aa997deeaac81c0298) | [MIT](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/LICENSE) | 默认分支为 `dev`；文档同时存在常规版和 `/v2/`，本调查能力描述优先依据常规文档 |
| [Pi](https://github.com/earendil-works/pi) | [`8a7b0c03dfb7`](https://github.com/earendil-works/pi/commit/8a7b0c03dfb702663acafb6dc29f8acaa4ffe391) | [MIT](https://github.com/earendil-works/pi/blob/8a7b0c03dfb702663acafb6dc29f8acaa4ffe391/LICENSE) | 旧 `badlogic/pi-mono` 已重定向至此 |
| [Goose](https://github.com/aaif-goose/goose) | [`a23a8cd5b138`](https://github.com/aaif-goose/goose/commit/a23a8cd5b138954bc8962cba623c2d8ecd375512) | [Apache-2.0](https://github.com/aaif-goose/goose/blob/a23a8cd5b138954bc8962cba623c2d8ecd375512/LICENSE) | 旧 `block/goose` 已重定向至此 |
| [Aider](https://github.com/Aider-AI/aider) | [`5dc9490bb35f`](https://github.com/Aider-AI/aider/commit/5dc9490bb35f9729ef2c95d00a19ccd30c26339c) | [Apache-2.0](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/LICENSE.txt) | 本次读到的 HEAD 提交日期为 2026-05-22；未据此断言停维 |
| [OpenHands Software Agent SDK](https://github.com/OpenHands/software-agent-sdk) | [`b054a2fe9917`](https://github.com/OpenHands/software-agent-sdk/commit/b054a2fe99173baee47897e4f3af7a910d3aab1e) | [MIT](https://github.com/OpenHands/software-agent-sdk/blob/b054a2fe99173baee47897e4f3af7a910d3aab1e/LICENSE) | 当前 Python SDK、Agent Server 及 TypeScript 客户端；[主仓库](https://github.com/OpenHands/OpenHands/tree/82203bb1011cdf0e6eb318a32111806a6f6f734a)当前为 Agent Canvas |

## 3. 能力、缺口与本地边界

### OpenCode：可替换宿主候选

**原生能力：** 主 Agent 与子 Agent、自定义角色提示和工具权限；子 Agent 有可导航的子会话；按需加载 `SKILL.md`；CLI 可以非交互运行、接续或分叉会话、输出 JSON 事件、导出会话。可用 SDK、插件和自定义工具连接验证脚本。[Agents](https://opencode.ai/docs/agents/)、[Skills](https://opencode.ai/docs/skills)、[CLI](https://opencode.ai/docs/cli/)、[Custom tools](https://opencode.ai/docs/custom-tools/)

**需要适配：** 创建执行者与只读审查者配置，显式传入 Task ID、原始 Spec/ADR、受检代码状态和证据位置；将宿主事件整理为项目验证记录。子会话具备上下文分隔机制，但是否只收到预期输入、是否保留必要原文，需要试点确认；主 Agent 内切换角色不能自动视为独立审查。

**边界：** `ask/allow/deny` 是工具权限配置；应按本项目既有授权设置。会话接续不证明代码基线未变。工作区隔离通过明确的工作目录和 Git worktree 适配，不能把“创建子 Agent”视为自动创建独立工作树。常规文档中的 `plan` 是宿主模式名，不是本项目 `plan.md` 的语义定义。[Permissions](https://opencode.ai/docs/permissions/)、[CLI](https://opencode.ai/docs/cli/)

### Pi：适合小核心和显式扩展

**原生能力：** 文件读写、编辑、shell 工具循环；Agent Skills、提示模板、TypeScript 扩展、包分发；交互、JSON、RPC 与 SDK 接入；会话自动保存，支持接续和分支。[Coding-agent README](https://github.com/earendil-works/pi/blob/8a7b0c03dfb702663acafb6dc29f8acaa4ffe391/packages/coding-agent/README.md)、[Sessions](https://github.com/earendil-works/pi/blob/8a7b0c03dfb702663acafb6dc29f8acaa4ffe391/packages/coding-agent/docs/sessions.md)

**扩展示例，不是核心默认能力：** 官方仓库提供 subagent 扩展示例，以独立 Pi 子进程隔离上下文，支持单个、并行和链式调用，附带 reviewer 等角色。MCP、子 Agent 与 plan mode 不应写成开箱即用能力。可先使用官方示例验证执行者→审查者交接，再决定是否维护适配包。[Subagent example](https://github.com/earendil-works/pi/blob/8a7b0c03dfb702663acafb6dc29f8acaa4ffe391/packages/coding-agent/examples/extensions/subagent/README.md)

**边界：** Pi 没有内建限制文件、进程、网络和凭据访问的权限系统，默认继承启动进程权限。项目资源信任提示也不等于逐动作权限或隔离沙箱。需要的执行边界由外部容器/沙箱或扩展负责；独立子进程也不等于独立文件系统。[官方 Permissions & Containerization](https://github.com/earendil-works/pi#permissions--containerization)

### Goose：MCP 与可复用配方较完整

**原生能力：** 本地 CLI/桌面宿主与 MCP 扩展；recipe 可定义指令、参数和扩展配置；支持独立子 Agent 的串行或并行调用、session 保存与接续。配方适合包装我们的阶段入口，传入现有变更目录和 Task ID。[README](https://github.com/aaif-goose/goose/blob/a23a8cd5b138954bc8962cba623c2d8ecd375512/README.md)、[Recipe reference](https://github.com/aaif-goose/goose/blob/a23a8cd5b138954bc8962cba623c2d8ecd375512/documentation/docs/guides/recipes/recipe-reference.md)、[Sessions](https://github.com/aaif-goose/goose/blob/a23a8cd5b138954bc8962cba623c2d8ecd375512/documentation/docs/guides/sessions/session-management.md)

**关键限制：** 本次核验的官方 subagent 文档明确：子 Agent 在 autonomous 权限模式启用，在 manual approval、smart approval、chat-only 模式禁用；默认继承父会话扩展，可用 recipe 收窄。失败或超时可能没有该子 Agent 输出，汇合必须识别缺失结果，不能按成功节点推断全部通过。[Subagents](https://github.com/aaif-goose/goose/blob/a23a8cd5b138954bc8962cba623c2d8ecd375512/documentation/docs/guides/context-engineering/subagents.mdx)

**需要适配：** 核对被传递的上下文、将审查节点限制为必要工具、补齐基线与证据引用；不为使用子 Agent 而改动项目既定审批边界。recipe 定义可重复执行的方法，任务业务状态仍回写 `plan.md`。源码版本存在演进，试点首先验证以上模式限制是否仍适用。

### Aider：范围明确的编辑—检查循环

**原生能力：** repo map、文件编辑；可配置 lint/test 命令并尝试修正失败；CLI 脚本方式可传入一次性消息；支持只讨论的 ask 模式及 architect→editor 两阶段生成。[Linting and testing](https://aider.chat/docs/usage/lint-test.html)、[Scripting](https://aider.chat/docs/scripting.html)、[Chat modes](https://aider.chat/docs/usage/modes.html)

**关键适配：** 默认会自动提交自身修改，也可能先提交既有 dirty files；默认 Git 提交跳过 pre-commit。当前项目终点是本地改动，试点需关闭 auto commits 与 dirty commits；未来启用提交时另核对 `git-commit-verify`，不能假定 hooks 自然会运行。[Git integration](https://aider.chat/docs/git.html)

**边界：** architect/editor 分工负责方案到编辑转换，不提供我们要求的独立审查结论。需要外部新会话/另一审查节点，补齐证据记录和恢复校验。更适合作为有限范围执行候选，首版不建议叠在另一个写代码宿主之下，除非实测存在收益。

### OpenHands：SDK 与产品层分开评估

**原生能力：** SDK 提供 Agent、工具、会话、事件和工作区；可在本地目录运行，也可经 Agent Server 使用 Docker/Kubernetes 工作区；支持 MCP、Skills、结构化结果和动作确认策略。[SDK overview](https://docs.openhands.dev/sdk)、[源码定位](https://github.com/OpenHands/software-agent-sdk/blob/b054a2fe99173baee47897e4f3af7a910d3aab1e/README.md)、[Security](https://docs.openhands.dev/sdk/guides/security)

**恢复与协作：** 会话可按 ID 和持久化目录恢复，记录状态、事件及工具输出；TaskToolSet 提供独立子会话和按 ID 接续，当前文档描述其为同步阻塞调用，不能据此宣称自动并行协作。[Persistence](https://docs.openhands.dev/sdk/guides/convo-persistence)、[Task Tool Set](https://docs.openhands.dev/sdk/guides/task-tool-set)

**边界：** 配置了本地 workspace 并不自动获得容器隔离；保存会话也不等于给任意工作区做了可恢复快照。SDK 示例中的 TaskTrackerTool 是可选工具，不采用它作为第二份项目任务清单。Agent Canvas 管理多后端和自动化的产品层较重，本地单任务试点优先复用已有 CLI；需要程序编排时再接 SDK。[SDK README](https://github.com/OpenHands/software-agent-sdk/blob/b054a2fe99173baee47897e4f3af7a910d3aab1e/README.md)、[Agent Canvas](https://github.com/OpenHands/OpenHands/tree/82203bb1011cdf0e6eb318a32111806a6f6f734a)

## 4. 如何组合而不重复建设

| 层面 | 复用选择 | 本项目仍需负责 |
|---|---|---|
| 执行宿主 | 现有宿主作为对照；OpenCode / Pi / Goose / Aider / OpenHands SDK 按实际需求统一筛选 | 能力检测与适配配置，不复制宿主运行时 |
| 方法 | 现有 Intent/Spec/Plan/实施/审查 Skills，共用模板与引用 | 产物语义、输入读取、完成判断、回退规则 |
| 确定性工具 | 仓库测试、lint、构建；搜索/代码图；Git 状态与 worktree | 输出规范、真实结果记录、依赖和版本检查 |
| 任务与证据 | `plan.md` + `evidence/`，宿主 session ID 仅作恢复引用 | Task ID 对齐，受检状态，失败原因与下一步 |
| 独立审查 | 同一宿主的新上下文及只读角色，或第二个独立进程 | 原始要求与实际差异必须直读；语义审查标准、发现处理与复查 |

以上组合不需要增加项目任务库。宿主内部临时 todo 如无法关闭，应仅作当前执行的派生视图；禁止成为另一个由人/Agent独立维护的事实源。

**跨宿主复用分两层：** Markdown 方法和普通 CLI 脚本先复用；只有宿主特有的子 Agent、权限、事件、接续 API 留在 adapter。ACP 标准化编辑器/客户端与 Agent 的通信；OpenCode 已有 ACP 接入，适合以后复用客户端，但 ACP 不自动统一任务语义、审批语义或不同宿主的会话恢复。官方仍将完整远端支持列为进行中。[ACP introduction](https://agentclientprotocol.com/get-started/introduction)、[OpenCode ACP](https://opencode.ai/docs/acp/)

## 5. 最小试点判据

先在同一小型真实变更上核验已有宿主。只有观察到必要缺口，或后续需要验证跨宿主适配时，才用候选复跑同一方法；首轮不强制接入第二宿主。

1. 从已有 `plan.md` 指定一个 Task，直接读取适用 Spec、ADR、As-Is 和原始代码。
2. 生成代码与必要测试，保留用户已有修改，调用仓库实际检查。
3. 独立审查收到原始依据、完整受检状态和证据；能报告方案偏差，而不只是编辑者摘要中的问题。
4. 中断一次并修改一项上游输入；恢复必须识别变化并复核，不能按旧会话宣告完成。
5. 注入一次必要检查失败、一次缺失检查结果；两者均不能被标为 Task 完成。
6. 记录适配代码量、错误完成次数、漏检、修正轮数、时长与成本；用结果决定是否换宿主或增加并行。

这些是待执行的验收场景，本次调研没有实测结果。候选均能服务本地流程，未把只接受远端 PR 的审查服务纳入本地审查基线。

<a id="a1-hosts"></a>

## 6. A1：首轮宿主必要性与定向复核

**研究建议：已有宿主作为唯一必测基线；OpenCode 保留为有条件替代；Pi、Goose、Aider、OpenHands SDK 后置。** 这是按当前本地 MVP 需求作出的投入判断，不是运行效果排名或最终采用决定。五个新增候选均没有本项目质量实测证据；研究充分、功能多或源码更新较近，都不构成替换理由。

### 6.1 本轮证据版本

2026-09-16 重新读取五个官方仓库默认分支 HEAD，并按下表固定提交读取文档、源码和许可证。OpenCode、Aider 与前日相同；另三项已变化。下文“文档声明”与“源码核验”只证明对应入口的机制，均不等于目标项目配置或行为已通过测试。在线文档仅用于发现，影响本轮结论的证据均链接到固定提交。

| 候选 | 本轮固定提交 | 许可证 | 本轮新增核验范围 |
| --- | --- | --- | --- |
| OpenCode | [`e03db9bc6908`](https://github.com/anomalyco/opencode/commit/e03db9bc6908f75c9334d8aa997deeaac81c0298) | [MIT](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/LICENSE) | 安全模型、Task 子会话、MCP 范围、文件快照限制 |
| Pi | [`60e7e76bd7ea`](https://github.com/earendil-works/pi/commit/60e7e76bd7ea25cad1dd6f3f1ce0d18814a42759) | [MIT](https://github.com/earendil-works/pi/blob/60e7e76bd7ea25cad1dd6f3f1ce0d18814a42759/LICENSE) | 内建权限/MCP 边界、官方子 Agent 示例的目录与持久化 |
| Goose | [`960546910971`](https://github.com/aaif-goose/goose/commit/9605469109718205097b49b88682d6bf1d112d06) | [Apache-2.0](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/LICENSE) | 子 Agent 审批模式与委派实现、目录和扩展继承 |
| Aider | [`5dc9490bb35f`](https://github.com/Aider-AI/aider/commit/5dc9490bb35f9729ef2c95d00a19ccd30c26339c) | [Apache-2.0](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/LICENSE.txt) | 自动提交、dirty 提交与 hooks 默认值 |
| OpenHands SDK | [`22c85eb0e0db`](https://github.com/OpenHands/software-agent-sdk/commit/22c85eb0e0db8f4386380d095e9fe6933af2e65f) | [MIT](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/LICENSE) | Task/Delegate 差异、子审批回调、共享目录和会话持久化 |

许可证列只标明仓库代码许可；模型服务、外部 MCP 服务及新增依赖仍按实际接入核验。维护成熟度在此用“现成入口 / 官方示例 / 需编程接入”表达，不以星数、提交数量或单个 HEAD 日期替代稳定性实测。

### 6.2 会改变入围判断的补充事实

1. **OpenCode：工具批准与隔离必须分开。** 固定版本的安全说明明确，权限系统服务交互批准，不提供安全隔离，外部 MCP 服务也在其信任边界之外。Task 源码创建独立子 session，向其传入任务 prompt，并支持通过 `task_id` 接续；该入口没有自动创建独立工作树。因而适合配置独立审查上下文，但“只读角色”和“独立工作区”仍须分别核验。[安全模型](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/SECURITY.md)、[Task 实现](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/tool/task.ts)

   OpenCode 已有文件快照能力，不能写成“只有聊天恢复”；但源码仅对 Git 项目启用，受配置、忽略规则及大体积未跟踪文件筛选影响。会话 export/continue 也不能替代外部服务、环境和所有文件的恢复。MCP 支持按 Agent 收窄工具，文档提示工具会增加上下文占用；需用目标项目的实际服务器验证工具列表、传输、认证与调用结果。[快照实现](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/snapshot/index.ts)、[固定版 CLI 文档](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/web/src/content/docs/cli.mdx)、[固定版 MCP 文档](https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/web/src/content/docs/mcp-servers.mdx)

2. **Pi：小核心把必要扩展的维护责任留给接入方。** README 仍明确没有限制文件、进程、网络或凭据的内建权限系统；MCP、子 Agent 与逐动作确认均由扩展或外部环境提供。官方子 Agent 示例确实启动独立进程，但默认 `cwd` 沿用父目录，且显式传入 `--no-session`。因此不能把主会话的保存/分支能力外推到该示例的子任务恢复，更不能把进程上下文独立当作文件系统隔离。[权限说明](https://github.com/earendil-works/pi/blob/60e7e76bd7ea25cad1dd6f3f1ce0d18814a42759/README.md#permissions--containerization)、[核心范围](https://github.com/earendil-works/pi/blob/60e7e76bd7ea25cad1dd6f3f1ce0d18814a42759/packages/coding-agent/README.md#philosophy)、[子 Agent 源码](https://github.com/earendil-works/pi/blob/60e7e76bd7ea25cad1dd6f3f1ce0d18814a42759/packages/coding-agent/examples/extensions/subagent/index.ts#L300)

3. **Goose：子 Agent 审批限制仍是条件，而非推测。** 本轮固定版文档仍声明子 Agent 只在 autonomous 模式启用，在 manual approval、smart approval、chat-only 禁用。`summon` 的同步及异步委派实现均硬编码 `GooseMode::Auto`，注释说明子 Agent 的审批请求尚不能转发给父会话。源码证实子审批链存在限制；各前端在其他模式是否隐藏或拒绝委派入口仍需实测，不把文档描述写成已执行结果。[子 Agent 文档](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/documentation/docs/guides/context-engineering/subagents.mdx)、[同步委派](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/crates/goose/src/agents/platform_extensions/summon.rs#L1393)、[异步委派](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/crates/goose/src/agents/platform_extensions/summon.rs#L2068)

   文档的扩展默认继承父 Agent；源码新建的是 Agent 实例及会话，默认工作目录沿用父目录，`working_dir` 参数要求位于父目录内。不能据文档的“process isolation”措辞宣称每个子任务都拥有操作系统沙箱或独立工作树。必要审批无法保留时，受影响委派改为主会话受控执行、单独审查会话或人工接续；不为使用子 Agent 而放宽项目授权。[委派目录与 session](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/crates/goose/src/agents/platform_extensions/summon.rs#L610)、[Agent 实例与输入](https://github.com/aaif-goose/goose/blob/9605469109718205097b49b88682d6bf1d112d06/crates/goose/src/agents/subagent_handler.rs#L139)

4. **Aider：默认提交结论仍成立，但可通过配置消除。** 参数源码中 `auto-commits=True`、`dirty-commits=True`、`git-commit-verify=False`；提交实现会在后者关闭时加 `--no-verify`。首版本地交接可关闭前两项，不能因为默认值不同就认定工具无法使用。后置理由是它主要补编辑循环，与已有宿主重复，而独立审查、输入变更复核和证据仍需其他节点承担；不是许可证或默认提交构成硬性淘汰。[参数默认值](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/args.py#L439)、[提交实现](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repo.py#L277)

5. **OpenHands SDK：不能由 Task 的限制推断整个 SDK。** Task 入口仍为阻塞执行，但 `DelegateExecutor` 有多线程并行入口。两者均为子会话传入父 `working_dir`；`LocalWorkspace` 直接访问宿主文件与命令环境。两种子任务执行器在缺少 `confirmation_handler` 时，遇到待确认动作会直接继续运行；仅继承父 confirmation policy 不足以证明保留人工批准，接入方须提供并验证回调。[Task 执行器](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-tools/openhands/tools/task/impl.py)、[Task 目录与确认](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-tools/openhands/tools/task/manager.py)、[Delegate 执行器](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-tools/openhands/tools/delegate/impl.py)、[LocalWorkspace](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/workspace/local.py)

   持久化示例通过同一 `conversation_id`、`persistence_dir` 和工作目录重新构造会话；它没有把工作目录恢复为历史状态。Task 子会话使用父持久化目录或临时目录，跨进程恢复与工作区恢复必须分别验证。其 MCP、容器和事件能力值得在程序接入确有必要时使用，但首轮不能为了拥有这些入口而自建编排运行时。[持久化示例](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/examples/01_standalone_sdk/10_persistence.py)、[子会话持久化](https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-tools/openhands/tools/task/manager.py#L129)

### 6.3 同口径的首轮必要性与成本判断

以下成本均为基于接口形态的相对估计，尚无适配工时或质量测量；人工审核和修正计入完整流程。原生子 Agent、MCP 和自动恢复并非独立于业务需要的硬性入围门槛：新会话、普通文件/CLI、人工接续可以承担相应步骤，但必须达到相同质量要求。

| 宿主 | 首轮处理及相对现状的理由 | 最小适配与持续维护 | 重复依赖与退出成本 | 进入或复评条件 |
| --- | --- | --- | --- | --- |
| 已有宿主 | **唯一必测基线**；先检验已在使用的执行路径，无证据表明需要替换 | 核对实际版本、配置与能力；映射原文输入、独立审查和证据 | 不预增宿主；普通 Markdown、CLI 和证据文件可继续使用；现有专属会话的迁移能力未知 | A2 获得实际能力记录；不足仅降级相关动作，必要时采用人工语义审查 |
| OpenCode | **有条件替代**；同一产品已有权限入口、子会话、MCP 和 CLI，具备测试替换的接口依据 | 配置审查角色、动作边界与输入输出；校验版本、MCP 和文件快照边界；相对成本中 | 替换时撤下重复执行入口；方法和文件可带走，会话/插件配置仍专属 | 现有宿主出现配置或人工流程难以补齐的具体质量/能力缺口，且 OpenCode 对应机制值得同题测试 |
| Pi | **后置**；小核心的可塑性尚未对应首轮必需收益 | 子 Agent、MCP、必要确认和子任务持久化依赖扩展；相对维护成本中至高 | 新 CLI 与扩展包；文件可迁移，扩展 API 与会话处理需重做 | 已有 Pi 使用基础，或实测证明小核心/定制扩展能解决明确问题；不要求为首版重建 runtime |
| Goose | **后置**；recipe/MCP 丰富度尚未证明超过现状收益，子审批链需适配 | 配方、扩展最小集、模式与异常结果核验；相对成本中 | 新宿主、recipe 和扩展配置；正文易迁移，会话/审批适配专属 | 实际多 MCP/配方复用需求成立；必要动作审批有可验证的保留或降级办法 |
| Aider | **后置局部执行工具**；范围有限编辑可能有用，当前重复执行循环 | 关闭非本地交接所需提交行为，保留原生检查，外接审查；局部适配低，完整闭环中 | 第二写代码入口带来协调成本；代码、普通检查命令退出容易，审查仍保留原路径 | 同题质量合格后证明有限文件编辑有实际收益，或目标项目原本已用 Aider |
| OpenHands SDK | **后置程序接入候选**；服务化/受管工作区未成为本地 MVP 前置 | SDK 调用、工具注册、确认回调、持久化和工作区生命周期；相对成本高 | Python SDK；采用远端工作区再增加服务/容器依赖；事件和会话类型迁移成本较高 | 现有宿主确实无法满足必要程序接口或工作区管理，且可复用 SDK 解决，无需自建通用运行时 |

“唯一必测基线”不指定厂商，也不把当前研究会话可用的工具当作目标项目已有能力。候选表仅对本轮列举的五个项目判断；目标项目若本来已使用其中之一，应按“已有宿主”行核验，不能因本表后置而强制换掉。

### 6.4 A2 必须确定的试验条件

| A2 需确定的门槛 | 后续 A3/A4 的案例与判据 | 不满足时的局部处理 |
| --- | --- | --- |
| 实际宿主、版本、模型/配置、工具和原生检查入口 | 同一小变更读取原始要求与 ADR，运行真实检查并保存完整本地差异；未知配置不可冒充已支持 | 先补能力记录或调整该入口；不安装全部候选来替代调查 |
| 独立审查的输入和只读范围 | 新上下文直接读原文、未提交及新增文件和证据；不靠实施者摘要判断；人工可审查语义质量 | 新会话或人工审查；没有原生 subagent 不等于无法完成审查 |
| 必要动作控制与实际执行边界 | 对需要限制的具体动作验证允许、拒绝、子调用和 MCP 路径；不把提示语、工具白名单或 worktree 当作系统隔离 | 停用该自动动作并交受控入口/人工执行；仅在案例要求隔离时核验容器或沙箱 |
| 会话和工作区各自的可恢复起点 | 中断后改变一项输入/代码，恢复须识别差异、保存已有修改并重跑受影响检查；缺失子结果不能算通过 | 从文件证据和新会话接续；工作区恢复沿用项目 Git/备份办法，不静默回滚用户修改 |
| 实际 MCP 是否为必要路径 | 只有确需 MCP 才验证服务器身份、版本、传输、认证、工具及拒绝/失败结果；用户已有 **Codegraph** 的具体实现须在项目核对，不能以同名公开项目替代 | 普通文件/CLI 或已验证入口；缺一项连接仅阻塞依赖它的动作 |
| 质量基线与人工参与方式 | 预先选正常交付、漏读要求、检查失败、缺失结果和上游修订样例；质量达标且无已知退化后，再比较总投入 | 先修正方法/配置和结果；保留失败样本，不用时长或 token 优势换取质量下降 |
| 可移植的交接及退出路径 | 方法、原文链接、Plan 与证据保持普通文件；宿主会话 ID 只作辅助引用；撤下适配仍能继续任务 | 将专属 API 留在薄适配；首轮不强制第二宿主，也不把厂商会话设为唯一事实源 |

本节完成的是 A1 的宿主研究与比较依据；A2 尚需具体项目和配置，A3/A4 才能产生质量、恢复及成本实测结论。
