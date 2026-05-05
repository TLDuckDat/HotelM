(function (global) {
    "use strict";

    var KpiApi = {
        getGlobalSummary: function (year, month) {
            return global.BaseApi.get("/kpi/summary?year=" + year + "&month=" + month);
        },
        getAllBranchesKPI: function (year, month) {
            return global.BaseApi.get("/kpi/all?year=" + year + "&month=" + month);
        },
        getKPIByBranch: function (branchId, year, month) {
            return global.BaseApi.get("/kpi/branch/" + branchId + "?year=" + year + "&month=" + month);
        },
        getKPIHistory: function (branchId) {
            return global.BaseApi.get("/kpi/branch/" + branchId + "/history");
        },
        setTarget: function (payload) {
            return global.BaseApi.post("/kpi/target", payload);
        },
        recalculate: function (branchId, year, month) {
            return global.BaseApi.post("/kpi/recalculate/" + branchId + "?year=" + year + "&month=" + month);
        }
    };

    global.KpiApi = KpiApi;
})(window);
