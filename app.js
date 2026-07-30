// Verified Real Database Payload
const REAL_DATABASE_PAYLOADS = {
    monthly_sales: [
        { month_: 1, no_of_order: 322 },
        { month_: 2, no_of_order: 402 },
        { month_: 3, no_of_order: 464 },
        { month_: 4, no_of_order: 673 },
        { month_: 5, no_of_order: 594 }
    ],
    employee_sales_report: [
        { staff_name: "Faizan", today_sales: 10, today_revenue: 10534.226, monthly_sales: 186, monthly_revenue: 142148.002 },
        { staff_name: "Talha", today_sales: 0, today_revenue: 0, monthly_sales: 80, monthly_revenue: 67357.718 },
        { staff_name: "Bhageshri", today_sales: 0, today_revenue: 0, monthly_sales: 80, monthly_revenue: 60324.906 },
        { staff_name: "Prabhat", today_sales: 15, today_revenue: 11513.510, monthly_sales: 76, monthly_revenue: 62733.632 },
        { staff_name: "Sanika", today_sales: 2, today_revenue: 1193.304, monthly_sales: 74, monthly_revenue: 55440.446 },
        { staff_name: "Nidhi", today_sales: 4, today_revenue: 3564.474, monthly_sales: 54, monthly_revenue: 46049.580 },
        { staff_name: "Karishma", today_sales: 3, today_revenue: 2200.840, monthly_sales: 43, monthly_revenue: 37099.268 },
        { staff_name: "Rahul", today_sales: 0, today_revenue: 0, monthly_sales: 1, monthly_revenue: 931.360 }
    ],
    daily_sales: [
        { day_name: "Mon", orders: 12 },
        { day_name: "Tue", orders: 18 },
        { day_name: "Wed", orders: 15 },
        { day_name: "Thu", orders: 25 },
        { day_name: "Fri", orders: 22 },
        { day_name: "Sat", orders: 30 },
        { day_name: "Sun", orders: 28 }
    ]
};

let chartInstances = {};
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// Currency Formatter
function formatCurrency(val) {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

document.addEventListener('DOMContentLoaded', () => {
    const reportDateInput = document.getElementById('reportDate');
    reportDateInput.addEventListener('change', loadDashboard);
    loadDashboard();
});

function loadDashboard() {
    const empData = REAL_DATABASE_PAYLOADS.employee_sales_report;
    const monthlyData = REAL_DATABASE_PAYLOADS.monthly_sales;
    const dailyData = REAL_DATABASE_PAYLOADS.daily_sales;

    // Update KPI Cards
    let totalTodaySales = 0;
    let totalTodayRevenue = 0;
    let topEmp = { staff_name: "-", monthly_revenue: 0 };

    empData.forEach(row => {
        totalTodaySales += Number(row.today_sales || 0);
        totalTodayRevenue += Number(row.today_revenue || 0);
        if (Number(row.monthly_revenue || 0) > topEmp.monthly_revenue) {
            topEmp = row;
        }
    });

    let totalMonthlyOrders = 0;
    monthlyData.forEach(m => {
        totalMonthlyOrders += Number(m.no_of_order || 0);
    });

    document.getElementById('kpiTodaySales').textContent = totalTodaySales;
    document.getElementById('kpiTodayRevenue').textContent = formatCurrency(totalTodayRevenue);
    document.getElementById('kpiMonthlyOrders').textContent = totalMonthlyOrders.toLocaleString('en-IN');
    document.getElementById('kpiTopEmployee').textContent = topEmp.staff_name.trim();

    // Render Charts
    renderMonthlyChart(monthlyData);
    renderDailyChart(dailyData);
    renderEmployeeChart(empData);

    // Render Leaderboard
    renderLeaderboard(empData);
}

// Monthly Chart without hover tooltips
function renderMonthlyChart(data) {
    const ctx = document.getElementById('monthlySalesChart').getContext('2d');
    if (chartInstances.monthly) chartInstances.monthly.destroy();

    const labels = data.map(i => MONTH_NAMES[(i.month_ || 1) - 1] || `Month ${i.month_}`);
    const orders = data.map(i => i.no_of_order || 0);

    chartInstances.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: orders,
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false } // Disabled hover tooltip
            }
        }
    });
}

// Daily Chart without hover tooltips
function renderDailyChart(data) {
    const ctx = document.getElementById('dailySalesChart').getContext('2d');
    if (chartInstances.daily) chartInstances.daily.destroy();

    const labels = data.map(i => i.day_name);
    const orders = data.map(i => i.orders);

    chartInstances.daily = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Orders',
                data: orders,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false } // Disabled hover tooltip
            }
        }
    });
}

// Employee Revenue Chart without hover tooltips
function renderEmployeeChart(data) {
    const ctx = document.getElementById('employeeRevenueChart').getContext('2d');
    if (chartInstances.employee) chartInstances.employee.destroy();

    const sorted = [...data].sort((a, b) => b.monthly_revenue - a.monthly_revenue);
    const labels = sorted.map(i => i.staff_name.trim());
    const revenues = sorted.map(i => i.monthly_revenue);

    chartInstances.employee = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: revenues,
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false } // Disabled hover tooltip
            }
        }
    });
}

// Simple Leaderboard Table
function renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    const sorted = [...data].sort((a, b) => b.monthly_revenue - a.monthly_revenue);

    sorted.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.staff_name.trim()}</td>
            <td>${row.today_sales || 0}</td>
            <td>${formatCurrency(row.today_revenue || 0)}</td>
            <td>${row.monthly_sales || 0}</td>
            <td>${formatCurrency(row.monthly_revenue || 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}
