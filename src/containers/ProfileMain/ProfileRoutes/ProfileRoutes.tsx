import { observer } from 'mobx-react';
import * as React from 'react';
import { Route } from 'react-router-dom';
import ProfileCardModal from '../../../components/BeyhadComponents/BeyhadCard/ProfileCardModal';
import EditUserMain from '../../../components/BeyhadComponents/EditUser/EditUserMain/EditUserMain';
import LogoutModal from '../../../components/BeyhadComponents/Logout/LogoutModal';
import ChangePassword from '../../../components/BeyhadComponents/Passwords/ChangePassword/ChangePassword';
import Actions from '../../../components/BeyhadComponents/ProfileMenu/Actions/Actions';
import ActionsDesktop from '../../../components/BeyhadComponents/ProfileMenu/ActionsDesktop/ActionsDesktop';
import ProfileDetails from '../../../components/BeyhadComponents/ProfileMenu/ProfileDetails/ProfileDetails';
import ShopsListMain from '../../../components/BeyhadComponents/ShopsList/ShopsListMain/ShopsListMain';
import BreadCrumbs, { Crumbs } from '../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomModal from '../../../components/CustomComponents/CustomModal';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import { AUTH_STORE, PROFILE_CARD_STORE, WALLET_STORE, MENU_STORE } from '../../../consts/stores';
import Card from '../../../models/Card';
import rootStores from '../../../stores';
import AuthStore from '../../../stores/AuthStore';
import ProfileCardStore from '../../../stores/ProfileCardStore';
import WalletStore from '../../../stores/WalletStore';
import AlertUtils from '../../../utils/AlertUtils';
import ErrorUtils from '../../../utils/errorHandling/ErrorUtils';
import OrdersHistoryContainer from '../../OrdersHistoryContainer/OrdersHistoryContainer';
import MenuStore from '../../../stores/MenuStore';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import ProfileDetailsDesktop from 'src/components/BeyhadComponents/ProfileMenu/ProfileDetailsDesktop/ProfileDetailsDesktop';
import CustomTubs from 'src/components/CustomComponents/CustomTubs';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useRef, useState } from 'react';

const walletStore: WalletStore = rootStores[WALLET_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const menuStore: MenuStore = rootStores[MENU_STORE];

interface IState {
	cardModal: boolean;
	logoutModal: boolean;
	indexActive: number;

}

interface Props {
	location: any; // This props is passed by react router
	history?: any;
	isMint?: boolean;
}
const componentsToRender = [
	{ title: Lang.format('PersonalInfo'), index: 0, url: RoutesPath.profile.root },
	{ title: Lang.format('OrdersHistory'), index: 1, url: RoutesPath.profile.history },
];

const ProfileRoutes : React.FC<Props> = ({
	location,
	history,
	isMint
}) => {

	const [cardModal, setCardModal] = useState<boolean>(false);
	const [logoutModal, setLogoutModal] = useState<boolean>(false);
	const [indexActive, setIndexActive] = useState<number>(-1);
	const [cvv,setCvv] = useState<number>();
	const [expiredDate,setExpiredDate] = useState<string>("");
	const mounted = useRef(false);
	const prevIndexActive = useRef(-1);
	let prevLocation = useRef(location) 

	useEffect(() => {
		if(!mounted.current){
			mounted.current = true;
			menuStore.showSearchContainerInMobile = false;
			setIndexActiveByPath()
		}else{
			if(prevIndexActive.current != indexActive){
				prevIndexActive.current = indexActive;
				rendePage()
				setIndexActiveByPath()
			}
			if (location != prevLocation) {
				setIndexActiveByPath()
			}
		}
	})

	const setIndexActiveByPath = () => {

		const result = componentsToRender.find(item => item.url === window.location.pathname);
		if (result)
			handleIndexActive(result.index);
	}
	const handleIndexActive = (index: number) => {
		setIndexActive(index)
	}
	const rendePage = () => {
		const result = componentsToRender.find(item => item.index === indexActive);
		if (result && authStore.canActivateAction)
			history.push(result.url)
		else {
			history.push(RoutesPath.profile.root)
		}
	}
	const renderContent = () => {
		return (
			<div className='content'>
				{indexActive > -1 && <div className='menu-items'>
					<CustomTubs tabComponents={componentsToRender} indexActive={indexActive} changeTub={handleIndexActive} />
				</div>}
				{/* <Route exact path={RoutesPath.profile.changePassword} component={ChangePassword} /> */}
				<Route exact path={RoutesPath.profile.history} component={OrdersHistoryContainer} />
				<Route exact path={RoutesPath.card.shopList} component={ShopsListMain} />
				<Route exact path={RoutesPath.profile.root} component={EditUserMain} />
			</div>
		);
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}
	const sendCardMemberOnSMS = () => {
		sendGoogleAnalytics('club_card','club_card','submit_form_sms','שליחת SMS');
		profileCardStore
			.sendCardMemberOnSMS()
			.then((response) => {
				AlertUtils.successAlert(Lang.format('MessageWasSentSuccessfully'), '');
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			});
	};

	const renderBreadCrumbs = () => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs(Lang.format('HomePage'), RoutesPath.root));
		crumbsRoute.push(new Crumbs(Lang.format('Profile'), RoutesPath.profile.root));

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		switch (pathname) {
			case RoutesPath.profile.history:
				crumbsRoute.push(new Crumbs(Lang.format('OrdersHistory'), RoutesPath.profile.history));
				break;
			case RoutesPath.profile.changePassword:
				crumbsRoute.push(new Crumbs(Lang.format('ResetPassword'), RoutesPath.profile.changePassword));
				break;
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	// Handle My Member Card Modal

	const onCancel = () => {
		setCardModal(false)
	};
	const onMyMemberCardClicked = async(cardNumber:string) => {
		const res = await profileCardStore.getCardDetailsByCardNumber(cardNumber);
		setCvv(res.cvv);
		setExpiredDate(res.expirationDate)
		setCardModal(true)
	};

	// Handle Logout Modal

	const onLogoutClicked = () => {
		setLogoutModal(true)
	};
	const onCancelLogout = () => {
		setLogoutModal(false)
	};
	const onLogoutButtonClicked = () => {
		setLogoutModal(false)
		authStore.logout();
	};
	const onLogoutRender = () => {
		return <LogoutModal onCancel={onCancelLogout} onLogoutButtonClicked={onLogoutButtonClicked} />;
	};

	const renderProfileModal = () => (
		<ProfileCardModal sendCardMemberOnSMS={sendCardMemberOnSMS} onCancel={onCancel} cvv={cvv} expiredDate={expiredDate} />
	);

	// Profile Side Menu Container

	const renderProfileMenuContainer = () => {
		const { currentUser } = authStore;
		return (
			<div className={'profile-menu-container'}>
				{/* Logout Modal */}
				<CustomModal
					visible={logoutModal}
					componentToRender={onLogoutRender()}
					onCancel={onCancelLogout}
				/>
				<CustomMediaQuery.Mobile>
					<ProfileDetails currentUser={currentUser} onLogOutClicked={onLogoutClicked} />
					<Actions
						history={history}
						disableLink={currentUser && currentUser.cardNumber ? true : false}
						onMyMemberCardClicked={() => onMyMemberCardClicked(currentUser.cardNumber)}
					/>
				</CustomMediaQuery.Mobile>
				<CustomMediaQuery.Desktop>
					<ProfileDetailsDesktop currentUser={currentUser} onLogOutClicked={onLogoutClicked} />
					<ActionsDesktop
						history={history}
						disableLink={currentUser && currentUser.cardNumber ? true : false}
						onMyMemberCardClicked={() => onMyMemberCardClicked(currentUser.cardNumber)}
					/>
				</CustomMediaQuery.Desktop>
			</div>
		);
	};

	return (
		<div className='profile-menu-main'>

			{!isMint ? renderBreadCrumbs() : null}
			<div className='profile-menu-and-content-container'>
				<div className='menu'>
					{!isMint ? renderProfileMenuContainer() : null}
					<CustomModal
						onCancel={onCancel}
						visible={cardModal}
						componentToRender={renderProfileModal()}
					/>
				</div>
				<div className='content-container'>
					{renderContent()}
				</div>
			</div>
		</div>
	);
}
export default observer(ProfileRoutes)
