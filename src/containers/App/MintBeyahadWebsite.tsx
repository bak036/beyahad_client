import { observer } from 'mobx-react';
import { CustomButton, Logger } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../consts/RoutesPath';
import {
	getValueFromHistroyQuery,
	checkIfCategory,
	getValueFromHistroyUrl,
} from '../../utils/authentication/historyUtils';
import MintAppRouting from './MintAppRouting';
import AppLoading from '../AppLoading/AppLoading';
import AuthStore from '../../stores/AuthStore';
import CartStore from '../../stores/CartStore';
import WalletStore from '../../stores/WalletStore';
import MessagesStore from '../../stores/MessagesStore';
import ShopsStore from '../../stores/ShopsStore';
import ProfileCardStore from '../../stores/ProfileCardStore';
import ViewStore from '../../stores/ViewStore';
import HomePageStore from '../../stores/HomePageStore';
import ConfigurationStore from '../../stores/ConfigurationStore';
import {
	AUTH_STORE,
	CART_STORE,
	WALLET_STORE,
	MESSAGES_STORE,
	SHOPS_STORE,
	PROFILE_CARD_STORE,
	VIEW_STORE,
	HOMEPAGE_STORE,
	CONFIGURATION_STORE,
	MINT_STORE,
} from '../../consts/stores';
import rootStores from '../../stores';
import { registrationStatus } from '../../utils/authentication/enums';
import NofhonitStorage from '../../utils/NofhonitStorage';
import MintStore from '../../stores/MintStore';
import { useEffect, useState } from 'react';

interface IState {
	loading: boolean;
}
const mintStore: MintStore = rootStores[MINT_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const cartStore: CartStore = rootStores[CART_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const shopsStore: ShopsStore = rootStores[SHOPS_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

interface IProps {
	history?: any;
}

const MintBeyahadWebsite: React.FC<IProps> = ({
	history
}) => {
	const [loading, setLoading] = useState<boolean>(true)
	useEffect(() => {
		
		if (!mintStore.token) return;
		authStore
			.mintTryLogin(mintStore.token)
			.then(async (user) => {
				await initStores();
				return user;
			})
			.then((user) => {
				// TODO: move to other function
				// After the user joined a token is created, the site recognize it
				// as a logged in user, the next time the user refreshes the site
				// shouldUpdateorRegister is 2, and the user is directed to registration.
				if (checkIfCategory(history)) {
					NofhonitStorage.saveCategoryIdSession(getValueFromHistroyUrl(history, 'category/productPage'));
				}
				if (user.shouldUpdateorRegister == registrationStatus.NeedRegister) {
					history.replace(RoutesPath.mint.registration);
				} else if (user.shouldUpdateorRegister == registrationStatus.NeedEdit) {
					history.replace(RoutesPath.mint.updateProfile);
				}
			})
			.catch(() => {
				if (checkIfCategory(history)) {
					NofhonitStorage.saveCategoryIdSession(getValueFromHistroyUrl(history, 'category/productPage'));
				}
				history.push(RoutesPath.mint.join);
			})
			.finally(() => {
				// SetState loading=false in order to show the user the page
				setLoading(false)
			});
	}, [mintStore.token])

	const getValueFromMessege = (message: any) => {
		
		console.log('testttttttttttttttttt')
		if (!mintStore.token) {
			try {
				const msg = JSON.parse(message.data);
				if (msg && msg.messageKey === 'WalletLogin') {
					mintStore.token = msg.value;
				}
			} catch { }
		}
	};
	
	useEffect(() => {
		window.addEventListener('message', getValueFromMessege);
		window.parent.postMessage('getToken', '*');
	}, [])



	const initStores = async () => {
		await configurationStore.init();
		await messagesStore.init();
		cartStore.init();
		walletStore.init();
		// shopsStore.init();
		profileCardStore.init();
		viewStore.init();
		homePageStore.init();
	};

	if (loading) {
		return <AppLoading />;
	} else {
		const accestoken = mintStore.token;
		return (
			<div className='app-container'>
				{/* <div className='app-container-mint'>
					<CustomButton
						text={`ההזמנות שלי`}
						disabled={!mintStore.isButtonsActive}
						buttonClassName='mintButtonDesign'
						onClick={redirectToHistory}
					/>
					<CustomButton
						text={`סל קניות`}
						disabled={!mintStore.isButtonsActive}
						buttonClassName='mintButtonDesign'
						onClick={redirectToCart}
					/>
				</div> */}
				<AppLoading />
				<MintAppRouting history={history} accessToken={accestoken} />
			</div>
		);
	}
}
export default observer(MintBeyahadWebsite)
