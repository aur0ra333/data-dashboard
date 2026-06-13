// ============================================================
//  运营数据看板 — 主逻辑
// ============================================================

Chart.defaults.color = 'rgba(23, 32, 42, 0.7)';
Chart.defaults.borderColor = 'rgba(23, 32, 42, 0.1)';

// ---- 全局状态 ----
let charts = {};
let allOrders = [];
let currentRange = 7;
let currentChannel = '全部渠道';
let currentSection = '概览';

// 订单表格状态
let orderSortField = 'date';
let orderSortDir = 'desc';
let orderPage = 1;
let orderPageSize = 15;
let expandedRows = new Set();

// ============================================================
//  1. 动态数据生成
// ============================================================

const CHANNELS = ['微信', '支付宝', 'PC网页', 'APP', '小程序'];
const STATUSES = ['已完成', '已取消', '处理中', '已退款'];
const CATEGORIES = ['电子产品', '服装', '食品', '家居', '图书'];
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'];
const FIRST_NAMES = ['张', '李', '王', '赵', '陈', '刘', '黄', '周', '吴', '郑', '孙', '马', '朱', '胡', '林'];
const LAST_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '娟', '涛'];

function generateOrders(count = 200) {
    const orders = [];
    const now = new Date();
    const baseId = Date.now();

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().slice(0, 10);

        const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];

        // 金额偏向不同渠道
        let amountBase;
        switch (channel) {
            case 'APP': amountBase = 200 + Math.random() * 4800; break;
            case '小程序': amountBase = 150 + Math.random() * 3500; break;
            case '支付宝': amountBase = 100 + Math.random() * 4000; break;
            case '微信': amountBase = 80 + Math.random() * 3000; break;
            case 'PC网页': amountBase = 300 + Math.random() * 4700; break;
            default: amountBase = 50 + Math.random() * 4950;
        }
        const amount = Math.round(amountBase);

        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const customer = firstName + lastName;

        orders.push({
            id: `ORD-${String(baseId + i).slice(-8)}`,
            date: dateStr,
            daysAgo: daysAgo,
            channel: channel,
            amount: amount,
            status: status,
            category: category,
            city: city,
            sku: `SKU-${String(Math.floor(Math.random() * 90000) + 10000)}`,
            customer: customer
        });
    }
    return orders;
}

// ============================================================
//  2. 数据筛选
// ============================================================

function getFilteredOrders() {
    return allOrders.filter(order => {
        const inRange = order.daysAgo < currentRange;
        const inChannel = currentChannel === '全部渠道' || order.channel === currentChannel;
        return inRange && inChannel;
    });
}

function getPreviousPeriodOrders() {
    return allOrders.filter(order => {
        const inRange = order.daysAgo >= currentRange && order.daysAgo < currentRange * 2;
        const inChannel = currentChannel === '全部渠道' || order.channel === currentChannel;
        return inRange && inChannel;
    });
}

// ============================================================
//  3. 统计计算
// ============================================================

function computeStats(orders) {
    const completedOrders = orders.filter(o => o.status === '已完成');
    const revenue = completedOrders.reduce((s, o) => s + o.amount, 0);
    const orderCount = orders.length;
    const uniqueCities = new Set(orders.map(o => o.city)).size;
    const uniqueSKUs = new Set(orders.map(o => o.sku)).size;
    const activeUsers = uniqueCities * 180 + orderCount * 3;
    return { revenue, orderCount, activeUsers, skuCount: uniqueSKUs };
}

function computeChangeRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function getChangeDisplay(current, previous) {
    const rate = computeChangeRate(current, previous);
    if (rate > 0) return { text: `+${rate.toFixed(1)}%`, cls: 'positive', arrow: '↑' };
    if (rate < 0) return { text: `${rate.toFixed(1)}%`, cls: 'negative', arrow: '↓' };
    return { text: '0%', cls: '', arrow: '→' };
}

// ============================================================
//  4. 图表管理
// ============================================================

function initCharts() {
    initSalesChart();
    initUserChart();
    initOrderChart();
    initCategoryChart();
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    charts.sales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateDateLabels(currentRange),
            datasets: [{
                label: '销售额',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                tension: 0.35,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '¥' + ctx.parsed.y.toLocaleString() } } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => '¥' + v.toLocaleString() } } }
        }
    });
}

function initUserChart() {
    const ctx = document.getElementById('userChart').getContext('2d');
    charts.user = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CITIES,
            datasets: [{
                data: [],
                backgroundColor: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
        }
    });
}

function initOrderChart() {
    const ctx = document.getElementById('orderChart').getContext('2d');
    charts.order = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: STATUSES,
            datasets: [{
                data: [],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: CATEGORIES,
            datasets: [{
                label: '成交金额',
                data: [],
                backgroundColor: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#64748b'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '¥' + ctx.parsed.y.toLocaleString() } } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => '¥' + v.toLocaleString() } } }
        }
    });
}

function updateCharts(orders) {
    updateSalesChart(orders);
    updateDistributionChart(charts.user, orders, CITIES, 'city');
    updateDistributionChart(charts.order, orders, STATUSES, 'status');
    updateDistributionChart(charts.category, orders, CATEGORIES, 'category', 'amount');
}

function updateSalesChart(orders) {
    if (!orders) orders = getFilteredOrders();
    const days = parseInt(document.getElementById('salesFilter')?.value || currentRange, 10);
    const labels = generateDateLabels(days);
    const today = new Date();

    const data = Array.from({ length: days }, (_, index) => {
        const daysAgoTarget = days - 1 - index;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - daysAgoTarget);
        const dateStr = targetDate.toISOString().slice(0, 10);
        return orders
            .filter(o => o.date === dateStr && o.status !== '已取消' && o.status !== '已退款')
            .reduce((s, o) => s + o.amount, 0);
    });

    charts.sales.data.labels = labels;
    charts.sales.data.datasets[0].data = data;
    charts.sales.update();
}

function updateDistributionChart(chart, orders, labels, field, valueField) {
    const data = labels.map(label => {
        return orders
            .filter(o => o[field] === label)
            .reduce((s, o) => s + (valueField ? o[valueField] : 1), 0);
    });
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// ============================================================
//  5. 统计卡片 & 漏斗 & 运营提示
// ============================================================

function updateStats() {
    const orders = getFilteredOrders();
    const prevOrders = getPreviousPeriodOrders();

    const current = computeStats(orders);
    const previous = computeStats(prevOrders);

    animateNumber('total-users', current.activeUsers, 500);
    animateNumber('total-revenue', current.revenue, 500, '¥');
    animateNumber('total-orders', current.orderCount, 500);
    animateNumber('total-products', current.skuCount, 500);

    const changes = {
        users: getChangeDisplay(current.activeUsers, previous.activeUsers),
        revenue: getChangeDisplay(current.revenue, previous.revenue),
        orders: getChangeDisplay(current.orderCount, previous.orderCount),
        sku: getChangeDisplay(current.skuCount, previous.skuCount)
    };

    updateChangeLabel('change-users', changes.users);
    updateChangeLabel('change-revenue', changes.revenue);
    updateChangeLabel('change-orders', changes.orders);
    updateChangeLabel('change-sku', changes.sku);
}

function updateChangeLabel(id, change) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = change.arrow + ' ' + change.text;
    el.className = 'stat-change ' + change.cls;
}

function updateFunnel() {
    const orders = getFilteredOrders();
    const totalOrders = orders.length;
    if (totalOrders === 0) {
        document.querySelectorAll('.funnel-row strong').forEach(el => el.textContent = '0');
        return;
    }

    const visitCount = Math.round(totalOrders * 3.5);
    const browseCount = Math.round(totalOrders * 1.8);
    const submitCount = Math.round(totalOrders * 1.3);
    const paidCount = orders.filter(o => o.status === '已完成').length;

    const funnelData = [
        { key: 'visit', label: '访问', value: visitCount, max: visitCount },
        { key: 'browse', label: '浏览商品', value: browseCount, max: visitCount },
        { key: 'submit', label: '提交订单', value: submitCount, max: visitCount },
        { key: 'paid', label: '完成支付', value: paidCount, max: visitCount }
    ];

    const rows = document.querySelectorAll('.funnel-row');
    funnelData.forEach((item, i) => {
        if (rows[i]) {
            const bar = rows[i].querySelector('.funnel-bar i');
            const strong = rows[i].querySelector('strong');
            if (bar) bar.style.width = (item.value / item.max * 100) + '%';
            if (strong) strong.textContent = item.value.toLocaleString();
        }
    });

    // 转化率
    const convRate = totalOrders > 0 ? ((paidCount / totalOrders) * 100).toFixed(1) : '0';
    const convEl = document.getElementById('funnel-conv-rate');
    if (convEl) convEl.textContent = '整体转化率: ' + convRate + '%';
}

function updateInsights() {
    const orders = getFilteredOrders();
    const prevOrders = getPreviousPeriodOrders();
    const current = computeStats(orders);
    const previous = computeStats(prevOrders);

    const revenueChange = getChangeDisplay(current.revenue, previous.revenue);
    const pendingCount = orders.filter(o => o.status === '处理中').length;
    const pendingRate = orders.length > 0 ? ((pendingCount / orders.length) * 100).toFixed(0) : '0';

    // 找出销量最高的类别
    const catSales = {};
    orders.filter(o => o.status === '已完成').forEach(o => {
        catSales[o.category] = (catSales[o.category] || 0) + o.amount;
    });
    const topCat = Object.entries(catSales).sort((a, b) => b[1] - a[1])[0];
    const bottomCats = Object.entries(catSales).sort((a, b) => a[1] - b[1]).slice(-2).map(e => e[0]);

    const list = document.querySelector('.operations-list');
    if (!list) return;

    list.innerHTML = `
        <li><strong>成交金额</strong><span>较上周期${revenueChange.text.startsWith('-') ? '下降' : '上升'} ${revenueChange.text.replace('-', '')}，${currentChannel === '全部渠道' ? '整体表现' : currentChannel + '渠道'}${revenueChange.cls === 'positive' ? '良好' : '需关注'}。</span></li>
        <li><strong>订单状态</strong><span>处理中订单占比 ${pendingRate}%，${pendingRate > 25 ? '建议关注履约时效。' : '履约状态正常。'}</span></li>
        <li><strong>商品结构</strong><span>${topCat ? topCat[0] + '销量最高' : '暂无数据'}，${bottomCats.length ? bottomCats.join('和') + '仍有提升空间。' : '各品类表现均衡。'}</span></li>
    `;
}

// ============================================================
//  6. 订单表格（概览区）
// ============================================================

function loadRecentOrders() {
    const orders = getFilteredOrders();
    const visible = orders.slice(0, 8);
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    tbody.innerHTML = visible.map(o => `
        <tr>
            <td><span class="order-id-link" title="点击查看详情">${o.id}</span></td>
            <td>${o.channel}</td>
            <td>¥${o.amount.toLocaleString()}</td>
            <td><span class="status-badge ${getStatusClass(o.status)}">${o.status}</span></td>
            <td>${o.date}</td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    const map = { '已完成': 'success', '已取消': 'error', '处理中': 'pending', '已退款': 'refunded' };
    return map[status] || '';
}

// ============================================================
//  7. 订单管理区（完整表格 + 排序 + 分页 + 展开）
// ============================================================

function renderFullOrderTable() {
    const orders = getFilteredOrders();

    // 排序
    const sorted = [...orders].sort((a, b) => {
        let va = a[orderSortField];
        let vb = b[orderSortField];
        if (orderSortField === 'amount') {
            return orderSortDir === 'asc' ? va - vb : vb - va;
        }
        va = String(va);
        vb = String(vb);
        return orderSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    // 分页
    const totalPages = Math.ceil(sorted.length / orderPageSize) || 1;
    if (orderPage > totalPages) orderPage = totalPages;
    const start = (orderPage - 1) * orderPageSize;
    const pageOrders = sorted.slice(start, start + orderPageSize);

    // 渲染表体
    const tbody = document.getElementById('full-orders-body');
    if (!tbody) return;

    tbody.innerHTML = pageOrders.map(o => `
        <tr id="row-${o.id}" class="order-row" data-order-id="${o.id}">
            <td><span class="order-id-link" onclick="toggleRowExpand('${o.id}')">${o.id}</span></td>
            <td>${o.date}</td>
            <td>${o.channel}</td>
            <td class="amount-cell">¥${o.amount.toLocaleString()}</td>
            <td>${o.category}</td>
            <td><span class="status-badge ${getStatusClass(o.status)}">${o.status}</span></td>
            <td>${o.city}</td>
            <td>${o.sku}</td>
        </tr>
        <tr id="detail-${o.id}" class="detail-row" style="display:none;">
            <td colspan="8">
                <div class="detail-card">
                    <div class="detail-grid">
                        <div class="detail-item"><span class="detail-label">订单号</span><strong>${o.id}</strong></div>
                        <div class="detail-item"><span class="detail-label">客户</span><strong>${o.customer}</strong></div>
                        <div class="detail-item"><span class="detail-label">日期</span><strong>${o.date}</strong></div>
                        <div class="detail-item"><span class="detail-label">渠道</span><strong>${o.channel}</strong></div>
                        <div class="detail-item"><span class="detail-label">金额</span><strong>¥${o.amount.toLocaleString()}</strong></div>
                        <div class="detail-item"><span class="detail-label">状态</span><strong>${o.status}</strong></div>
                        <div class="detail-item"><span class="detail-label">类别</span><strong>${o.category}</strong></div>
                        <div class="detail-item"><span class="detail-label">城市</span><strong>${o.city}</strong></div>
                        <div class="detail-item"><span class="detail-label">SKU</span><strong>${o.sku}</strong></div>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');

    // 恢复已展开的行
    expandedRows.forEach(id => {
        const detailRow = document.getElementById('detail-' + id);
        if (detailRow) detailRow.style.display = '';
    });

    // 更新表头排序指示器
    updateSortIndicators();

    // 更新分页控件
    renderPagination(totalPages, sorted.length);

    // 更新订单统计
    const statsEl = document.getElementById('orders-stats');
    if (statsEl) {
        statsEl.textContent = `共 ${sorted.length} 条订单，第 ${orderPage}/${totalPages} 页`;
    }
}

function sortOrders(field) {
    if (orderSortField === field) {
        orderSortDir = orderSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        orderSortField = field;
        orderSortDir = 'asc';
    }
    orderPage = 1;
    renderFullOrderTable();
}

function updateSortIndicators() {
    document.querySelectorAll('#full-orders-head th[data-sort]').forEach(th => {
        const field = th.dataset.sort;
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (field === orderSortField) {
            th.classList.add(orderSortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

function toggleRowExpand(orderId) {
    const detailRow = document.getElementById('detail-' + orderId);
    if (!detailRow) return;

    if (expandedRows.has(orderId)) {
        expandedRows.delete(orderId);
        detailRow.style.display = 'none';
    } else {
        expandedRows.add(orderId);
        detailRow.style.display = '';
    }
}

function renderPagination(totalPages, totalOrders) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pagesHtml = '';
    const maxVisible = 5;
    let startPage = Math.max(1, orderPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    pagesHtml += `<button class="page-btn" onclick="goToPage(${orderPage - 1})" ${orderPage === 1 ? 'disabled' : ''}>&lt;</button>`;

    if (startPage > 1) {
        pagesHtml += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) pagesHtml += `<span class="page-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `<button class="page-btn ${i === orderPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagesHtml += `<span class="page-ellipsis">...</span>`;
        pagesHtml += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    pagesHtml += `<button class="page-btn" onclick="goToPage(${orderPage + 1})" ${orderPage === totalPages ? 'disabled' : ''}>&gt;</button>`;

    container.innerHTML = pagesHtml;
}

function goToPage(page) {
    const totalPages = Math.ceil(getFilteredOrders().length / orderPageSize) || 1;
    if (page < 1 || page > totalPages) return;
    orderPage = page;
    renderFullOrderTable();
}

// ============================================================
//  8. 分析区
// ============================================================

function renderAnalytics() {
    const orders = getFilteredOrders();
    if (orders.length === 0) return;

    // 渠道分析
    const channelStats = {};
    CHANNELS.forEach(ch => {
        const chOrders = orders.filter(o => o.channel === ch);
        channelStats[ch] = {
            count: chOrders.length,
            revenue: chOrders.filter(o => o.status === '已完成').reduce((s, o) => s + o.amount, 0),
            avgAmount: chOrders.length > 0 ? Math.round(chOrders.reduce((s, o) => s + o.amount, 0) / chOrders.length) : 0
        };
    });

    const channelBody = document.getElementById('analytics-channel-body');
    if (channelBody) {
        channelBody.innerHTML = CHANNELS.map(ch => {
            const s = channelStats[ch];
            return `<tr>
                <td>${ch}</td>
                <td>${s.count}</td>
                <td>¥${s.revenue.toLocaleString()}</td>
                <td>¥${s.avgAmount.toLocaleString()}</td>
            </tr>`;
        }).join('');
    }

    // 类别分析
    const catBody = document.getElementById('analytics-category-body');
    if (catBody) {
        const catStats = {};
        CATEGORIES.forEach(cat => {
            const catOrders = orders.filter(o => o.category === cat);
            catStats[cat] = {
                count: catOrders.length,
                revenue: catOrders.filter(o => o.status === '已完成').reduce((s, o) => s + o.amount, 0)
            };
        });
        const maxCount = Math.max(...Object.values(catStats).map(v => v.count), 1);
        catBody.innerHTML = CATEGORIES.map(cat => {
            const s = catStats[cat];
            const pct = Math.round(s.count / maxCount * 100);
            return `<tr>
                <td>${cat}</td>
                <td>${s.count}</td>
                <td><div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%"></div></div></td>
                <td>¥${s.revenue.toLocaleString()}</td>
            </tr>`;
        }).join('');
    }

    // 城市分布
    const cityBody = document.getElementById('analytics-city-body');
    if (cityBody) {
        const cityStats = {};
        CITIES.forEach(c => {
            cityStats[c] = orders.filter(o => o.city === c).length;
        });
        const sorted = Object.entries(cityStats).sort((a, b) => b[1] - a[1]);
        const maxCity = Math.max(...Object.values(cityStats), 1);
        cityBody.innerHTML = sorted.map(([city, count]) => {
            const pct = Math.round(count / maxCity * 100);
            return `<tr>
                <td>${city}</td>
                <td>${count}</td>
                <td><div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%"></div></div></td>
            </tr>`;
        }).join('');
    }

    // 概览数字
    const completed = orders.filter(o => o.status === '已完成');
    const revenue = completed.reduce((s, o) => s + o.amount, 0);
    const avgAmount = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + o.amount, 0) / orders.length) : 0;

    document.getElementById('analytics-total-orders').textContent = orders.length.toLocaleString();
    document.getElementById('analytics-total-revenue').textContent = '¥' + revenue.toLocaleString();
    document.getElementById('analytics-avg-amount').textContent = '¥' + avgAmount.toLocaleString();
    document.getElementById('analytics-completed-rate').textContent =
        orders.length > 0 ? Math.round(completed.length / orders.length * 100) + '%' : '0%';
}

// ============================================================
//  9. 侧边栏导航
// ============================================================

function switchSection(sectionName) {
    currentSection = sectionName;

    // 切换导航高亮
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // 切换内容区
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = section.id === 'section-' + sectionName ? '' : 'none';
    });

    // 切换顶栏标题
    const titleMap = { '概览': '数据概览', '订单': '订单管理', '分析': '数据分析', '设置': '系统设置' };
    const h1 = document.querySelector('.top-bar h1');
    if (h1) h1.textContent = titleMap[sectionName] || '数据概览';

    // 同步筛选状态到当前区域
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll(`.filter-chip[data-range="${currentRange}"]`).forEach(c => c.classList.add('active'));
    document.querySelectorAll('#channelFilter, #channelFilterOrders, #channelFilterAnalytics').forEach(f => {
        f.value = currentChannel;
    });
    const sf = document.getElementById('salesFilter');
    if (sf) sf.value = String(currentRange);

    // 进入各区域时刷新对应内容
    if (sectionName === '订单') renderFullOrderTable();
    if (sectionName === '分析') renderAnalytics();
}

// ============================================================
//  10. 数据刷新
// ============================================================

function refreshData() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';

    const btn = document.querySelector('.refresh-btn');
    if (btn) {
        btn.style.animation = 'spin 1s linear infinite';
        btn.disabled = true;
    }

    setTimeout(() => {
        // 重新生成所有数据
        allOrders = generateOrders(200);

        // 刷新当前视图
        refreshDashboard();

        if (currentSection === '订单') renderFullOrderTable();
        if (currentSection === '分析') renderAnalytics();

        // 隐藏 loading
        if (overlay) overlay.style.display = 'none';
        if (btn) {
            btn.style.animation = '';
            btn.disabled = false;
        }

        showNotification('数据已刷新，当前筛选条件下共 ' + getFilteredOrders().length + ' 条订单', 'success');
    }, 1000);
}

// ============================================================
//  11. 全局刷新
// ============================================================

function refreshDashboard() {
    const orders = getFilteredOrders();
    updateStats();
    updateCharts(orders);
    updateFunnel();
    updateInsights();
    loadRecentOrders();
}

// ============================================================
//  12. 导出
// ============================================================

function exportOrdersCSV() {
    const orders = getFilteredOrders();
    const header = ['订单号', '日期', '渠道', '金额', '状态', '类别', '城市', 'SKU', '客户'];
    const rows = orders.map(o => [o.id, o.date, o.channel, o.amount, o.status, o.category, o.city, o.sku, o.customer]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${currentRange}days-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('已导出 ' + orders.length + ' 条订单', 'info');
}

// ============================================================
//  13. 事件绑定
// ============================================================

function setupEventListeners() {
    // 所有渠道筛选下拉框联动
    const channelFilters = document.querySelectorAll('#channelFilter, #channelFilterOrders, #channelFilterAnalytics');
    channelFilters.forEach(filter => {
        filter.addEventListener('change', () => {
            currentChannel = filter.value;
            // 同步所有下拉框
            channelFilters.forEach(f => { if (f !== filter) f.value = currentChannel; });
            orderPage = 1;
            refreshDashboard();
            if (currentSection === '订单') renderFullOrderTable();
            if (currentSection === '分析') renderAnalytics();
        });
    });

    // 销售趋势图表筛选
    const salesFilter = document.getElementById('salesFilter');
    if (salesFilter) {
        salesFilter.addEventListener('change', () => updateSalesChart());
    }

    // 时间范围芯片（所有区域的芯片联动）
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            // 高亮同类芯片
            const range = chip.dataset.range;
            document.querySelectorAll(`.filter-chip[data-range="${range}"]`).forEach(c => c.classList.add('active'));
            currentRange = Number(range);
            const sf = document.getElementById('salesFilter');
            if (sf) sf.value = String(currentRange);
            orderPage = 1;
            refreshDashboard();
            if (currentSection === '订单') renderFullOrderTable();
            if (currentSection === '分析') renderAnalytics();
        });
    });

    // 侧边栏导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) switchSection(section);
        });
    });
}

// ============================================================
//  14. 工具函数
// ============================================================

function generateDateLabels(days) {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    return labels;
}

function animateNumber(id, target, duration, prefix) {
    const element = document.getElementById(id);
    if (!element) return;
    if (duration <= 0 || target === 0) {
        element.textContent = (prefix || '') + target.toLocaleString();
        return;
    }

    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = (prefix || '') + target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = (prefix || '') + Math.floor(current).toLocaleString();
        }
    }, 16);
}

function showNotification(message, type) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#2563eb' : '#667085'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10001;
        font-family: inherit;
        font-size: 0.95rem;
        animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================================
//  15. 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    allOrders = generateOrders(200);
    initCharts();
    refreshDashboard();
    setupEventListeners();
});

// ---- 注入动画关键帧 ----
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(animStyle);