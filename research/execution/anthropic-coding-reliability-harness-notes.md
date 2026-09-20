# Anthropic：让 AI 按要求产出代码的相关文章

[总览与下一步](../../README.md) · 研究依据 · 指定来源或版本的执行机制参考 · [研究索引](../README.md)

检索与核验日期：2026-09-14。范围：Anthropic 官方 Engineering 与 Claude Blog；另列一篇官方文档。以下是阅读筛选与简短归纳，不是全文翻译。

## 日常编码优先读

**[Steering Claude Code: when to use CLAUDE.md, skills, hooks, and subagents](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)**，2026-06-18。区分项目背景、路径规则、可复用流程和自动检查各自应放在哪里。自然语言规则仍可能被遗漏；必须执行的限制需要脚本型 Hooks 或权限机制。适合解决“反复说了规范，AI 仍不遵守”。

**[The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)**，2026-07-24。主张精简互相冲突的指令，按需加载团队知识，并用测试、现有代码、可运行原型与评分标准表达要求。文章针对 Claude 5 代模型，不能把删减指导的经验无条件套到所有模型。

**[Best practices for prompt engineering for 2026](https://claude.com/blog/best-practices-for-prompt-engineering)**，页面日期为 2025-11-10。强调明确预期结果、约束及其原因，以恰当示例澄清难描述的要求。是通用提示写作入门，代码验证部分不如下面的工程文章直接。

**[Using CLAUDE.md files: Customizing Claude Code for your codebase](https://claude.com/blog/using-claude-md-files)**，2025-11-25。介绍如何保存项目架构、工具命令和工作约定；从实际反复出现的问题出发，保持文件简洁。较新的 Steering 文章进一步区分了长期背景与按需流程的存放方式。

**补充官方文档：[Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)**。2025-04-18 的同主题 Engineering 博文地址目前重定向至此。优先读验证方式、探索与规划、具体上下文、让 Claude 访谈需求四部分；规格应自洽，说明相关接口、范围外事项和端到端验收方法。小而明确的修改无需机械增加规划步骤。

## 优先阅读的三篇

1. **[Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)**，2026-03-24。最贴合“按要求实现”：在编码前约定可测试的完成标准，独立评估者实际操作应用，按规格反馈问题。适合复杂应用与主观质量要求。文章后续实验也减少了流程约束，提醒按模型能力判断评估者是否值得其成本。

2. **[Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)**，2025-11-26。把需求变成带验证步骤的功能清单，每次推进一项，用进度文件和 Git 衔接会话，通过真实端到端测试后再标记完成。适合跨会话、长任务；原文演示主要针对全栈 Web 应用。

3. **[Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)**，2026-01-09。编码代理评估需要明确任务、稳定环境和充分测试；确定性测试检查功能，清晰评分规则补充代码质量判断，并保留回归评估。适合把“合适”变成团队能重复验证的标准。

## 可选补充

**[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**，2025-09-29。说明如何选择足够而精炼的上下文，使用明确指令、典型示例与按需读取，避免模糊要求和冗杂提示。适合研究 AI 为什么遗漏规范；相较前三篇，它对代码验收的讨论较间接。

## 阅读判断

我的归纳：这三篇可串成“把要求变成可验证标准 → 用上下文和任务状态保持执行一致 → 通过实际运行和独立反馈纠偏”。它们是工程经验与实验，不能据此声称任何单一流程可保证所有代码合规。[任务状态与测试](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)、[约定与反馈](https://www.anthropic.com/engineering/harness-design-long-running-apps)、[评估方法](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)。

## 核验位置

- 第一篇：网页标题与发布日期；“Scaling to full-stack coding / The architecture”“Removing the sprint construct”。
- 第二篇：网页标题与发布日期；“Feature list”“Incremental progress”“Testing”“Future work”。
- 第三篇：网页标题与发布日期；“Evaluating coding agents”“Capability vs. regression evals”。
- 补充篇：网页标题与发布日期；“The anatomy of effective context”“Context retrieval and agentic search”。
