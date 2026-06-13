Chart.defaults.color = 'rgba(23, 32, 42, 0.7)';
Chart.defaults.borderColor = 'rgba(23, 32, 42, 0.1)';

let charts = {};
let currentRange = 7;
let showAllOrders = false;

const baseOrders = [
    { id: 'ORD-1001', customer: '客户 A', amount: 1299, status: 'success', daysAgo: 0, channel: '自然访问', category: '电子产品', region: '北京' },
    { id: 'ORD-1002', customer: '客户 B', amount: 899, status: 'pending', daysAgo: 0, channel: '活动投放', category: '服装', region: '上海' },
    { id: 'ORD-1003', customer: '客户 C', amount: 2599, status: 'success', daysAgo: 1, channel: '老客复购', category: '电子产品', region: '广州' },
    { id: 'ORD-1004', customer: '客户 D', amount: 459, status: 'error', daysAgo: 1, channel: '自然访问', category: '图书', region: '深圳' },
    { id: 'ORD-1005', customer: '客户 E', amount: 3299, status: 'success', daysAgo: 2, channel: '活动投放', category: '家居', region: '北京' },
    { id: 'ORD-1006', customer: '客户 F', amount: 1799, status: 'success', daysAgo: 3, channel: '老客复购', category: '食品', region: '其他' },
    { id: 'ORD-1007', customer: '客户 G', amount: 699, status: 'pending', daysAgo: 4, channel: '自然访问', category: '图书', region: '上海' },
    { id: 'ORD-1008', customer: '客户 H', amount: 2199, status: 'success', daysAgo: 5, channel: '活动投放', category: '电子产品', region: '广州' },
    { id: 'ORD-1009', customer: '客户 I', amount: 568, status: 'success', daysAgo: 6, channel: '自然访问', category: '食品', region: '深圳' },
    { id: 'ORD-1010', customer: '客户 J', amount: 999, status: 'pending', daysAgo: 8, channel: '老客复购', category: '服装', region: '其他' },
    { id: 'ORD-1011', customer: '客户 K', amount: 1499, status: 'success', daysAgo: 12, channel: '活动投放', category: '家居', region: '北京' },
    { id: 'ORD-1012', customer: '客户 L', amount: 239, status: 'error', daysAgo: 14, channel: '自然访问', category: '图书', region: '上海' },
    { id: 'ORD-1013', customer: '客户 M', amount: 4399, status: 'success', daysAgo: 18, channel: '老客复购', category: '电子产品', region: '深圳' },
    { id: 'ORD-1014', customer: '客户 N', amount: 129, status: 'success', daysAgo: 25, channel: '自然访问', category: '食品', region: '其他' },
    { id: 'ORD-1015', customer: '客户 O', amount: 1099, status: 'pending', daysAgo: 31, channel: '活动投放', category: '服装', region: '广州' },
    { id: 'ORD-1016', customer: '客户 P', amount: 789, status: 'success', daysAgo: 45, channel: '老客复购', category: '家居', region: '上海' },
    { id: 'ORD-1017', customer: '客户 Q', amount: 1999, status: 'success', daysAgo: 61, channel: '活动投放', category: '电子产品', region: '北京' },
    { id: 'ORD-1018', customer: '客户 R', amount: 349, status: 'error', daysAgo: 73, channel: '自然访问', category: '图书', region: '其他' }
];

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    refreshDashboard();
    loadTheme();
    setupEventListeners();
});

function initCharts() {
    initSalesChart();
    initUserChart();
    initOrderChart();
    initCategoryChart();
}

function getFilteredOrders() {
    const channel = document.getElementById('channelFilter')?.value || '全部渠道';
    return baseOrders.filter((order) => {
        const inRange = order.daysAgo < currentRange;
        const inChannel = channel === '全部渠道' || order.channel === channel;
        return inRange && inChannel;
    });
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
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function initUserChart() {
    const ctx = document.getElementById('userChart').getContext('2d');
    charts.user = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['北京', '上海', '广州', '深圳', '其他'],
            datasets: [{
                data: [],
                backgroundColor: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#64748b']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function initOrderChart() {
    const ctx = document.getElementById('orderChart').getContext('2d');
    charts.order = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['已完成', '处理中', '已取消'],
            datasets: [{
                data: [],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['电子产品', '服装', '图书', '家居', '食品'],
            datasets: [{
                label: '成交金额',
                data: [],
                backgroundColor: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#64748b']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function refreshDashboard() {
    const orders = getFilteredOrders();
    updateStats(orders);
    updateCharts(orders);
    loadOrders(orders);
}

function updateCharts(orders) {
    updateSalesChart(orders);
    updateDistributionChart(charts.user, orders, ['北京', '上海', '广州', '深圳', '其他'], 'region');
    updateDistributionChart(charts.order, orders, ['success', 'pending', 'error'], 'status');
    updateDistributionChart(charts.category, orders, ['电子产品', '服装', '图书', '家居', '食品'], 'category', 'amount');
}

function updateSalesChart(orders = getFilteredOrders()) {
    const days = parseInt(document.getElementById('salesFilter').value || currentRange, 10);
    const labels = generateDateLabels(days);
    const data = Array.from({ length: days }, (_, index) => {
        const daysAgo = days - 1 - index;
        return orders
            .filter((order) => order.daysAgo === daysAgo && order.status !== 'error')
            .reduce((sum, order) => sum + order.amount, 0);
    });

    charts.sales.data.labels = labels;
    charts.sales.data.datasets[0].data = data;
    charts.sales.update();
}

function updateDistributionChart(chart, orders, labels, field, valueField = null) {
    const data = labels.map((label) => {
        return orders
            .filter((order) => order[field] === label)
            .reduce((sum, order) => sum + (valueField ? order[valueField] : 1), 0);
    });

    chart.data.labels = field === 'status' ? labels.map(getStatusText) : labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function updateStats(orders) {
    const paidOrders = orders.filter((order) => order.status !== 'error');
    const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
    const activeUsers = 6800 + orders.length * 420;
    const skuCount = new Set(orders.map((order) => order.category)).size * 126 + orders.length;

    animateNumber('total-users', activeUsers, 500);
    animateNumber('total-revenue', revenue, 500, '¥');
    animateNumber('total-orders', orders.length, 500);
    animateNumber('total-products', skuCount, 500);
}

function animateNumber(id, target, duration = 800, prefix = '') {
    const element = document.getElementById(id);
    if (duration <= 0 || target === 0) {
        element.textContent = prefix + target.toLocaleString();
        return;
    }

    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = prefix + target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = prefix + Math.floor(current).toLocaleString();
        }
    }, 16);
}

function loadOrders(orders = getFilteredOrders()) {
    const visibleOrders = (showAllOrders ? orders : orders.slice(0, 8));
    const tbody = document.getElementById('orders-table');

    tbody.innerHTML = visibleOrders.map((order) => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>¥${order.amount.toLocaleString()}</td>
            <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${getDateByDaysAgo(order.daysAgo)}</td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        success: '已完成',
        pending: '处理中',
        error: '已取消'
    };
    return statusMap[status] || status;
}

function refreshData() {
    const btn = document.querySelector('.refresh-btn');
    btn.style.animation = 'rotate 1s ease-in-out';

    setTimeout(() => {
        refreshDashboard();
        btn.style.animation = '';
        showNotification('当前筛选条件下的数据已更新', 'success');
    }, 500);
}

function generateDateLabels(days) {
    const labels = [];
    const today = new Date('2026-06-01T00:00:00');
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    return labels;
}

function getDateByDaysAgo(daysAgo) {
    const date = new Date('2026-06-01T00:00:00');
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().slice(0, 10);
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    const icon = document.getElementById('theme-toggle').querySelector('.icon');
    icon.textContent = isLight ? '☀️' : '🌙';
    updateChartColors(isLight);
    localStorage.setItem('dashboardTheme', isLight ? 'light' : 'dark');
}

function updateChartColors(isLight) {
    const color = isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    Chart.defaults.color = color;
    Chart.defaults.borderColor = borderColor;

    Object.values(charts).forEach((chart) => {
        if (chart.options.scales) {
            Object.values(chart.options.scales).forEach((scale) => {
                scale.ticks = { ...(scale.ticks || {}), color };
                scale.grid = { ...(scale.grid || {}), color: borderColor };
            });
        }
        chart.update();
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('dashboardTheme');
    const themeToggle = document.getElementById('theme-toggle');
    if (savedTheme === 'light' && themeToggle) {
        document.body.classList.add('light-theme');
        themeToggle.querySelector('.icon').textContent = '☀️';
        updateChartColors(true);
    }
}

function viewAllOrders() {
    showAllOrders = !showAllOrders;
    loadOrders();
    showNotification(showAllOrders ? '已展开全部订单' : '已收起订单列表', 'info');
}

function exportOrdersCSV() {
    const orders = getFilteredOrders();
    const header = ['订单号', '客户', '金额', '状态', '渠道', '品类', '地区', '日期'];
    const rows = orders.map((order) => [
        order.id,
        order.customer,
        order.amount,
        getStatusText(order.status),
        order.channel,
        order.category,
        order.region,
        getDateByDaysAgo(order.daysAgo)
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${currentRange}days.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    document.getElementById('channelFilter').addEventListener('change', refreshDashboard);
    document.getElementById('salesFilter').addEventListener('change', () => updateSalesChart());

    document.querySelectorAll('.nav-item').forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
            event.currentTarget.classList.add('active');
        });
    });

    document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach((item) => item.classList.remove('active'));
            chip.classList.add('active');
            currentRange = Number(chip.dataset.range);
            document.getElementById('salesFilter').value = String(currentRange);
            showAllOrders = false;
            refreshDashboard();
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
