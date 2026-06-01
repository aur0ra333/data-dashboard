# 运营数据看板

一个前端运营分析工具 Demo，用模拟订单数据驱动 KPI、图表和订单列表联动。项目重点练习数据筛选、聚合计算、图表渲染、表格展示和 CSV 导出。

## 在线演示

[访问在线演示](https://aur0ra333.github.io/data-dashboard/)

## 功能

- KPI 指标：根据当前筛选结果计算活跃用户、成交金额、订单数量和 SKU 数量。
- 时间筛选：支持近 7 天、近 30 天、本季度三个范围。
- 渠道筛选：支持全部渠道、自然访问、活动投放、老客复购。
- 图表联动：销售趋势、用户地区分布、订单状态和品类成交金额随筛选变化。
- 订单表格：展示当前筛选下的订单，并支持展开/收起。
- CSV 导出：导出当前筛选结果，方便后续分析。
- 主题切换：支持深色/浅色模式。

## 技术栈

- HTML5
- CSS3：Grid、Flexbox、响应式布局、CSS 变量
- JavaScript ES6+
- Chart.js
- Blob / URL API
- GitHub Pages

## 可讲的实现点

- 使用数组模拟接口返回的订单数据。
- 通过 `filter` 按时间范围和渠道筛选数据。
- 通过 `reduce` 聚合成交金额、状态分布、品类金额等指标。
- 统一 `refreshDashboard` 方法，让 KPI、图表和表格保持同步。
- 使用 Blob 生成 CSV 文件并触发浏览器下载。

## 本地运行

```bash
git clone https://github.com/aur0ra333/data-dashboard.git
cd data-dashboard
python -m http.server 8080
```

然后访问 `http://localhost:8080`。
