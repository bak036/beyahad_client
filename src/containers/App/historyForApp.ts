import {isNullOrUndefined} from 'util';
import MenuStore from '../../stores/MenuStore';
import rootStores from '../../stores';
import { RoutesPath } from 'src/consts/RoutesPath';
import {AUTH_STORE, BIOMETRICS_STORE, MENU_STORE} from '../../consts/stores';
import BiometricsStore from 'src/stores/BiometricsStore';
import AuthStore from 'src/stores/AuthStore';
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const dataLayer = window['dataLayer'];
const menuStore: MenuStore = rootStores[MENU_STORE];

export function listenToHistoryChanges(history) {
	history.listen((location, action) => {
		if (location && !isNullOrUndefined(location.pathname)) {
			dataLayer.push({
				event: 'gtm.historyChange',
				'gtm.newHistoryState': location.pathname,
			});
			if (menuStore && menuStore.showSearchContainerInMobile) {
				menuStore.showSearchContainerInMobile = false;
			}
			if ([RoutesPath.login.login, RoutesPath.root].includes(location.pathname)) {
				menuStore.showGoBackBtn = false;
				biometricsStore.postMessageToNativeApp('showBackBtn=false');
			}
			else {
				menuStore.showGoBackBtn = true;
				biometricsStore.postMessageToNativeApp('showBackBtn=true');
			}
			if(authStore){
				if(authStore.isUserLoggedIn){
					biometricsStore.postMessageToNativeApp('showHeader=true');
				}else{
					biometricsStore.postMessageToNativeApp('showHeader=false');
				}
			}

		}
	});
}
