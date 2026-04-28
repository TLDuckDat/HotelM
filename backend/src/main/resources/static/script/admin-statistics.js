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

    function formatCurrency(val) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
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

        document.getElementById("kpi-total-revenue").textContent = formatCurrency(totalRev);
        document.getElementById("kpi-total-target").textContent = formatCurrency(totalTarget);
        
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
                "<td>" + formatCurrency(kpi.totalRevenue) + "</td>" +
                "<td>" + formatCurrency(kpi.revenueTarget) + "</td>" +
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

        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual Revenue (VND)',
                        data: dataRevenue,
                        backgroundColor: '#d4af37', // Gold accent
                        borderColor: '#b5952f',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Target KPI (VND)',
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
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    function populateBranches() {
        if (!global.BranchApi) return;
        global.BranchApi.getBranches().then(function(res) {
            var branches = Array.isArray(res) ? res : (res.payload || res.data || []);
            var select = document.getElementById("kpi-branch-select");
            var options = '<option value="" disabled selected>Select Branch</option>';
            branches.forEach(function(b) {
                options += '<option value="' + b.branchId + '">' + b.branchName + '</option>';
            });
            select.innerHTML = options;
        }).catch(function(e) {
            console.error("Failed to load branches", e);
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
            renderSummary(kpiList);
            renderTable(kpiList);
            renderChart(kpiList);
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to load KPI data";
            setMessage(msg, "error");
        });
    }

    function handleSetTarget(e) {
        e.preventDefault();
        var branchId = document.getElementById("kpi-branch-select").value;
        var year     = parseInt(document.getElementById("kpi-target-year").value);
        var month    = parseInt(document.getElementById("kpi-target-month").value);
        var revenue  = parseFloat(document.getElementById("kpi-target-revenue").value);

        if (!branchId) { setMessage("Please select a branch", "error"); return; }
        if (!year || !month || isNaN(revenue) || revenue < 0) {
            setMessage("Please fill in all target fields correctly.", "error"); return;
        }

        // KPITargetRequest fields: branchId, year, month, revenueTarget
        var payload = {
            branchId:      branchId,
            year:          year,
            month:         month,
            revenueTarget: revenue   // ← was wrongly "targetRevenue" before
        };

        global.KpiApi.setTarget(payload).then(function() {
            setMessage("Target KPI updated successfully", "success");
            loadKpiData();
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to set KPI target";
            setMessage(msg, "error");
        });
    }

    function handleRecalculate() {
        var branchId = document.getElementById("kpi-branch-select").value;
        if (!branchId) {
            setMessage("Please select a branch to recalculate", "error");
            return;
        }
        var year = parseInt(document.getElementById("kpi-target-year").value);
        var month = parseInt(document.getElementById("kpi-target-month").value);

        global.KpiApi.recalculateKPI(branchId, year, month).then(function() {
            setMessage("KPI Recalculated for branch", "success");
            loadKpiData();
        }).catch(function(error) {
            var msg = error && error.payload && error.payload.message ? error.payload.message : "Failed to recalculate KPI";
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
