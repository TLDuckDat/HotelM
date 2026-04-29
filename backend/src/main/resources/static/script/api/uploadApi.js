(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;
    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading uploadApi.js");
    }

    function uploadRoomImage(file, options) {
        if (!file) {
            return Promise.reject(new Error("File is required"));
        }

        var form = new FormData();
        form.append("file", file);

        return baseApi.request("POST", "/uploads/rooms", Object.assign({}, options, {
            body: form
        }));
    }

    global.UploadApi = {
        uploadRoomImage: uploadRoomImage
    };
})(window);

