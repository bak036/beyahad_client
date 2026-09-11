import { observer } from 'mobx-react';
import * as React from 'react';
import Lang from '../../config/Language';
import { RoutesPath } from '../../consts/RoutesPath';
import {
	AUTH_STORE,
	BIOMETRICS_STORE,
	CART_STORE,
	CONFIGURATION_STORE,
	HOMEPAGE_STORE,
	MENU_STORE,
	MESSAGES_STORE,
	PROFILE_CARD_STORE,
	SHOPS_STORE,
	VIEW_STORE,
	WALLET_STORE,
} from '../../consts/stores';
import Footer from '../../containers/Footer/Footer';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import CartStore from '../../stores/CartStore';
import ConfigurationStore from '../../stores/ConfigurationStore';
import HomePageStore from '../../stores/HomePageStore';
import MenuStore from '../../stores/MenuStore';
import MessagesStore from '../../stores/MessagesStore';
import ProfileCardStore from '../../stores/ProfileCardStore';
import ShopsStore from '../../stores/ShopsStore';
import ViewStore from '../../stores/ViewStore';
import WalletStore from '../../stores/WalletStore';
import { registrationStatus } from '../../utils/authentication/enums';
import { redirectMainLoginPageIfNeeded } from '../../utils/authentication/historyUtils';
import AppLoading from '../AppLoading/AppLoading';
import MenuNavigation from '../MenuNavigation/MenuNavigation';
import AppRouting from './AppRouting';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import AlertUtils from '../../utils/AlertUtils';
import NofhonitStorage from '../../utils/NofhonitStorage';
import SideBarSearchHover from '../MenuNavigation/SideBar/SideBarSearchHover/SideBarSearchHover';
import { withRouter } from 'react-router';
import BiometricsStore from 'src/stores/BiometricsStore';
import CookieBanner from '../CookieBanner/CookieBanner';

interface IState {
	loading: boolean;
	// userDetailsFromOldWebsite: any;
}

interface IProps {
	history?: any;
}

const menuStore: MenuStore = rootStores[MENU_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const cartStore: CartStore = rootStores[CART_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const shopsStore: ShopsStore = rootStores[SHOPS_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

@observer
export default class BeyahadWebsite extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			loading: true,
			// userDetailsFromOldWebsite: Cookies.get('LoginClub'),
		};
	}

	async initConfigAndMessages() {
		await configurationStore.init();
		await messagesStore.init();
	}

	moveUserRefreshPassword = (user) => {
		AlertUtils.basicAlert('', messagesStore.MessageForUserWeekPassword).then(() => {
			NofhonitStorage.clearStorage();
			window.location.href = RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`
		});
	};

	componentDidMount() {
		window.addEventListener('offline', (event) => {
			console.log("offline")
		});
		window.addEventListener('onnline', (event) => {
			console.log("onnline")
		});
		biometricsStore.postMessageToNativeApp('getPlatform');
		authStore.savetHistory(this.props.history);
		biometricsStore.savetHistory(this.props.history);
		console.time('startLogin');
		this.initConfigAndMessages();
		authStore
			.tryLogin()
			.then(async (user) => {
				if (user.shouldUpdateorRegister == registrationStatus.UserExpired) {
					authStore.logout();
				}

				console.time('cartStore');
				cartStore.init();
				console.timeEnd('cartStore');

				console.time('profileCardStore');
				profileCardStore.init();
				console.timeEnd('profileCardStore');

				viewStore.setLoadingView(true);

				console.time('homePageStore');
				homePageStore.init();
				console.timeEnd('homePageStore');

				console.time('menuStore');
				await menuStore.init();
				console.timeEnd('menuStore');

				const cardNumber = user && user.cardNumber ? user.cardNumber : '';
				// GoogleAnalyticsUtils.userLoggedIn(cardNumber);
				return user;
			})
			.then((user) => {

				// After the user joined a token is created, the site recognize it
				// as a logged in user, the next time the user refreshes the site
				// shouldUpdateorRegister is false, and the user is directed to registration.
				// if (user.shouldUpdateorRegister == registrationStatus.NeedResetPassword) {
				// 	this.props.history.push(RoutesPath.login.updatePasswordFromRegistration);
				// } else 
				if (user.shouldUpdateorRegister == registrationStatus.NeedRegister) {
					this.props.history.push(RoutesPath.login.registration);
				} else if (user.shouldUpdateorRegister == registrationStatus.NeedEdit) {
					this.props.history.push(RoutesPath.profile.root);
				} else if (this.props.history.location.pathname === RoutesPath.login.login && authStore.loggedInUser) {
					this.props.history.push(RoutesPath.root);
				}
			})
			.catch((e) => {
				// In case the login not finished successfully,
				// redirect to the login page so the user could login to the system
				redirectMainLoginPageIfNeeded(this.props.history);
			})
			.finally(() => {
				// SetState loading=false in order to show the user the page
				viewStore.setLoadingView(false);
				this.setState({ loading: false });
				console.timeEnd('startLogin');
			});
	}

	mobileAndTabletCheck = () => {
		let check = false;
		(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
		return check;
	};

	render() {
		const hideSideBarSearchBox = menuStore.showSearchContainerInMobile ? '' : 'hide';
		if (this.state.loading) {
			return <AppLoading text={Lang.format('Loading')} />;
		} else {
			return (
				<div className='app-container'>
					<AppLoading />
					<CookieBanner history={this.props.history}/>
					<MenuNavigation history={this.props.history} />
					<div
						className='beyahad-main-container'
						onTouchMove={() => menuStore.isOpenBurgerMenu = true}
						onClick={() => {
							menuStore.searchBoxShowSuggestions = false;
							if (menuStore && menuStore.searchBoxShowSuggestions)
								menuStore.searchBoxShowSuggestions = false;
							menuStore.closeBurgeMenu();
						}}>
						<AppRouting history={this.props.history} />
						<Footer history={this.props.history} />
					</div>
				</div>
			);
		}
	}
}
