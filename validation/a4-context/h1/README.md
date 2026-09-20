# H1 诊断器移交

`capture-hook.mjs` 与 `capture-hook.test.mjs` 是原机已通过 16 项子进程测试的移交副本，保留原逻辑。这里是后续跨机验证的维护位置；原 `.local/` 文件作为历史证据保留，不再作为新方案的可执行依赖。

它只输出诊断标记，**没有 Wiki/ADR 语义注入能力**。`decision: injected` 表示响应已准备并保存；stdout 失败、宿主丢弃或模型请求失败时仍可能出现该记录，不能据此判断投递成功。

## 已有证据边界

2026-09-17，旧机实际版本 Claude Code 2.1.273、Superpowers 6.3.0、Node 24.15.0：

- 手动 `/superpowers:brainstorming` 产生 `UserPromptExpansion`，`command_name` 为 `superpowers:brainstorming`，来源 `plugin`，展开类型 `slash_command`。
- 宿主解析了 131 字符 additionalContext；无关手动命令被捕获并跳过。
- 模型请求返回 OAuth 401，没有成功模型轮次；模型主动 Skill 路径和模型采用均未验证。
- 原始完整日志不在移交包中。此摘要不是目标机器的通过证据。

## 接口和本地测试

在方法材料根目录运行：

```sh
node --test validation/a4-context/h1/capture-hook.test.mjs
```

处理器接口：`node capture-hook.mjs --out-dir <已存在的绝对目录> --run-id <本轮ID> --marker <随机标记>`。目录及参数由操作者配置。run-id 仅用字母、数字、下划线或连字符；marker 另允许点，均以字母或数字开头。

处理器捕获必要事件名、工具/命令名、字段名与类型、cwd，以及散列后的 session/tool-use ID；省略 prompt、args 正文与 transcript。它是固定字段采集器，不是任意敏感文本脱敏工具；使用无账号/密钥的实验目录名与参数。

## macOS / Linux 注册示例

以下仅为诊断配置，生成到新临时目录，不覆盖既有设置。需要 Node、Python 3 与 POSIX shell。Windows 执行者按相同 JSON 协议生成原生路径/引用，单列为新平台验证。

从方法材料根目录执行：

```sh
export A4_METHOD_ROOT="$(pwd)"
export A4_H1_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/a4-h1.XXXXXX")"
python3 - <<'PY'
import json, os, secrets, shlex, shutil
from pathlib import Path

method = Path(os.environ['A4_METHOD_ROOT']).resolve()
run = Path(os.environ['A4_H1_ROOT']).resolve()
script = method / 'validation/a4-context/h1/capture-hook.mjs'
assert script.is_file(), 'Start from the method package root'
node = shutil.which('node')
assert node, 'Node is required; verify the target runtime first'
(run / 'events').mkdir()
(run / 'workspace').mkdir()
marker = 'h1_' + secrets.token_hex(16)
command = shlex.join([node, str(script), '--out-dir', str(run / 'events'),
                      '--run-id', 'h1-target', '--marker', marker])
handler = {'type': 'command', 'command': command, 'timeout': 5}
settings = {'env': {'DISABLE_AUTOUPDATER': '1'}, 'hooks': {
    'PreToolUse': [{'matcher': 'Skill', 'hooks': [handler]}],
    'UserPromptExpansion': [{'matcher': '.*', 'hooks': [handler]}]
}}
(run / 'settings.json').write_text(json.dumps(settings, indent=2) + '\n')
(run / 'empty-mcp.json').write_text('{"mcpServers": {}}\n')
(run / 'expected.json').write_text(json.dumps({'marker': marker}, indent=2) + '\n')
print(run)
PY
```

在 Task 1 核对安装后，将 `A4_SUPERPOWERS_ROOT` 设为**该机 Claude 原版 Superpowers 插件根目录**，将 `A4_MODEL` 设为本批次选定且可用的模型 ID；不要填原机缓存路径。下列启动示例由操作者在目标版本先核对支持情况：

```sh
cd "$A4_H1_ROOT/workspace"
DISABLE_AUTOUPDATER=1 claude --setting-sources project \
  --settings "$A4_H1_ROOT/settings.json" \
  --plugin-dir "$A4_SUPERPOWERS_ROOT" \
  --model "$A4_MODEL" \
  --tools Skill \
  --strict-mcp-config --mcp-config "$A4_H1_ROOT/empty-mcp.json" \
  --debug-file "$A4_H1_ROOT/host-debug.log"
```

该命令为交互会话：进入后按 [prompts.md](../prompts.md) 分开运行 M/U 探针。一次探针后新开会话测试下一入口，避免标记从旧对话进入。诊断配置的广 matcher 用于观察实际字段；正式 B 配置再按 H1 结果缩到目标命令。

`--setting-sources project`、`--settings`、`--plugin-dir` 等参数的作用见[官方 CLI](https://code.claude.com/docs/en/cli-reference)。它们不等于清除了所有背景指令，也不能绕开托管策略。若目标机认证依赖被排除的用户设置，先明确并保留必要的 provider 配置；记录实际配置差异，而不是关闭权限检查或复制凭据。H1 的 Skill-only 工具配置仅用于协议探针，不复用于主比较的文件读取。

## 采集、判断与退出

1. events 下的 JSON 是脚本侧事件；host-debug.log 是宿主侧日志；模型响应中的随机 marker 是 E2 补充证据。三者对应后分别记录。
2. `tool_input.skill` 与完整命令名必须来自真实事件。目标版本不一致时更新适配副本及测试，保留修订前失败。
3. 负例需要真实调用无关 Skill/手动命令，并检查该次没有新响应。重复会话中旧 marker 的文本不构成新投递。
4. 退出诊断会话，使用未引用本 settings 的全新会话，检查原版入口恢复；不用删除用户配置，也不使用全局禁用原版全部 Hooks 的方式。
5. 只将必要字段与结论放入 run 记录。宿主 debug 可能包含对话或路径，原始文件留在目标机，不自动打包回传。

诊断结束保留临时目录作为本批证据，之后按用户的本地文件管理方式清理。本方案不要求提交、安装插件或修改试点业务代码。
