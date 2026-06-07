(function (global) {
    "use strict";

    var revenueChart = null;

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
        setTimeout(function() { box.style.display = "none"; }, 5000);
    }

    function formatPercent(val) {
        return (val || 0).toFixed(2) + "%";
    }

    // ── Render ──

    function renderSummary(kpiList) {
        var totalRev = 0;
        var totalTarget = 0;
        
        kpiList.forEach(function(kpi) {
            totalRev += (kpi.totalRevenue || 0);
            totalTarget += (kpi.revenueTarget || 0);
        });

        var avgAchiev = totalTarget > 0 ? (totalRev / totalTarget) * 100 : 0;

        document.getElementById("kpi-total-revenue").textContent = window.formatCurrency(totalRev);
        document.getElementById("kpi-total-target").textContent = window.formatCurrency(totalTarget);
        
        var achievEl = document.getElementById("kpi-avg-achievement");
        achievEl.textContent = formatPercent(avgAchiev);
        if (avgAchiev >= 100) {
            achievEl.className = "value success-value";
        } else if (avgAchiev < 50 && totalTarget > 0) {
            achievEl.className = "value danger-value";
        } else {
            achievEl.className = "value";
        }
    }

    function renderTable(kpiList) {
        var tbody = document.getElementById("kpi-table-body");
        if (!kpiList || kpiList.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' class='table-empty'>No KPI data available for this period</td></tr>";
            return;
        }

        tbody.innerHTML = kpiList.map(function(kpi) {
            var achievClass = kpi.revenueAchievementRate >= 100 ? "style='color:#28a745;font-weight:bold;'" : "";
            return "<tr>" +
                "<td><strong>" + (kpi.branchName || kpi.branchId) + "</strong></td>" +
                "<td>" + window.formatCurrency(kpi.totalRevenue) + "</td>" +
                "<td>" + window.formatCurrency(kpi.revenueTarget) + "</td>" +
                "<td " + achievClass + ">" + formatPercent(kpi.revenueAchievementRate) + "</td>" +
                "<td>" + formatPercent(kpi.occupancyRate) + "</td>" +
                "<td>" + (kpi.averageRating ? kpi.averageRating.toFixed(1) + " <i class='fas fa-star' style='color:#f39c12'></i>" : "N/A") + "</td>" +
            "</tr>";
        }).join("");
    }

    function renderChart(kpiList) {
        var ctx = document.getElementById('kpiRevenueChart');
        if (!ctx) return;

        if (revenueChart) {
            revenueChart.destroy();
        }

        var labels = kpiList.map(function(k) { return k.branchName || k.branchId; });
        var dataRevenue = kpiList.map(function(k) { return k.totalRevenue || 0; });
        var dataTarget = kpiList.map(function(k) { return k.revenueTarget || 0; });

        var isVi = document.documentElement.lang === 'vi' || (global.localStorage && global.localStorage.getItem('sot_lang') === 'vi');
        var actualRevLabel = isVi ? 'Doanh thu thực tế (VNĐ)' : 'Actual Revenue (VND)';
        var targetKpiLabel = isVi ? 'Mục tiêu KPI (VNĐ)' : 'Target KPI (VND)';

        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: actualRevLabel,
                        data: dataRevenue,
                        backgroundColor: '#d4af37', // Gold accent
                        borderColor: '#b5952f',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: targetKpiLabel,
                        data: dataTarget,
                        backgroundColor: 'rgba(51, 51, 51, 0.2)', // Dark gray semi-transparent
                        borderColor: '#333',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        type: 'line',
                        tension: 0.1,
                        pointBackgroundColor: '#333'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + window.formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    var currentBranches = [];
    var currentKpis = [];

    function populateBranches() {
        if (!global.BranchApi) return;
        global.BranchApi.getBranches().then(function(res) {
            currentBranches = Array.isArray(res) ? res : (res.payload || res.data || []);
            renderBranchInputs();
            document.getElementById("btn-save-kpi").disabled = false;
        }).catch(function(e) {
            console.error("Failed to load branches", e);
        });
    }

    function renderBranchInputs() {
        var container = document.getElementById("kpi-branch-inputs");
        if (!container) return;
        
        var html = currentBranches.map(function(b) {
            return '<div class="form-field">' +
                   '<label class="form-label">' + b.branchName + '</label>' +
                   '<input class="form-input kpi-branch-target-input" data-branch-id="' + b.branchId + '" type="number" min="0" step="1000" placeholder="0" required />' +
                   '</div>';
        }).join("");
        container.innerHTML = html;
        populateBranchInputValues();
    }

    function populateBranchInputValues() {
        var inputs = document.querySelectorAll('.kpi-branch-target-input');
        inputs.forEach(function(input) {
            var branchId = input.getAttribute('data-branch-id');
            var match = currentKpis.find(function(k) { return k.branchId === branchId; });
            input.value = match ? (match.revenueTarget || 0) : 0;
        });
    }

    // ── API Interactions ──

    function getSelectedDate() {
        var val = document.getElementById("kpi-month-selector").value;
        if (!val) {
            var now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() + 1 };
        }
        var parts = val.split('-');
        return { year: parseInt(parts[0]), month: parseInt(parts[1]) };
    }

    function loadKpiData() {
        var date = getSelectedDate();
        global.KpiApi.getAllBranchesKPI(date.year, date.month).then(function(res) {
            var kpiList = Array.isArray(res) ? res : (res.payload || res.data || []);
            currentKpis = kpiList;
            renderSummary(kpiList);
            renderTable(kpiList);
            renderChart(kpiList);
            populateBranchInputValues();
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to load KPI data";
            setMessage(msg, "error");
        });
    }

    function handleSetTarget(e) {
        e.preventDefault();
        var year     = parseInt(document.getElementById("kpi-target-year").value);
        var month    = parseInt(document.getElementById("kpi-target-month").value);

        if (!year || !month) {
            setMessage("Please fill in year and month.", "error"); return;
        }

        var inputs = document.querySelectorAll('.kpi-branch-target-input');
        var promises = [];
        
        inputs.forEach(function(input) {
            var branchId = input.getAttribute('data-branch-id');
            var revenue = parseFloat(input.value) || 0;
            promises.push(global.KpiApi.setTarget({
                branchId: branchId,
                year: year,
                month: month,
                revenueTarget: revenue
            }));
        });

        setMessage("Saving targets...", "notice");
        Promise.all(promises).then(function() {
            setMessage("Target KPIs updated successfully", "success");
            loadKpiData();
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to set KPI targets";
            setMessage(msg, "error");
        });
    }

    function handleRecalculate() {
        var year = parseInt(document.getElementById("kpi-target-year").value);
        var month = parseInt(document.getElementById("kpi-target-month").value);

        if (!year || !month) {
            setMessage("Please fill in year and month.", "error"); return;
        }

        var promises = currentBranches.map(function(b) {
            return global.KpiApi.recalculateKPI(b.branchId, year, month);
        });

        setMessage("Recalculating KPIs...", "notice");
        Promise.all(promises).then(function() {
            setMessage("KPIs Recalculated for all branches", "success");
            loadKpiData();
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to recalculate KPIs";
            setMessage(msg, "error");
        });
    }

    // ── Sidebar / Layout ──

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    window.toggleNotification = function (e) {
        e.stopPropagation();
        var menu = document.getElementById("notificationMenu");
        if (menu) menu.classList.toggle("active");
    };

    document.addEventListener("click", function (e) {
        var dropdown = document.querySelector(".notification-dropdown");
        if (dropdown && !dropdown.contains(e.target)) {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });

    // ── Init ──

    function init() {
        if (!global.Guard.requireAdmin()) return;
        global.AppShell.renderTopbar("Revenue Statistics");

        var user = global.AuthStore.getCurrentUser();
        if (user) {
            var topbarEl = document.getElementById("topbar-username");
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            if (topbarEl) topbarEl.textContent = user.fullName || "Admin";
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
        }

        // Init date selectors
        var now = new Date();
        var yyyy = now.getFullYear();
        var mm = String(now.getMonth() + 1).padStart(2, '0');
        document.getElementById("kpi-month-selector").value = yyyy + "-" + mm;
        document.getElementById("kpi-target-year").value = yyyy;
        document.getElementById("kpi-target-month").value = now.getMonth() + 1;

        // Ensure chart updates when language changes
        window.addEventListener('languageChanged', function() {
            if (currentKpis && currentKpis.length > 0) {
                renderChart(currentKpis);
            }
        });

        document.getElementById("kpi-month-selector").addEventListener("change", loadKpiData);
        document.getElementById("admin-set-kpi-form").addEventListener("submit", handleSetTarget);
        document.getElementById("btn-recalculate-kpi").addEventListener("click", handleRecalculate);

        populateBranches();
        loadKpiData();
    }

    document.addEventListener("DOMContentLoaded", init);

    global.AdminStatistics = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);
