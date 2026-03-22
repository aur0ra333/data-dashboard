// 模拟数据
const dashboardData = {
    totalUsers: 12458,
    totalRevenue: 256780,
    totalOrders: 3456,
    totalProducts: 892,
    salesData: [1200, 1900, 1500, 2200, 1800, 2800, 2400],
    userData: [35, 28, 22, 15],
    orderStatus: [45, 30, 15, 10],
    categoryData: [40, 25, 20, 15]
};

// 订单数据
const orders = [
    { id: 'ORD001', customer: '张三', amount: '¥256.00', status: 'success', date: '2026-03-22' },
    { id: 'ORD002', customer: '李四', amount: '¥1,280.00', status: 'pending', date: '2026-03-22' },
    { id: 'ORD003', customer: '王五', amount: '¥89.00', status: 'success', date: '2026-03-21' },
    { id: 'ORD004', customer: '赵六', amount: '¥567.00', status: 'error', date: '2026-03-21' },
    { id: 'ORD005', customer: '钱七', amount: '¥2,340.00', status: 'success', date: '2026-03-20' }
];

// 初始化仪表板
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    initCharts();
    loadOrders();
});

// 更新统计数据
function updateStats() {
    animateNumber('total-users', dashboardData.totalUsers);
    animateNumber('total-revenue', dashboardData.totalRevenue, '¥');
    animateNumber('total-orders', dashboardData.totalOrders);
    animateNumber('total-products', dashboardData.totalProducts);
}

// 数字动画
function animateNumber(id, target, prefix = '') {
    const element = document.getElementById(id);
    const duration = 1500;
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

// 初始化图表
function initCharts() {
    initSalesChart();
    initUserChart();
    initOrderChart();
    initCategoryChart();
}

// 销售趋势图
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '销售额',
                data: dashboardData.salesData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 用户分布图
function initUserChart() {
    const ctx = document.getElementById('userChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['18-24 岁', '25-34 岁', '35-44 岁', '45+ 岁'],
            datasets: [{
                data: dashboardData.userData,
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// 订单状态图
function initOrderChart() {
    const ctx = document.getElementById('orderChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['已完成', '处理中', '已取消', '退款'],
            datasets: [{
                data: dashboardData.orderStatus,
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// 产品类别图
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['电子产品', '服装', '家居', '图书'],
            datasets: [{
                label: '销量',
                data: dashboardData.categoryData,
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 加载订单列表
function loadOrders() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.amount}</td>
            <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${order.date}</td>
        </tr>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const texts = {
        'success': '已完成',
        'pending': '处理中',
        'error': '已取消'
    };
    return texts[status] || status;
}
