import { REMEMBER_ME_LOCAL_STORAGE_KEY, USER_TOKEN_STORAGE_KEY, CATEGORY_ID_SEESION_KEY } from '../consts/localStorage';

class NofhonitStorage {
	/**
	 * Saves the token of the user in localStorage IF rememberMe === true
	 * otherwise, saves it in sessionStorage
	 * @param token The token to save
	 * @param rememberMe Whether to save the token in localStorage or sessionStorage
	 */
	saveToken() {
		localStorage.setItem(USER_TOKEN_STORAGE_KEY, JSON.stringify(true));
	}

	/**
	 * Get the token of the user from the localStorage or the sessionStorage.
	 * depends on the value of "rememberMe" when we saved the token (in "saveToken") method
	 */
	getToken() {
		let isLoggedIn = false;;

		if (localStorage.getItem(USER_TOKEN_STORAGE_KEY)) {
			try {
				isLoggedIn = JSON.parse(localStorage.getItem(USER_TOKEN_STORAGE_KEY)!);
			} catch {
				this.clearStorage();
			}
		}

		return isLoggedIn;
	}

	getCookie() {
		// Cookies.set('LoginClub', 'PersonalNumber=316001197&Password=123456789&Expires=27/05/2020 11:39:19', {path: ''});
		// document.cookie =
		// 	'LoginClub' +
		// 	'=' +
		// 	'PersonalNumber=316001197&Password=123456789&Expires=27/05/2020 11:39:19' +
		// 	';' +
		// 	'27/05/2020 11:39:19' +
		// 	';path=/';
		// document.cookie = 'PersonalNumber=316001197&Password=123456789&Expires=27/05/2020 11:39:19';
		var name = 'LoginClub' + '=';
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		let cookiesArray;
		let cookiesObject: any = {};
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				cookiesArray = c.substring(name.length, c.length).split('&');
			}
		}
		if (cookiesArray) {
			cookiesArray.forEach((cookie) => {
				let tempCookie = cookie.split('=');
				let value = tempCookie[1];
				let name = tempCookie[0];
				cookiesObject[name] = value;
			});
		}
		if (cookiesObject) {
			return cookiesObject;
		} else {
			return undefined;
		}
	}

	clearStorage() {
		localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
	}

	saveCategoryIdSession(categoryId: string) {
		sessionStorage.setItem(CATEGORY_ID_SEESION_KEY, categoryId);
	}

	getCategoryIdSession() {
		return sessionStorage.getItem(CATEGORY_ID_SEESION_KEY);
	}

	deleteCategoryIdSession() {
		sessionStorage.removeItem(CATEGORY_ID_SEESION_KEY);
	}
}

export default new NofhonitStorage();
