(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading contactApi.js");
    }

    var CONTACT_ENDPOINT = "/contacts";

    function getContacts(options) {
        return baseApi.get(CONTACT_ENDPOINT, options);
    }

    function createContact(payload, options) {
        return baseApi.post(CONTACT_ENDPOINT, payload, options);
    }

    function deleteContact(id, options) {
        return baseApi.del(CONTACT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.ContactApi = {
        getContacts: getContacts,
        createContact: createContact,
        deleteContact: deleteContact
    };
})(window);

