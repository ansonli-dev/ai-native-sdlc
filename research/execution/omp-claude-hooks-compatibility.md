# OMP 18.1.13：Claude Hooks、MCP、子代理兼容性核查

[总览与下一步](../../README.md) · 研究依据 · 指定来源或版本的执行机制参考 · [研究索引](../README.md)

核查日期：2026-09-14。范围为本机安装的 `@oh-my-pi/pi-coding-agent` 18.1.13 源码，版本依据：[package.json:4](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/package.json:4)。本次仅阅读源码，没有加载用户配置、执行用户扩展、连接 MCP 或读取凭据。结论是源码层面的实现核查，未对外部服务做运行验证。

| 机制 | 结论 |
| --- | --- |
| Claude `settings.json` 中的原生 Hooks（如 `PreToolUse`） | 不支持原配置直接执行；读到 settings 对象不等于执行 Hook |
| Claude 插件 `hooks/hooks.json` 或 manifest 的 Hooks 声明 | 未实现原生 Claude Hook JSON 的解析/调度；不能当作兼容 |
| `.claude/hooks/pre/`、`post/` 中的文件 | 可被发现为 metadata；当前运行时只导入 `.ts`/`.js`，且必须是 OMP extension factory。发现 `.sh` 不等于执行它 |
| 项目 `.mcp.json` 等 MCP 配置 | 支持标准配置发现，并有实际连接、加载工具的运行链路；不保证 Claude 的所有配置字段、作用域和授权状态等价 |
| 直接 `.claude/agents/*.md` | 明确不读取，源码有意跳过 |
| Claude marketplace 插件内的 `agents/*.md` | 有条件发现，但按 OMP 子代理字段解析，属于部分兼容 |

## Hooks：发现机制与执行机制不同

Claude provider 的 `loadHooks` 扫描 `.claude/hooks/pre/` 和 `.claude/hooks/post/`，把文件名转换为 `name/type/tool/path` 元数据。没有读取 `settings.json.hooks`。[claude.ts:370](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude.ts:370)

Claude 插件 provider 同样只扫描 `<plugin>/hooks/pre/` 和 `post/`。[claude-plugins.ts:358](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude-plugins.ts:358)

运行时在 `discoverExtensionPaths` 中取得这些 Hook 项目后，仅提取 `path`，并过滤为 `.ts`/`.js`。`type`、`tool` 元数据没有在这里变成自动事件注册。文件必须导出可调用的 OMP factory，然后自行通过 API 注册事件。[loader.ts:693](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/extensions/loader.ts:693)、[文件类型过滤:511](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/extensions/loader.ts:511)、[factory 识别:60](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/extensions/loader.ts:60)

Claude settings provider 确实读取 `settings.json` 的通用 JSON 数据；项目设置也会被合并，但未发现将 Claude Hook 声明转换成 OMP 事件的实现。[claude.ts:524](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude.ts:524)、[settings.ts:1811](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/config/settings.ts:1811)

核查 `src` 全树的 `hooks.json|PreToolUse|PostToolUse|UserPromptSubmit` 无匹配。另一个 `manifest.hooks` 命中是 OMP/npm 插件诊断，只检查路径存在，并非 Claude Hook 解释器。[manager.ts:1043](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/plugins/manager.ts:1043)

迁移方式：复用原有检查脚本，另写 OMP extension，用 `tool_call`、`tool_result`、`session_start` 等实际事件调用脚本，并适配输入、退出码、阻断与反馈。OMP 的 `tool_call` 处理结果支持 `block: true`，有实际运行时阻断能力；这证明存在实现同类约束的基础，不能据此声称 Claude 事件体系完整兼容。[types.ts:1237](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/extensions/types.ts:1237)、[runner.ts:1470](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/extensibility/extensions/runner.ts:1470)

## MCP：有真实运行链路，但不是完整配置迁移

项目根目录 `mcp.json`、`.mcp.json` 由独立 provider 读取。[mcp-json.ts:160](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/mcp-json.ts:160)

Claude provider 另外读取 `.claude/.mcp.json`、`.claude/mcp.json`，以及用户级 Claude 配置文件（用户来源启用时）。此 provider 只映射 `enabled/timeout/command/args/env/url/headers/type` 等字段，并不读取 `~/.claude.json` 的任意项目级嵌套配置。[claude.ts:79](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude.ts:79)

Claude 插件的 MCP provider 支持 `.claude-plugin/plugin.json` 的 `mcpServers` 内联对象或文件路径，缺省回落 `<plugin>/.mcp.json`；还处理插件根目录变量。属于实质支持。[claude-plugins.ts:455](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude-plugins.ts:455)

发现结果会转换成 MCP 配置，`MCPManager.discoverAndConnect` 调用 `connectServers`；后者实际调用 `connectToServer`。因此不是仅有文件识别。[config.ts:131](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/mcp/config.ts:131)、[manager.ts:468](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/mcp/manager.ts:468)、[manager.ts:610](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/mcp/manager.ts:610)

没有核验用户实际 MCP 连接、OAuth 凭据沿用或 Claude 的批准列表迁移；这些不能由源码支持配置格式推导为已经可用。

## 子代理：直接 Claude 目录跳过，插件定义部分读取

源码直接说明 `.claude/agents` 有意跳过，因为其 frontmatter 不等于 OMP task-agent contract。项目侧使用 `.omp/agents/*.md`，用户侧使用 `~/.omp/agent/agents/*.md`。[discovery.ts:4](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/task/discovery.ts:4)

已启用 Claude marketplace 插件中的 `agents/` 会加入发现路径；用户插件需要满足来源 opt-in。[discovery.ts:108](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/task/discovery.ts:108)

不论来源，最后用 OMP `parseAgentFields` 解析：接受 `name/description/tools/model/spawns/thinkingLevel/autoloadSkills/...`，未保留 Claude 的 `permissionMode/disallowedTools/skills/memory/hooks/mcpServers/isolation` 等专用字段。不能保证只复制文件后行为一致；至少需把预加载 Skills 改为 OMP 的 `autoloadSkills`，并逐项确认工具和权限语义。[helpers.ts:308](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/helpers.ts:308)、[最终返回字段:379](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/helpers.ts:379)

## 上下文与规则（合并主调查证据）

`CLAUDE.md` 有支持，但独立文件 provider 的行为是从会话 cwd 向上扫描，受 home/repository 边界控制。主调查未在文件读取工具中发现“读取某个子目录的文件时，自动注入该子目录 CLAUDE.md”的等价实现。因此应表述为“支持 cwd/祖先说明发现”，不能照搬 Claude Code 的子目录惰性加载承诺。[claude-md.ts:20](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude-md.ts:20)、[helpers.ts:694](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/helpers.ts:694)

普通 `.claude/rules/` 没有在 Claude provider 中注册对应 rule capability；该文件注册了 context、skills、MCP 等，但没有 rules。Claude marketplace 插件的 `rules/` 另有专门注册，不能据此推导普通项目 `.claude/rules` 也会加载。[claude.ts:548](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude.ts:548)、[claude-plugins.ts:696](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/claude-plugins.ts:696)

OMP 通用规则解析读取的是 frontmatter `globs`，没有把 Claude 的 `paths` 转换过来。规则再按 TTSR 条件、`alwaysApply`、有 `description` 的 rulebook 分流；普通 rulebook 通过模型读取 `rule://<name>` 使用，不能称为“Claude 路径命中时自动注入”。[helpers.ts:223](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/discovery/helpers.ts:223)、[rule-buckets.ts:42](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/capability/rule-buckets.ts:42)、[系统提示:48](/Users/yuan.li/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src/prompts/system/custom-system-prompt.md:48)

对“按规范产出代码”这一用途，可共用规则文本、参考实现和独立检查脚本；路径加载、运行时强制约束和子代理配置应显式适配 OMP，不能把“读得到 Claude 目录”视为“完整运行 Claude Code 机制”。
