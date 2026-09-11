import { History } from 'history';
import { RoutesPath } from '../../consts/RoutesPath';

export function redirectMainLoginPageIfNeeded(history: History) {
	if (!isInPublicRoute(history)) {
		goToMainLoginPage(history);
	}
}

function isInPublicRoute(history: History) {
	switch (history.location.pathname) {
		case RoutesPath.login.login:
		case RoutesPath.login.join:
		case RoutesPath.login.forgotPassword:
		case RoutesPath.login.registration:
		case RoutesPath.login.updatePasswordFromForgotPassword:
		case RoutesPath.login.updatePasswordFromRegistration:
		case RoutesPath.login.withShortCode:
		case RoutesPath.howToUse:
			return true;
		default:
			return false;
	}
}

function goToMainLoginPage(history: History) {
	if (![RoutesPath.root, RoutesPath.login.login, `${RoutesPath.login.login}/`].includes(history.location.pathname)) {
		sessionStorage.setItem("ExternalURL", history.location.pathname + history.location.search)
	}
	history.push(RoutesPath.login.login);
}

export function onUrlChange(eventFunction) {
	window.onpopstate = () => {
		eventFunction();
	};
}

export function getValueFromHistroyQuery(history: History, key: string) {
	const firstIndex = history.location.search.indexOf(key); // in query
	return history.location.search.slice(firstIndex + key.length + 1);
}

export function getValueFromHistroyQueryWithLength(history: History, key: string, length: number) {
	const firstIndex = history.location.search.indexOf(key) + key.length + 1; // in query
	const lastIndex = firstIndex + length;
	return history.location.search.slice(firstIndex, lastIndex);
}

export function getValueFromHistroyUrl(history: History, key: string) {
	let firstIndex = history.location.pathname.indexOf(key); // in url
	return history.location.pathname.slice(firstIndex + key.length + 1);
}

export function checkIfCategory(history: History) {
	return history.location.pathname.indexOf('category/productPage') > 0;
}

export function isMint(history: History) {
	if (
		history &&
		history.location &&
		history.location.pathname &&
		history.location.pathname.indexOf(RoutesPath.mint.root) == 0
	) {
		return true;
	} else {
		return false;
	}
}
