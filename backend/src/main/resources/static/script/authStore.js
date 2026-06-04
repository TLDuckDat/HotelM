(function (global) {
	"use strict";

	var STORAGE_KEY = "hotelm_current_user";

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

	function getAccessToken(user) {
		var u = user || getCurrentUser();
		if (!u) {
			return null;
		}
		return u.accessToken || u.token || null;
	}

	function isTokenExpired(token) {
		if (!token) {
			return true;
		}
		var payload = decodeJwtPayload(token);
		if (!payload || !payload.exp) {
			return false;
		}
		return payload.exp * 1000 <= Date.now();
	}

	function getTokenExpiresAt(token) {
		var payload = decodeJwtPayload(token);
		if (!payload || !payload.exp) {
			return null;
		}
		return new Date(payload.exp * 1000);
	}

	function setCurrentUser(user) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
		if (user && getAccessToken(user) && global.HotelMApiBase) {
			global.HotelMApiBase.setAuthToken(getAccessToken(user));
		}
	}

	function getCurrentUser() {
		var raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return null;
		}

		try {
			var user = JSON.parse(raw);
			var token = getAccessToken(user);
			if (token && global.HotelMApiBase) {
				global.HotelMApiBase.setAuthToken(token);
			}
			return user;
		} catch (error) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	function clearCurrentUser() {
		localStorage.removeItem(STORAGE_KEY);
		if (global.HotelMApiBase && typeof global.HotelMApiBase.clearAuthToken === "function") {
			global.HotelMApiBase.clearAuthToken();
		}
	}

	function isLoggedIn() {
		var token = getAccessToken();
		return !!token && !isTokenExpired(token);
	}

	function ensureValidSession() {
		var user = getCurrentUser();
		if (!user) {
			return false;
		}
		var token = getAccessToken(user);
		if (!token || isTokenExpired(token)) {
			clearCurrentUser();
			return false;
		}
		return true;
	}

	function hasRole(role) {
		if (!ensureValidSession()) {
			return false;
		}
		var user = getCurrentUser();
		return !!(user && user.role === role);
	}

	global.AuthStore = {
		setCurrentUser: setCurrentUser,
		getCurrentUser: getCurrentUser,
		clearCurrentUser: clearCurrentUser,
		isLoggedIn: isLoggedIn,
		ensureValidSession: ensureValidSession,
		hasRole: hasRole,
		getAccessToken: function () { return getAccessToken(); },
		isTokenExpired: isTokenExpired,
		getTokenExpiresAt: function () { return getTokenExpiresAt(getAccessToken()); }
	};
})(window);
