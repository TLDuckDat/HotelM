(function (global) {
    "use strict";

    var internalAuthToken = null;
    var isFormDataSupported = typeof FormData !== "undefined";

    function resolveBaseUrl() {
        return global.__HOTELM_API_BASE_URL__ || "";
    }

    function buildUrl(endpoint, query) {
        var normalizedEndpoint = endpoint.charAt(0) === "/" ? endpoint : "/" + endpoint;
        var url = resolveBaseUrl() + normalizedEndpoint;

        if (!query || typeof query !== "object") {
            return url;
        }

        var queryEntries = Object.keys(query)
            .filter(function (key) {
                return query[key] !== undefined && query[key] !== null && query[key] !== "";
            })
            .map(function (key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(String(query[key]));
            });

        if (queryEntries.length === 0) {
            return url;
        }

        return url + "?" + queryEntries.join("&");
    }

    function decodeJwtPayload(token) {
        var parts = token.split(".");
        if (parts.length < 2) {
            return null;
        }
        var base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
            base64 += "=";
        }
        try {
            return JSON.parse(atob(base64));
        } catch (error) {
            return null;
        }
    }

    function isAuthTokenExpired(token) {
        if (!token) {
            return true;
        }
        var payload = decodeJwtPayload(token);
        if (!payload || !payload.exp) {
            return false;
        }
        return payload.exp * 1000 <= Date.now();
    }

    function redirectToLoginIfNeeded() {
        if (global.AuthStore && typeof global.AuthStore.clearCurrentUser === "function") {
            global.AuthStore.clearCurrentUser();
        }

        if (global.location && global.location.pathname.indexOf("index.html") === -1 && global.location.pathname !== "/") {
            global.location.href = "index.html";
        }
    }

    function parseResponsePayload(response) {
        var contentType = response.headers.get("content-type") || "";
        if (contentType.indexOf("application/json") !== -1) {
            return response.json();
        }

        return response.text().then(function (text) {
            return text || null;
        });
    }

    function request(method, endpoint, options) {
        var config = options || {};
        var normalizedEndpoint = endpoint.charAt(0) === "/" ? endpoint : "/" + endpoint;
        var url = buildUrl(endpoint, config.query);
        var headers = Object.assign(
            {
                "Accept": "application/json"
            },
            config.headers || {}
        );

        var isFormDataBody = isFormDataSupported && (config.body instanceof FormData);

        if (config.body !== undefined && config.body !== null && !isFormDataBody) {
            headers["Content-Type"] = headers["Content-Type"] || "application/json";
        }

        var token = config.authToken || internalAuthToken;
        if (token) {
            if (isAuthTokenExpired(token)) {
                redirectToLoginIfNeeded();
                return Promise.reject(new Error("Session expired"));
            }
            headers["Authorization"] = "Bearer " + token;
        }

        return fetch(url, {
            method: method,
            headers: headers,
            body: config.body !== undefined && config.body !== null
                ? (headers["Content-Type"] === "application/json" ? JSON.stringify(config.body) : config.body)
                : undefined,
            signal: config.signal
        }).then(function (response) {
            return parseResponsePayload(response).then(function (payload) {
                if (!response.ok) {
                    if (response.status === 401 && normalizedEndpoint !== "/auth/login") {
                        redirectToLoginIfNeeded();
                    }

                    var error = new Error("Request failed with status " + response.status);
                    error.status = response.status;
                    error.payload = payload;
                    throw error;
                }

                return payload;
            });
        });
    }

    function setAuthToken(token) {
        internalAuthToken = token || null;
    }

    function clearAuthToken() {
        // Remove current bearer token.
        internalAuthToken = null;
    }

    var api = {
        get: function (endpoint, options) {
            return request("GET", endpoint, options);
        },
        post: function (endpoint, body, options) {
            return request("POST", endpoint, Object.assign({}, options, { body: body }));
        },
        put: function (endpoint, body, options) {
            return request("PUT", endpoint, Object.assign({}, options, { body: body }));
        },
        patch: function (endpoint, body, options) {
            return request("PATCH", endpoint, Object.assign({}, options, { body: body }));
        },
        del: function (endpoint, options) {
            return request("DELETE", endpoint, options);
        },
        buildUrl: buildUrl,
        request: request,
        setAuthToken: setAuthToken,
        clearAuthToken: clearAuthToken
    };

    global.HotelMApiBase = api;
})(window);

