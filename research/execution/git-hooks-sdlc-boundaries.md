# Git hooks 在本地 AI SDLC 中的作用与边界

[总览与下一步](../../README.md) · 研究依据 · 指定来源或版本的执行机制参考 · [研究索引](../README.md)

核验日期：2026-09-15。范围为 Git 官方文档及本项目采用建议；本次没有安装、配置或执行任何 hook。

## 1. 官方行为

以下触发与退出行为来自 [githooks 手册](https://git-scm.com/docs/githooks)。

| Hook | 触发位置 | 能否阻止动作 |
|---|---|---|
| `pre-commit` | 创建提交前 | 非零退出阻止提交 |
| `commit-msg` | commit／merge 检查提交消息时 | 非零退出中止命令 |
| `pre-push` | 推送前，接收待推送引用信息 | 非零退出阻止推送 |
| `post-checkout` | checkout／switch 更新工作区后；部分 clone／worktree add 也触发 | 不撤销切换；hook 退出码会成为命令退出码 |
| `post-merge` | 成功合并后；冲突失败不触发 | 不影响已完成合并 |
| `post-rewrite` | amend／rebase 重写后，接收新旧提交映射 | 属事后通知，不是重写前关卡 |

`commit --no-verify` 可跳过 `pre-commit` 和 `commit-msg`；`commit --no-post-rewrite` 可跳过重写通知。[git-commit](https://git-scm.com/docs/git-commit) `push --no-verify` 跳过 `pre-push`。[git-push](https://git-scm.com/docs/git-push)

本地 hooks 不随 clone 自动复制安装。[Pro Git：Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) `core.hooksPath` 可指定其他目录，也可配置为禁用；`git -c` 能对单次命令覆盖配置。[git-config](https://git-scm.com/docs/git-config)、[git](https://git-scm.com/docs/git)

因此，本地 hook 不是不可绕过的项目治理。`post-checkout` 是 Git 命令事件，不能据此假定编辑器写文件或普通脚本改文件都会触发检查。

## 2. 要分清被验证的内容

普通 `git commit` 记录暂存区内容；带路径、`-a` 等形式会改变内容选取方式。已暂存内容可能与工作区文件不同。[git-commit](https://git-scm.com/docs/git-commit)

**本项目建议：** 当前实施、验证和审查针对实际本地改动，包括相关未暂存内容与新增文件，并记录对应状态。将来在 `pre-commit` 宣称“待提交内容已通过”时，应检查该次提交的实际候选快照；只按暂存文件名在工作区运行检查，不能证明检查了暂存版本。可用隔离的候选快照运行检查，或明确限制可复用证据的条件；不要为制造一致性而擅自暂存、还原或隐藏用户修改。

## 3. 本项目的采用建议

| 位置 | 推荐职责 |
|---|---|
| 当前本地实施与验证 | Skill 指导 Agent 选择并显式调用检查脚本；没有提交也能完整运行 |
| 将来的 `pre-commit` | 薄封装调用快速、确定性的候选快照检查，如格式、结构、链接及适当静态检查 |
| 将来的 `commit-msg` | 项目确有约定时检查消息结构、变更 ID；不判断需求是否完成 |
| 将来的 `pre-push` | 进入远程交付范围后再配置，检查实际待推送版本；不替代 CI／服务端策略 |
| 可选 `post-checkout`／`post-merge`／`post-rewrite` | 标记缓存或上下文基线待复核，给出下一次显式检查入口；保留失败可诊断性 |

检查逻辑只维护在可独立调用的脚本中，hook 负责触发与传参。初始化时先识别已有 hook 管理器和有效 `core.hooksPath`，按项目约定接入，避免覆盖已有工具；把 hook 文件提交进仓库，不等于所有克隆都已经启用。

不在 `post-*` 中隐式启动 LLM 改写 ADR、As-Is 或任务状态。Git 事件没有足够语义证明某项决定已获采纳、某条现状已核验或某个 Task 已完成；这些更新继续由相应 Skill 在完整上下文中处理，并保留实际证据。

当前迭代以本地代码生成与验证为终点，因此 Git hooks 是可选接入能力，不能成为运行主流程的前提。
