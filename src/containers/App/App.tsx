import { createBrowserHistory, History } from 'history';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { matchPath } from 'react-router';
import { BIOMETRICS_STORE } from 'src/consts/stores';
import BiometricsStore from 'src/stores/BiometricsStore';
import ConfirmOrderComponent from '../../components/BeyhadComponents/OrdersHistory/ShowsHistory/ShowVarient/ConfirmOrderComponent';
import { RoutesPath } from '../../consts/RoutesPath';
import rootStores from '../../stores';
import { getValueFromHistroyQuery, isMint } from '../../utils/authentication/historyUtils';
import BeyahadWebsite from './BeyahadWebsite';
import { listenToHistoryChanges } from './historyForApp';
import MintBeyahadWebsite from './MintBeyahadWebsite';
import NavFooter from './NavFooter';
import { useEffect } from 'react';


const history: History | any = createBrowserHistory();
listenToHistoryChanges(history);

const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

const App = () => {

	useEffect(() => {
		listenToNativeAppMessages();
		return () => {
			document.removeEventListener("message", () => { })
		}
	}, [])

	const listenToNativeAppMessages = () => {
		//for ios native messages
		window.addEventListener("message", (message: any) => {
			message = message.data;
			try {
				message = JSON.parse(message).action;
				if (message.isFromNativeApp) {
					biometricsStore.onMessageFromNativeApp(message);
				}
			}
			catch {

			}
		});

		//for android native messages
		document.addEventListener("message", (message: any) => {
			message = message.data;
			try {
				message = JSON.parse(message).action;
				if (message.isFromNativeApp) {
					biometricsStore.onMessageFromNativeApp(message);
				}
			}
			catch {

			}
		});
	}

	    const renderByUrl = () => {
        if (isMint(history)) {
            return <MintBeyahadWebsite history={history} />;
        } else {
            return <BeyahadWebsite history={history} />;
        }
    }

	const shouldRenderNavButtons = () => {
		const isWebViewValue = localStorage.getItem('webview');
		return isWebViewValue;
	}

	const showNavButtonsClassName = shouldRenderNavButtons() ? 'show-nav-footer' : 'hide-nav-footer';
	return (
		<Provider {...rootStores}>
			<div className={`navigation-container ${showNavButtonsClassName}`}>
				{renderByUrl()}
				{/* <NavFooter history={history} /> */}
			</div>
		</Provider>
	);
}
export default App;
