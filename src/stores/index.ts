import {env} from '../config';
import {
	ADVERTING_STORE,
	AUTH_STORE,
	CART_STORE,
	CATEGORY_STORE,
	CONTACT_STORE,
	CREDIT_CARD_STORE,
	HOMEPAGE_STORE,
	MENU_STORE,
	MESSAGES_STORE,
	ORDERS_HISTORY_STORE,
	PROFILE_CARD_STORE,
	SHOPS_STORE,
	USER_DETAILS_STORE,
	WALLET_STORE,
	VIEW_STORE,
	CONFIGURATION_STORE,
	EVENTIM_STORE,
	MINT_STORE,
	BRANCHES_STORE,
	BIOMETRICS_STORE,
	FOOTERVIEWSTORE
} from '../consts/stores';
import AdvertisingStore from './AdvertisingStore';
import AuthStore from './AuthStore';
import CartStore from './CartStore';
import CategoryStore from './CategoryStore';
import ContactStore from './ContactStore';
import CreditCardStore from './CreditCardStore';
import HomePageStore from './HomePageStore';
import MenuStore from './MenuStore';
import MessagesStore from './MessagesStore';
import OrdersHistoryStore from './OrdersHistoryStore';
import ProfileCardStore from './ProfileCardStore';
import ShopsStore from './ShopsStore';
import BranchesStore from './BranchesStore';
import UserDetailsStore from './UserDetailsStore';
import WalletStore from './WalletStore';
import ViewStore from './ViewStore';
import ConfigurationStore from './ConfigurationStore';
import EventimStore from './EventimStore';
import MintStore from './MintStore';
import BiometricsStore from './BiometricsStore';
import FooterViewStore from './FooterViewStore';

/**
 * Initiate all stores
 */
const authStore = new AuthStore();
const configurationStore = new ConfigurationStore();
const viewStore = new ViewStore();
const creditCardStore = new CreditCardStore(authStore);
const menuStore = new MenuStore(authStore);
const userDetailsStore = new UserDetailsStore(authStore);
const cartStore = new CartStore(authStore);
const contactStore = new ContactStore(authStore);
const ordersHistoryStore = new OrdersHistoryStore(authStore);
const shopsStore = new ShopsStore(authStore);
const branchesStore = new BranchesStore(authStore);
const walletStore = new WalletStore(authStore);
const profileCardStore = new ProfileCardStore(authStore);
const categoryStore = new CategoryStore(authStore);
const advertisingStore = new AdvertisingStore(authStore);
const homePageStore = new HomePageStore(authStore);
const eventimStore = new EventimStore(authStore);
const messagesStore = new MessagesStore(authStore, configurationStore);
const mintStore = new MintStore();
const biometricsStore = new BiometricsStore(authStore, viewStore, messagesStore,menuStore);
const footerViewStore = new FooterViewStore();
/**
 * Save the instance in global object
 */
const rootStores = {
	[PROFILE_CARD_STORE]: profileCardStore,
	[AUTH_STORE]: authStore,
	[USER_DETAILS_STORE]: userDetailsStore,
	[MENU_STORE]: menuStore,
	[CART_STORE]: cartStore,
	[CONTACT_STORE]: contactStore,
	[ORDERS_HISTORY_STORE]: ordersHistoryStore,
	[CREDIT_CARD_STORE]: creditCardStore,
	[SHOPS_STORE]: shopsStore,
	[BRANCHES_STORE]: branchesStore,
	[WALLET_STORE]: walletStore,
	[CATEGORY_STORE]: categoryStore,
	[MESSAGES_STORE]: messagesStore,
	[ADVERTING_STORE]: advertisingStore,
	[HOMEPAGE_STORE]: homePageStore,
	[VIEW_STORE]: viewStore,
	[CONFIGURATION_STORE]: configurationStore,
	[EVENTIM_STORE]: eventimStore,
	[MINT_STORE]: mintStore,
	[BIOMETRICS_STORE]: biometricsStore,
	[FOOTERVIEWSTORE]: footerViewStore
};

if (env !== 'prod') {
	window['stores'] = rootStores;
}

export default rootStores;
