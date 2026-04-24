(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading userApi.js");
    }

    var USER_ENDPOINT = "/users";

    function getUsers(options) {
        return baseApi.get(USER_ENDPOINT, options);
    }

    function getUserById(id, options) {
        return baseApi.get(USER_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function createUser(userPayload, options) {
        return baseApi.post(USER_ENDPOINT, userPayload, options);
    }

    function updateUser(id, userPayload, options) {
        return baseApi.put(USER_ENDPOINT + "/" + encodeURIComponent(id), userPayload, options);
    }

    function deleteUser(id, options) {
        return baseApi.del(USER_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function updateUserStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });

        return baseApi.patch(USER_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    global.UserApi = {
        getUsers: getUsers,
        getUserById: getUserById,
        createUser: createUser,
        updateUser: updateUser,
        deleteUser: deleteUser,
        updateUserStatus: updateUserStatus
    };
})(window);

