(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading kpiApi.js");
    }

    var KPI_ENDPOINT = "/kpi";

    function getKPIByBranchAndMonth(branchId, year, month, options) {
        var opts = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, {
                year: year,
                month: month
            })
        });
        return baseApi.get(KPI_ENDPOINT + "/branch/" + encodeURIComponent(branchId), opts);
    }

    function getKPIHistory(branchId, options) {
        return baseApi.get(KPI_ENDPOINT + "/branch/" + encodeURIComponent(branchId) + "/history", options);
    }

    function getAllBranchesKPI(year, month, options) {
        var opts = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, {
                year: year,
                month: month
            })
        });
        return baseApi.get(KPI_ENDPOINT + "/all", opts);
    }

    function setTarget(payload, options) {
        return baseApi.post(KPI_ENDPOINT + "/target", payload, options);
    }

    function recalculateKPI(branchId, year, month, options) {
        var opts = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, {
                year: year,
                month: month
            })
        });
        return baseApi.post(KPI_ENDPOINT + "/recalculate/" + encodeURIComponent(branchId), null, opts);
    }

    global.KpiApi = {
        getKPIByBranchAndMonth: getKPIByBranchAndMonth,
        getKPIHistory: getKPIHistory,
        getAllBranchesKPI: getAllBranchesKPI,
        setTarget: setTarget,
        recalculateKPI: recalculateKPI
    };
})(window);
