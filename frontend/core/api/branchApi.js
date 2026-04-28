(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading branchApi.js");
    }

    var BRANCH_ENDPOINT = "/branches";

    function getBranches(options) {
        return baseApi.get(BRANCH_ENDPOINT, options);
    }

    function getBranchById(id, options) {
        return baseApi.get(BRANCH_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function createBranch(payload, options) {
        return baseApi.post(BRANCH_ENDPOINT, payload, options);
    }

    function updateBranch(id, payload, options) {
        return baseApi.put(BRANCH_ENDPOINT + "/" + encodeURIComponent(id), payload, options);
    }

    function deleteBranch(id, options) {
        return baseApi.del(BRANCH_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function updateBranchStatus(id, status, options) {
        return baseApi.patch(BRANCH_ENDPOINT + "/" + encodeURIComponent(id) + "/status?status=" + encodeURIComponent(status), null, options);
    }

    global.BranchApi = {
        getBranches: getBranches,
        getBranchById: getBranchById,
        createBranch: createBranch,
        updateBranch: updateBranch,
        deleteBranch: deleteBranch,
        updateBranchStatus: updateBranchStatus
    };
})(window);
