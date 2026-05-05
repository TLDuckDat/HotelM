(function (global) {
    "use strict";

    var revenueChart = null;
    var performanceChart = null;
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth() + 1;

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    function initFilters() {
        var yearSelect = document.getElementById("stat-year");
        var monthSelect = document.getElementById("stat-month");

        // Populate years (current year and 2 years back)
        for (var i = currentYear; i >= currentYear - 2; i--) {
            var opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            yearSelect.appendChild(opt);
        }

        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;

        yearSelect.addEventListener("change", function () {
            currentYear = parseInt(this.value);
            loadDashboard();
        });

        monthSelect.addEventListener("change", function () {
            currentMonth = parseInt(this.value);
            loadDashboard();
        });

        document.getElementById("refresh-stats").addEventListener("click", loadDashboard);
    }

    function loadDashboard() {
        loadGlobalSummary();
        loadCharts();
        loadBranches();
    }

    function loadGlobalSummary() {
        global.KpiApi.getGlobalSummary(currentYear, currentMonth).then(function (res) {
            var data = res.payload || res.data || res;
            document.getElementById("global-revenue").textContent = formatCurrency(data.totalRevenue || 0);
            document.getElementById("global-bookings").textContent = data.totalBookings || 0;
            document.getElementById("global-occupancy").textContent = (data.averageOccupancyRate || 0).toFixed(1) + "%";
            document.getElementById("global-rating").textContent = (data.averageRating || 0).toFixed(1);
        }).catch(function (err) {
            console.error("Failed to load global summary", err);
        });
    }

    function loadCharts() {
        global.KpiApi.getAllBranchesKPI(currentYear, currentMonth).then(function (res) {
            var kpis = Array.isArray(res) ? res : (res.payload || res.data || []);
            renderRevenueBranchChart(kpis);
            renderPerformanceChart(kpis);
        }).catch(function (err) {
            console.error("Failed to load chart data", err);
        });
    }

    function renderRevenueBranchChart(kpis) {
        var ctx = document.getElementById('revenueBranchChart').getContext('2d');
        
        if (revenueChart) {
            revenueChart.destroy();
        }

        var labels = kpis.map(function(k) { return k.branchName || "Unknown"; });
        var revenues = kpis.map(function(k) { return k.totalRevenue || 0; });
        var targets = kpis.map(function(k) { return k.revenueTarget || 0; });

        revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual Revenue',
                        data: revenues,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Target',
                        data: targets,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        type: 'line'
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
                            callback: function(value) { return '$' + value; }
                        }
                    }
                }
            }
        });
    }

    function renderPerformanceChart(kpis) {
        var ctx = document.getElementById('performanceChart').getContext('2d');
        
        if (performanceChart) {
            performanceChart.destroy();
        }

        var labels = kpis.map(function(k) { return k.branchName || "Unknown"; });
        var occupancy = kpis.map(function(k) { return k.occupancyRate || 0; });
        var ratings = kpis.map(function(k) { return (k.averageRating || 0) * 20; }); // Scale to 100

        performanceChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Occupancy Rate (%)',
                        data: occupancy,
                        fill: true,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                    },
                    {
                        label: 'Rating (Normalized %)',
                        data: ratings,
                        fill: true,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        pointBackgroundColor: 'rgba(153, 102, 255, 1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }

    function loadBranches() {
        global.BranchApi.getBranches().then(function (res) {
            var branches = Array.isArray(res) ? res : (res.payload || res.data || []);
            var selector = document.getElementById("branch-selector");
            
            // Keep first option
            selector.innerHTML = '<option value="" disabled selected>Select Branch</option>';
            
            branches.forEach(function (b) {
                var opt = document.createElement("option");
                opt.value = b.branchId || b.id;
                opt.textContent = b.branchName || b.name;
                selector.appendChild(opt);
            });

            selector.addEventListener("change", function() {
                loadBranchKPI(this.value);
            });
        }).catch(function (err) {
            console.error("Failed to load branches", err);
        });
    }

    function loadBranchKPI(branchId) {
        global.KpiApi.getKPIByBranch(branchId, currentYear, currentMonth).then(function (res) {
            var kpi = res.payload || res.data || res;
            displayBranchKPI(kpi);
        }).catch(function (err) {
            console.error("Failed to load branch KPI", err);
        });
    }

    function displayBranchKPI(kpi) {
        document.getElementById("no-branch-selected").style.display = "none";
        document.getElementById("branch-kpi-content").style.display = "block";

        document.getElementById("branch-revenue").textContent = formatCurrency(kpi.totalRevenue || 0);
        document.getElementById("branch-target").textContent = formatCurrency(kpi.revenueTarget || 0);
        
        var rate = (kpi.revenueAchievementRate || 0).toFixed(1);
        document.getElementById("branch-achievement").textContent = rate + "%";
        document.getElementById("branch-achievement-bar").style.width = Math.min(100, rate) + "%";

        // Re-bind actions with current branchId
        var recalBtn = document.getElementById("recalculate-branch");
        recalBtn.onclick = function() {
            global.KpiApi.recalculate(kpi.branchId, currentYear, currentMonth).then(function(res) {
                displayBranchKPI(res.payload || res.data || res);
                loadGlobalSummary();
                loadCharts();
            });
        };

        var targetBtn = document.getElementById("set-target-btn");
        targetBtn.onclick = function() {
            showTargetModal(kpi);
        };
    }

    function showTargetModal(kpi) {
        var modal = document.getElementById("targetModal");
        document.getElementById("target-branch-name").textContent = "Branch: " + kpi.branchName;
        document.getElementById("target-amount").value = kpi.revenueTarget || 0;
        modal.style.display = "flex";

        document.getElementById("save-target").onclick = function() {
            var payload = {
                branchId: kpi.branchId,
                year: currentYear,
                month: currentMonth,
                revenueTarget: parseFloat(document.getElementById("target-amount").value)
            };
            global.KpiApi.setTarget(payload).then(function(res) {
                displayBranchKPI(res.payload || res.data || res);
                loadCharts();
                modal.style.display = "none";
            });
        };

        document.getElementById("close-target").onclick = function() {
            modal.style.display = "none";
        };
    }

    function init() {
        if (!global.Guard.requireAdmin()) return;
        
        global.AppShell.renderTopbar("Statistics & KPI Dashboard");
        initFilters();
        loadDashboard();
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);
