# Claude 原生机制：阶段输入输出与执行控制核验

核验日期：2026-09-16。范围：Claude 官方实时文档与 AI-Native SDLC Playbook；主要为文档研究，后补本机 CLI 版本的只读检查，未运行 Hook、权限绕过或端到端实例。网页描述的版本条件不等于本机已具备该能力。本笔记供阶段设计使用，不修改本项目正式方法、路线图或配置。

## 结论

**Superpowers 可以承载流程指令，但阶段交接需要另有明确产物、证据和判定记录。** “读过 skill”“子 agent 返回”“任务 completed”“进程 exit 0”分别描述不同运行事实，不能互换为业务验收。以下将官方机制与本研究建议分开。

本项目已经明确的本地 MVP 规则仍有效：不强制每步 commit，不新增每步人工批准。Playbook 中的 PO、工程师、发布经理审批与 git 审计链，是其组织级示例，不自动成为本项目规则。

## 1. 六阶段对照：官方要求的最小摘要

Playbook 将六阶段视为非线性循环。以下仅概括其流转，不将它解释为 Claude Code 内置状态机。[官方 Playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)

| 阶段 | 官方示例输入 → 输出 | 交接关注点 |
| --- | --- | --- |
| Plan | 想法、工单、告警 → `intent.md` | 问题、目标、约束；PO 接纳 |
| Design | intent、组织政策 → `spec.md` | 需求与设计、待解决冲突；PO 判断是否进入 Build |
| Build | intent、spec、仓库 → `plan.md` 与实现 | 变更文件、顺序、风险、证明方式；偏离时更新计划 |
| Test | 实现、验证目标 → 测试/构建/视觉证据、eval 结果 | 可执行反馈；保护检查本身不被削弱 |
| Deploy | diff、计划、验证 → 审查与发布记录 | Agent 审查及按风险配置的人类发布门禁 |
| Maintain | 指标、事件 → 诊断、小修 PR 或新 intent | 确定性检测；阶段间独立检查或对抗审查 |

最佳实践强调提供可执行检查、可自足的规格以及实际输出证据；较小且清晰的修改允许省略重规划。因此“每阶段一定新建 agent”与“每步一定提交”都不是该文档的通用要求。[Best practices](https://code.claude.com/docs/en/best-practices)

## 2. 指令、权限与验证不是同一个层面

| 层面 | 官方机制事实 | 阶段设计中的含义（本研究判断） |
| --- | --- | --- |
| 行为指令 | `CLAUDE.md`、auto memory 都作为上下文加载，并非强制配置。[Memory](https://code.claude.com/docs/en/memory#claudemd-vs-auto-memory) | 可写工作流和术语；不能单凭一句“必须”证明动作被阻断 |
| 工具权限 | 权限规则决定调用能否执行；Bash 规则匹配命令形状，例如 `git push` 与 `git -C . push` 不等价。[Permissions](https://code.claude.com/docs/en/permissions#tool-specific-permission-rules) | 文件编辑限制须覆盖 Bash/MCP 等其他写入通道；工具授权不判断需求是否满足 |
| 自动审批 | auto mode 由独立 classifier 检查动作；它仍受适用平台、模型、组织设置等条件限制。[Permission modes](https://code.claude.com/docs/en/permission-modes#eliminate-permission-prompts-with-auto-mode) | 减少重复确认可以用权限设置；不能将 classifier 当功能验收员 |
| 生命周期执行 | 配置匹配的 hook 在事件发生时由宿主调用；具体能否阻断依事件和输出协议而定。[Hooks guide](https://code.claude.com/docs/en/hooks-guide#how-hooks-work) | 运行时触发与检查正确性要分别验证 |

### Skill 字段核验

| 字段/行为 | 当前官方含义 |
| --- | --- |
| `disable-model-invocation: true` | 模型不能调用、description 不进模型上下文；用户可显式调用。不是“用户调用后逐步审批” |
| `allowed-tools` | 调用 skill 的当轮免提示授权；下一条用户消息清除。**不是工具白名单**；未列工具仍走正常权限，deny/ask 优先 |
| `disallowed-tools` | 当轮移除指定工具；下一条用户消息清除 |
| `context: fork` | 新建隔离子 agent，以 skill 内容作任务；不继承会话历史 |
| `agent` | 为上述隔离执行选择 agent 定义；省略时用 general-purpose |
| 已加载 skill | 内容可跨轮保留，但压缩存在保留预算；“已加载”不保证模型持续遵循 |

以上均为 Claude Code skill 机制，不能直接外推为其他宿主的实现。[Skills：字段、权限与隔离执行](https://code.claude.com/docs/en/skills)

## 3. 主/子 agent 的实际交接边界

普通非 fork 子 agent 从委派消息和自身定义开始，不接收主会话历史、已读文件或已调用 skills。`skills` 是全文预加载清单，不是 skill 访问白名单；`disable-model-invocation` 的 skill 不能预加载。普通自定义 agent 加载 CLAUDE.md；当前内置 Explore/Plan 跳过它。会话 fork 则继承主会话上下文，与 skill 的 `context: fork` 不同。[Subagents：启动上下文与预加载](https://code.claude.com/docs/en/sub-agents#what-loads-at-startup)

权限方面，`tools`/`disallowedTools` 控制工具池；未设 `permissionMode` 时继承主会话。主会话为 auto、acceptEdits、bypassPermissions 时，子 agent 的 mode 字段被忽略。主会话为 default、dontAsk、plan 时可采用子 agent 声明的模式，但不能自行升级为 bypassPermissions（该例外注明 v2.1.267 起）。[Subagents：Permission modes](https://code.claude.com/docs/en/sub-agents#permission-modes)

**插件提供的子 agent 忽略 `hooks`、`mcpServers`、`permissionMode` 字段**；需要这些字段时，官方建议把 agent 定义放到项目或用户的 `.claude/agents/`。会话级 settings 不是仅作用于该子 agent 的替代品。不能只看 YAML 就认定限制已生效。[Subagents：Choose the subagent scope 中的 plugin 限制](https://code.claude.com/docs/en/sub-agents)

**本研究建议：** 每次阶段委派显式传入上游产物路径、适用规则、任务范围、输出位置、证据要求和返回结构；不要依赖主 agent “已经知道”。只做审查的 agent 应检查其全部工具通道，不能仅移除 Write/Edit 后仍给予不受限制的 Bash，就声称系统实现了只读。

## 4. Plan mode、持久化计划和运行任务

- Plan mode 允许读取、探索和写计划，通常阻止源文件编辑；可通过批准计划或手动切换离开。当前特殊条件：**交互终端已开放 bypass permissions 时，plan mode 的阻断也不执行**，仅剩规划指令；`-p`、Agent SDK、VS Code chat 保留阻断。[Plan mode 与 bypass 条件](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
- 官方列有 `~/.claude/plans/`，存放 plan mode 形成的计划文件；它属于应用数据并有清理生命周期。由此不能推导“plan mode 可任意写 `docs/**`”。[Claude directory](https://code.claude.com/docs/en/claude-directory#application-data)
- `ExitPlanMode` 是提交计划并离开计划模式的工具；计划批准类 permission prompt 不会因为用户闲置而自动通过。[Tools reference](https://code.claude.com/docs/en/tools-reference)
- 运行期 task list 是待办状态，可跨压缩保留、可按 task-list ID 在会话间共享；`/tasks` 的后台 shell/agent 视图与该待办清单又是两回事。[Interactive mode：Task list](https://code.claude.com/docs/en/interactive-mode#task-list)

**本研究建议：** 仓库 `plan.md` 是可复核的工作安排；Claude 的内部 plan 文件、TaskUpdate 状态和后台进程 ID 是执行状态。建立映射即可，不以内部任务列表替代持久产物。文档生成阶段若需要写多个正式产物，可采用允许指定文档路径写入的正常执行模式；不要以“计划模式”名称推定权限。

## 5. Hook：有强制动作，但没有无条件完成保证

### 按事件选择控制点

| 事件 | 阻断/完成语义 |
| --- | --- |
| `PreToolUse` | 调用前可拒绝动作 |
| `PostToolUse` / `PostToolUseFailure` | 工具已执行/失败；不能回滚已发生动作 |
| `TaskCompleted` | TaskUpdate 完成标记或 teammate 带进行中任务结束时触发；exit 2 阻止完成 |
| `SubagentStop` | 子 agent 响应结束，可要求继续；不表示业务已验收 |
| `Stop` | 主 agent 响应结束；用户中断不触发，连续阻断 8 次后宿主可结束 |
| `StopFailure` | API 错误结束时替代 Stop；无阻断决策权 |

多数事件中，普通 exit 1、hook 启动失败不会阻断；PreToolUse 的 command/http/mcp 超时也不阻断。需要遵守该事件的 exit 2 或合法 JSON 协议。不能把“任意非零码”当门禁。[Hooks reference：退出码、超时与事件](https://code.claude.com/docs/en/hooks)

### “软/硬”需要分开描述

当前支持 command、http、mcp_tool、prompt、agent 类型。prompt 做单次模型判断；agent 可用工具验证，且仍属实验能力。它们的判断不是确定性规则，但有效阻断结论可由宿主执行。因此“模型检查都是软建议”“所有 hooks 都是确定性检查”都不准确。PostToolUse 发生在动作之后；prompt hook 的 `continueOnBlock` 还影响拒绝后是继续还是结束。[Hooks guide：Prompt/Agent hooks](https://code.claude.com/docs/en/hooks-guide#prompt-based-hooks)

**本研究判断：** 把“触发确定”“检查结果确定”“宿主阻断有效”“业务目标满足”拆成四个断言。只把可重复程序检查称作确定性检查；完成判定还应保留外部证据与未完成状态。

### 插件与 wrapper 的组合边界

插件可自动注册生命周期 hook，无需先手动调用某个 skill；应检查插件 `hooks/hooks.json` 或 manifest。[Plugins reference：Hooks](https://code.claude.com/docs/en/plugins-reference#hooks)

所有匹配 hook 并行执行；多个 hook 修改同一工具输入时，最后完成者生效，顺序不确定。[Hooks guide：限制](https://code.claude.com/docs/en/hooks-guide#limitations)

**本研究建议：** 原版 Superpowers 与 wrapper 若都启用，不应假定 wrapper 先执行、原版后执行或原版自动失效。本轮没有检查或修改该插件配置；冲突确认需要核对实际安装版本、加载来源及匹配事件。

## 6. /goal 与程序化输出能证明什么

`/goal` 包装会话级 prompt Stop hook，由独立小模型依据对话中的证据判断 met/not-yet/impossible；evaluator 不自行读文件或运行命令。它不改变权限模式。无进展时可能暂停且 goal 保留；特定不可恢复错误会清除 goal，其他错误可能重试或暂停。目标可恢复，不代表已通过验收。[Goals](https://code.claude.com/docs/en/goal#how-evaluation-works)

`claude -p` 的 exit 0 表示运行成功；`--output-format json` 提供结果及元数据，`--json-schema` 约束 `structured_output` 的形状，其中 `format` 仅为注解。`--bare` 会跳过常规自动发现的 hooks、skills、plugins、CLAUDE.md 等，所需配置必须显式提供。因此“CI 能跑同一命令”不能证明交互场景的配置一并加载。[Programmatic usage](https://code.claude.com/docs/en/headless)

**本研究判断：** schema 可以要求 `status`、`evidence` 字段存在，但不能证明字段内容真实、测试覆盖充分、风险已获授权。成功退出、goal met 和子 agent 返回都应作为运行信息记录，验收另外判断。

## 7. 可供阶段 I/O 设计采用的核验表（本研究建议）

以下为设计建议，不是 Claude 官方内置 schema，也不是本轮对正式方案的修改。

| 项目 | 每个阶段显式传入/产出 | 交接核验 |
| --- | --- | --- |
| 来源 | 上游文件、版本或内容摘要、仓库基线 | 引用存在；输出对应当前输入 |
| 范围 | 阶段目标、允许变更路径、排除项 | 越界项进入异常记录 |
| 上下文 | 适用 skills/规则及版本、需要的事实 | 接收 agent 实际加载；缺失不得默认满足 |
| 产物 | 固定输出位置、必要内容与待决问题 | 内容完整性与上游意图相符 |
| 证据 | 实际命令、输出、截图/报告路径、检查时间和对象 | 检查针对本次产物；失败不可只改状态绕过 |
| 判定 | `accepted` / `needs_revision` / `blocked` / `not_run`，附理由 | 区别模型建议、机器检查和已有人工授权 |
| 运行信息 | session/agent/task ID、结束原因、是否 partial | 只用于恢复与追溯，不替代验收 |
| 下游交接 | 可消费的产物、剩余风险、下一步条件 | 接收方能独立继续，不依赖未传入的对话 |

本地 MVP 可在已有授权范围内自动生成、检查和修订；只在实际缺失决策或超出授权时升级。若将来需要硬阶段门禁，应让阶段调度器读取真实证据并决定是否启动下游，而不是仅靠 Stop hook 或模型自报 completed。

## 未实测边界

- 本机 CLI 版本已在下方补充；feature flags、模型、实际权限模式及插件加载结果仍未确认，版本字符串不证明对应能力已启用。
- 未实测 plan 文件写入路径、Bash/MCP 替代写入通道、hook 超时/错误/中断、上下文压缩、普通子 agent 与 fork 的配置组合。
- 未证明某一套 Superpowers 配置覆盖六阶段；本文只确认 Claude 原生机制可承载什么、不能据此宣称什么。
- 官方页面持续变化；实现前需按目标版本复核，尤其是权限继承、实验 agent hooks、plan/bypass 例外和停止上限。

## 项目上下文 Hook 协议补充

核验日期：2026-09-16。针对“原版 Superpowers + 独立项目上下文 Hook 插件 + 每项目知识入口配置”；以下六条为协议与设计边界的官方研究，未安装或触发 Hook、插件或 MCP。

主任务补充只读环境观察：`claude --version` 返回 `2.1.250 (Claude Code)`，`node --version` 返回 `v24.15.0`。这不证明目标会话已经加载两类事件，Skill 输入与插件版本仍需实际验证；对应实施方案见[项目上下文 Hook 插件设计](../../docs/tools/project-context-hook-plugin-design.md)。

1. **两个入口分别适配，不假定同次双触发。** 模型调用 `Skill` 可匹配 `PreToolUse`；直接输入 `/skillname` 绕过它，进入 `UserPromptExpansion`。后者匹配 `command_name`，输入为 `command_args`、`command_source`、`expansion_type`、`prompt`，不能写成通用 `args`／`source`。[事件与字段](https://code.claude.com/docs/en/hooks#userpromptexpansion)。**未知项：** 本次官方 Hooks、Tools reference、SDK reference 的有界核验未找到 `Skill` 的 `tool_input.skill`／`tool_input.args` 明文 schema；也未确认 `command_source` 完整枚举、命令别名形态或此事件最低支持版本。因此前述 Skill 字段只能作为待验证适配假设，不能标成已由官方保证。建议保留原始调用名、仅应用显式别名表，并对缺失/未知字段返回可诊断状态。[工具说明](https://code.claude.com/docs/en/tools-reference)

2. **投递、读取和采用分别验收。** 使用 `hookSpecificOutput` 内的事件名与 `additionalContext`；文本在下一次模型请求可见，`PreToolUse` 的位置在工具结果旁，直接命令扩展则在 prompt 旁；超过 10,000 字符转为文件路径与预览。[上下文投递](https://code.claude.com/docs/en/hooks#add-context-for-claude)。command Hook 不能通过返回文本执行 Read 或 slash command。[Hook 限制](https://code.claude.com/docs/en/hooks-guide#limitations)。**设计建议：** 注入有界知识入口、适用范围及版本信息；路径可用、上下文已投递、agent 实际读取、产物引用适用规则是不同证据。尤其不能声称 `PreToolUse` 注入已让模型在 Skill 工具执行前读完项目文件。

3. **每次调用都应获得当前上下文。** 匹配 Hook 并行执行；多份 `additionalContext` 都会投递。重复 settings handler 可合并，plugin/skill 副本仍独立；历史注入在 resume 时重放而非重跑，`SessionStart(resume/fork)` 可刷新。[handler 规则](https://code.claude.com/docs/en/hooks#hook-handler-fields)、[恢复语义](https://code.claude.com/docs/en/hooks#add-context-for-claude)。**设计建议：** 不用“session 已注入某 skill”的永久标记跳过后续调用，也不假定与原版 Superpowers 的 Hook 有执行顺序。默认无持久去重；确需幂等时只抑制同一事件实例，并隔离 agent 与调用身份。不能仅凭同 skill、同参数认定重复；无可靠实例 ID 时宁可重复投递短上下文。文件内容缓存与投递去重分别处理，恢复后重新解析本次知识入口。

4. **故障不能冒充成功，插件也不是可靠门禁。** command Hook 启动失败、普通错误或超时可能继续原调用；超时输出被丢弃。合法输出、exit 2、各事件决策字段有不同语义。[错误与超时](https://code.claude.com/docs/en/hooks#exit-code-output)。**设计建议：** 正常路径输出单个 JSON、exit 0，省略权限决策；上下文插件不擅自返回 `permissionDecision: "allow"`。未配置、未命中、输入不支持、入口缺失、解析失败分别可诊断。若业务以后要求缺失上下文时阻断，必须单独设计拒绝协议和宿主故障处理；不能靠脚本任意非零退出，也不能把超时后的继续执行记为注入成功。

5. **独立插件与项目配置各有确定位置。** 插件默认在根目录 `hooks/hooks.json`，格式为顶层 `hooks` → 事件 → matcher 组 → handlers；manifest 位于 `.claude-plugin/plugin.json`，也可声明 Hook 配置路径或内联配置。插件脚本用 `${CLAUDE_PLUGIN_ROOT}` 定位；更新后的缓存路径可能变化，不宜存项目状态。[Hook 格式](https://code.claude.com/docs/en/plugins-reference#hooks)、[插件路径变量](https://code.claude.com/docs/en/plugins-reference#environment-variables)。`${CLAUDE_PROJECT_DIR}` 固定为会话启动项目，进入 worktree 或 `cd` 后应结合事件 `cwd` 识别当前工作位置。[项目与工作目录](https://code.claude.com/docs/en/hooks#reference-scripts-by-path)。**设计建议：** 每项目知识入口文件是本方案自定义数据协议，并非 Claude 原生设置；明确以当前仓库/worktree 查找配置的规则，以及非仓库、额外目录、缺失配置时的行为，避免读到主 checkout 的过期内容。

6. **子 agent 与 fork 要单独覆盖。** 插件 Hook 也适用于子 agent 的工具调用；普通子 agent 不继承主会话的已读文件、已调用 skills 或历史上下文。[子 agent Hook](https://code.claude.com/docs/en/sub-agents#define-hooks-for-subagents)、[启动上下文](https://code.claude.com/docs/en/sub-agents#what-loads-at-startup)。skill 的 `context: fork` 是以 skill 内容启动隔离 agent，与继承对话的 conversation fork 不同。[隔离 skill](https://code.claude.com/docs/en/skills#run-skills-in-a-subagent)。**设计建议：** 子 agent 自行调用 Skill 时重新路由；直接委派或预加载 skill 不应被假定经过同样入口。特别是主会话 `PreToolUse` 返回的上下文是否抵达 `context: fork` 的接收 agent，本次文档未证明。把普通委派、预加载、隔离 skill、conversation fork、resume、压缩及并发作为后续验收场景；必要时显式交接知识入口，或另行设计 `SubagentStart` 注入，不能把一次主会话注入宣称为全链路覆盖。

## 上下文接入方式对照

核验日期：2026-09-17。原版已要求探索项目文件与文档，但没有指定本项目 Wiki/ADR。[Superpowers 6.3.0 原文](https://github.com/obra/superpowers/blob/v6.3.0/skills/brainstorming/SKILL.md)

| 方式 | 官方机制事实 | 取舍（本研究推断） |
| --- | --- | --- |
| `CLAUDE.md` / `@imports` | 项目根文件及其导入在启动时加载；内容属于上下文。[Memory](https://code.claude.com/docs/en/memory#import-additional-files) | 短小常驻入口最简单；入口路径不等于所指全文已读，全文导入增加常驻成本 |
| `.claude/rules` | 无 `paths` 启动加载；有 `paths` 在读取匹配文件时触发。[Rules](https://code.claude.com/docs/en/memory#path-specific-rules) | 按文件适用，不能作为“进入 brainstorming”的触发器 |
| 事件 Hook | 手动命令与模型 Skill 调用分属 `UserPromptExpansion` / `PreToolUse`；注入交给下一次模型请求，普通错误、启动失败或超时可能放行。[事件](https://code.claude.com/docs/en/hooks#userpromptexpansion)、[故障](https://code.claude.com/docs/en/hooks#exit-code-output) | 保留原命令、按需动态选择有优势；增加事件覆盖、版本与运行维护成本 |
| 显式上下文准备 skill / wrapper | 技能内的 `!` 命令可在内容交付前展开；受权限及策略限制。[Skills](https://code.claude.com/docs/en/skills#inject-dynamic-context) | 仅覆盖调用该技能的路径；普通 wrapper 再调用原版仍靠模型遵循顺序；预处理语法需要宿主适配 |
| 修改 brainstorming | 技能正文随调用加载。[Skills](https://code.claude.com/docs/en/skills) | 路径最直接，但成为自维护版本，升级要合并；同样不能保证理解和采用 |

**判断：不能认定 Hook 最优。** 官方甚至建议不变的项目约定优先放 `CLAUDE.md`，免运行脚本。[上下文指南](https://code.claude.com/docs/en/hooks#add-context-for-claude) Hook 的增益是事件投递，不是语义遵循保证。若只需让原版知道知识入口，应先测短入口及关键约束；若需保留原命令、跨项目按阶段动态选取，Hook 才更有理由。共享 Markdown 可复用；上述宿主加载协议不能直接视为跨工具通用。

**证据边界：** 已有实验仅证明 Claude 2.1.273 手动调用的 `command_name=superpowers:brainstorming` 命中并接受输出；API 401 导致无成功模型轮次，未证明模型调用入口、实际阅读或约束采用。本轮未运行 Claude、安装插件或改配置。

**可证伪比较：** 在另一台机器固定版本、模型与 Wiki/ADR，分别测短入口、等量正文导入、Hook、显式准备 skill；同题重复并覆盖手动/模型入口及恢复。分别记录投递、实际内容可见、设计正确采用适用 ADR、成本。若等量内容下采用率无改善，Hook 只能宣称改变投递时机；若路径入口频繁漏读而事件注入改善，才支持增加 Hook。
