(function (global) {
	"use strict";

	var STORAGE_KEY = "hotelm_current_user";

	function setCurrentUser(user) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	}

	function getCurrentUser() {
		var raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return null;
		}

		try {
			return JSON.parse(raw);
		} catch (error) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	function clearCurrentUser() {
		localStorage.removeItem(STORAGE_KEY);
	}

	function isLoggedIn() {
		return !!getCurrentUser();
	}

	function hasRole(role) {
		var user = getCurrentUser();
		return !!(user && user.role === role);
	}

	global.AuthStore = {
		setCurrentUser: setCurrentUser,
		getCurrentUser: getCurrentUser,
		clearCurrentUser: clearCurrentUser,
		isLoggedIn: isLoggedIn,
		hasRole: hasRole
	};
})(window);

