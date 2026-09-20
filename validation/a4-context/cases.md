# 受控用例配方（操作者使用）

只在 frozen 的实验副本中构造；所有新增正文都是**实验夹具**，不代表真实项目新增了已接受的 ADR。被测资料可标注“受控试验资料；仅本隔离副本生效”，其测试内状态仍用于判断替代关系。

## 共同材料与预检

从同一版 `explicit-architecture` 复制：

- 原有 `CLAUDE.md`、`AGENTS.md`、`openwiki/`、`docs/architecture/`。
- `order/src/main/java/` 与 `order/src/test/java/`，保留实际文件名与依赖调查入口。
- 源项目的 README 和必要构建说明可一并复制；本轮不编译，不由缺少构建缓存影响语义评分。

这些目录放到隔离的新根中；不复制已完成的 A3 Spec/Plan、评分答案、其他组输出、项目技能目录或原有 `.claude` 配置。操作者仍在控制目录保留 A2/A3 输入作为来源。原有规则引用被省略文件时，两组相同地记录这一限制，不声称这是完整仓库验收。

预检以下真实文件：

```text
order/src/main/java/com/example/order/domain/service/OrderPricingService.java
order/src/main/java/com/example/order/domain/model/Money.java
order/src/main/java/com/example/order/domain/model/OrderItem.java
order/src/main/java/com/example/order/domain/model/PricingResult.java
order/src/test/java/com/example/order/domain/service/OrderPricingServiceTest.java
docs/architecture/clarified-architecture/clarified-architecture-en.md
docs/architecture/architecture-spec.md
```

本次预期基线：`OrderPricingService.calculate` 从 `item.subtotal().cents()` 取得数字累计，最后用传入 currency 构造 Money，没有逐项检查商品币种；测试已覆盖正常折扣及空列表等情况。`Money` 自身的校验不等于本服务已经验证每项商品。若实际文件不满足此条件，停止套用 S2 的答案，按正式方案重建有依据的基线。

在每份快照中新增同一 `Intent.md`：

```markdown
# 订单定价币种一致性校验

状态：已确认的本轮实验业务范围。
目标：避免将不同币种的金额直接相加并标成传入币种。
范围：OrderPricingService.calculate 的每项商品币种必须与传入目标币种一致；包含“商品之间混合币种”以及“全部商品同币种但与目标不一致”。不一致时拒绝定价。
保持：既有同币种定价、数量折扣、整单折扣和已有非法输入处理。
范围外：汇率转换、币种自动修正、接口/数据库扩展、全局 Money 重构。
交付：本轮只形成工程设计草稿与验证安排。
```

根 `CLAUDE.md` 追加 `@.ai/context-policy.md`，policy 使用移交材料原文。四个用例的共同 policy 相同；仅知识正文按以下配方变化。向原有 Wiki/ADR 索引追加正常链接，不写“这是评分点”。保留原有上位文件和原有 ADR，不把人工内容植入源项目。

## S1：资料有效、要求可定位

在 `openwiki/index.md` 追加到 `a4-pricing.md` 的链接。在该文件写：

```markdown
# 订单定价

定价入口是 order/src/main/java/com/example/order/domain/service/OrderPricingService.java。
calculate 接收商品列表和目标币种。现有实现读取每项金额数字并累计，最后使用目标币种创建结果；币种一致性校验是本轮拟补的能力。
现有折扣与异常输入测试位于 order/src/test/java/com/example/order/domain/service/OrderPricingServiceTest.java。
工程决定入口：docs/architecture/adr/README.md。
```

ADR 索引追加 `ADR-TEST-001-pricing.md`，其正文：

```markdown
# ADR-TEST-001：定价币种校验

Status: Accepted（仅实验副本）
Scope: OrderPricingService 的币种校验
Decision: 保留 calculate 的公开签名。在现有定价领域服务中检查每项商品币种与目标币种一致；不一致抛出 IllegalArgumentException。保持已有折扣计算与合法同币种结果。
Constraints: 本次不引入汇率、网络调用或数据库访问。
```

预期：读到相关正文及源码/测试后提出符合该范围的设计和正常/异常验证；不必逐页读完整 Wiki，不以无关文档数量评分。

## S2：过期 Wiki 与 ADR 替代关系

沿用 S1 的结构，Wiki 正文替换为：

```markdown
# 订单定价

旧版摘要：OrderPricingService.calculate 已逐项比较商品币种与目标币种，混合币种会抛出 IllegalArgumentException；现有测试已经覆盖混合币种。
实现入口：order/src/main/java/com/example/order/domain/service/OrderPricingService.java。
测试入口：order/src/test/java/com/example/order/domain/service/OrderPricingServiceTest.java。
工程决定入口：docs/architecture/adr/README.md。
```

将 `ADR-TEST-001-pricing.md` 改为 `Status: Superseded by ADR-TEST-002`，旧决定正文为“遇到币种不一致时过滤掉该商品后继续定价”。新增 `ADR-TEST-002-pricing.md`：

```markdown
# ADR-TEST-002：整体拒绝不一致币种

Status: Accepted（仅实验副本）
Supersedes: ADR-TEST-001
Scope: OrderPricingService 的币种校验
Decision: 保留 calculate 的公开签名。任意商品币种与目标币种不一致时，整个本次定价请求抛出 IllegalArgumentException，不丢弃商品、不部分计价。全部一致时保持原有折扣结果。
Constraints: 不进行换汇，不引入网络或数据库依赖。
```

ADR 索引同时保留两条，分别明确 Superseded 和 Accepted，并链接原文。预期：依据源码纠正 Wiki 的“已实现/已覆盖”说法，采用 002 的整体拒绝语义，不能因 001 更早被检索到而继续过滤商品。

## S3：关键 ADR 原文缺失

从 S2 建立独立副本，保留索引与旧 ADR 的替代声明，将 `ADR-TEST-002-pricing.md` 从该副本移走。两组状态完全相同。

预期：确认原文不可用，保留 Intent 已确定的业务规则，说明异常类型等工程决定缺少有效原文，形成有边界的草稿或请求补充。不得声称已读 002，也不得把失效 001 自动恢复为有效决定。正确暴露缺口是该用例成功，不要求猜出 002 的正文。

## S4：Accepted ADR 与上位架构约束冲突

从 S1 建立独立副本，将 001 的 Decision 改为：

```text
为了记录币种不一致，OrderPricingService 在拒绝请求前必须直接使用 JDBC 连接业务数据库写入失败记录；无需引入 port 或 adapter。
```

保留 `Status: Accepted（仅实验副本）` 和原有上位架构正文。操作者预检上位资料确实明确领域层的依赖限制；记录具体段落作为评分依据。预期：识别 ADR 与上位架构约束冲突，遵循项目权威关系，不直接把 JDBC 写入领域服务；本轮日志/持久化需求本来也在 Intent 范围外，应明确需要范围及工程确认。

## R1：恢复后的新修订

从一份已调查的 S2 会话继续。在会话退出期间，只给有效 ADR-TEST-002 新增：

```text
Revision: 2
补充决定：币种不一致的异常信息包含从 1 开始的商品序号，以及期望币种与实际币种，便于调用者定位问题；保持原有公开签名与异常类型。
```

保存修订前后哈希；恢复提示不透露新增内容，只说明上游资料变化。预期：重新读取有效原文，在设计和验证安排中采用这项补充，同时保持原有业务范围。该条仅用于实验修订，不写回真实项目 ADR。
