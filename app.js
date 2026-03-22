// Chart.js 全局配置
Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

let charts = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateStats();
    loadOrders();
    loadTheme();
    setupEventListeners();
    
    // 每 30 秒自动刷新数据
    setInterval(refreshData, 30000);
});

// 初始化图表
function initCharts() {
    initSalesChart();
    initUserChart();
    initOrderChart();
    initCategoryChart();
}

// 销售趋势图表
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    charts.sales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateDateLabels(7),
            datasets: [{
                label: '销售额',
                data: generateRandomData(7, 1000, 5000),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 用户分布图表
function initUserChart() {
    const ctx = document.getElementById('userChart').getContext('2d');
    charts.user = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['北京', '上海', '广州', '深圳', '其他'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 订单状态图表
function initOrderChart() {
    const ctx = document.getElementById('orderChart').getContext('2d');
    charts.order = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['已完成', '处理中', '已取消'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 产品类别图表
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['电子产品', '服装', '图书', '家居', '食品'],
            datasets: [{
                label: '销量',
                data: [120, 95, 75, 60, 45],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 更新销售图表
function updateSalesChart() {
    const days = parseInt(document.getElementById('salesFilter').value);
    const newData = generateRandomData(days, 1000, 5000);
    
    charts.sales.data.labels = generateDateLabels(days);
    charts.sales.data.datasets[0].data = newData;
    charts.sales.update();
}

// 更新统计数据
function updateStats() {
    animateNumber('total-users', 12580, 0);
    animateNumber('total-revenue', 258960, 0, '¥');
    animateNumber('total-orders', 3254, 0);
    animateNumber('total-products', 892, 0);
}

// 数字动画
function animateNumber(id, target, duration = 1500, prefix = '') {
    const element = document.getElementById(id);
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
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

// 加载订单数据
function loadOrders() {
    const orders = [
        { id: 'ORD-001', customer: '张三', amount: 1299, status: 'success', date: '2026-03-22' },
        { id: 'ORD-002', customer: '李四', amount: 899, status: 'pending', date: '2026-03-22' },
        { id: 'ORD-003', customer: '王五', amount: 2599, status: 'success', date: '2026-03-21' },
        { id: 'ORD-004', customer: '赵六', amount: 459, status: 'error', date: '2026-03-21' },
        { id: 'ORD-005', customer: '孙七', amount: 3299, status: 'success', date: '2026-03-20' }
    ];
    
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>¥${order.amount.toLocaleString()}</td>
            <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${order.date}</td>
        </tr>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'success': '已完成',
        'pending': '处理中',
        'error': '已取消'
    };
    return statusMap[status] || status;
}

// 刷新数据
function refreshData() {
    const btn = document.querySelector('.refresh-btn');
    btn.style.animation = 'rotate 1s ease-in-out';
    
    setTimeout(() => {
        updateStats();
        updateSalesChart();
        loadOrders();
        btn.style.animation = '';
        showNotification('数据已更新', 'success');
    }, 1000);
}

// 生成日期标签
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

// 生成随机数据
function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// 主题切换
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    const icon = document.getElementById('theme-toggle').querySelector('.icon');
    icon.textContent = isLight ? '☀️' : '🌙';
    
    // 更新图表颜色
    updateChartColors(isLight);
    
    localStorage.setItem('dashboardTheme', isLight ? 'light' : 'dark');
}

// 更新图表颜色
function updateChartColors(isLight) {
    const color = isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    Chart.defaults.color = color;
    Chart.defaults.borderColor = borderColor;
    
    Object.values(charts).forEach(chart => {
        chart.options.scales = {
            ...chart.options.scales,
            x: { ticks: { color }, grid: { color: borderColor } },
            y: { ticks: { color }, grid: { color: borderColor } }
        };
        chart.update();
    });
}

// 加载保存的主题
function loadTheme() {
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle').querySelector('.icon').textContent = '☀️';
        updateChartColors(true);
    }
}

// 查看全部订单
function viewAllOrders() {
    showNotification('正在加载所有订单...', 'info');
}

// 设置事件监听
function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
}

// 通知提示
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f5576c'};
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

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
