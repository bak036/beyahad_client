import { observer } from 'mobx-react';
import { CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { Router } from 'react-router';
import { Link } from 'react-router-dom';
import MenuStore from 'src/stores/MenuStore';
import InvitNewCard from '../../../../components/BeyhadComponents/BeyhadCard/InviteNewCard/InviteNewCard';
import ProfileCardModal from '../../../../components/BeyhadComponents/BeyhadCard/ProfileCardModal';
import LogoutModal from '../../../../components/BeyhadComponents/Logout/LogoutModal';
import CustomModal from '../../../../components/CustomComponents/CustomModal';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { AUTH_STORE, MENU_STORE, PROFILE_CARD_STORE, VIEW_STORE, WALLET_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import ViewStore from '../../../../stores/ViewStore';
import WalletStore from '../../../../stores/WalletStore';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useState } from 'react';

interface IProps {
	history?: any;
}

interface IState {
	logoutModal: boolean;
	noCardModal: boolean;
	cardModal: boolean;
}
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const menuStore: MenuStore = rootStores[MENU_STORE];

const ByProfileHover : React.FC<IProps> = ({
	history
}) => {

	const [logoutModal, setLogoutModal] = useState<boolean>(false);
	const [noCardModal, setNoCardModal] = useState<boolean>(false);
	const [cardModal, setCardModal] = useState<boolean>(false);
	const [cvv,setCvv] = useState<number>(-1);
	const [expiredDate,setExpiredDate] = useState<string>("");

	const onLogoutClicked = () => {
		setLogoutModal(true)
	};

	const onCancel = () => {
		setLogoutModal(false)
	};

	const showModal = () => {
		setLogoutModal(true)
	};
	const onLogoutButtonClicked = () => {
		// TODO: Eliran - create one method in "AuthStore" that do "logout"
		// in this method, redirect the user to the /login page with
		// window.locations.href = '/login'
		setLogoutModal(false)
		authStore.logout();
	};
	const onLogoutRender = () => {
		return <LogoutModal onCancel={onCancel} onLogoutButtonClicked={onLogoutButtonClicked} />;
	};
	const cancelModal = () => {
		setNoCardModal(false)
	};
	const formatCardNumber = (cardNumber: string): string => {
		let formattedNumber = '';
		for (let i = 0; i < cardNumber.length; i++) {
			if (i % 4 == 0) {
				formattedNumber += '-' + cardNumber[i];
			} else {
				formattedNumber += cardNumber[i];
			}
		}
		return formattedNumber.slice(1, formattedNumber.length);
	};
	const onOrderCardClicked = async () => {
		setNoCardModal(false)
	};

	const onMyMemberCardClicked = async(cardNumber) => {
		if (cardNumber) {
			const res = await profileCardStore.getCardDetailsByCardNumber(cardNumber);
			setCvv(res.cvv);
			setExpiredDate(res.expirationDate)
			setCardModal(true)
		} else {
			setNoCardModal(true)
		}
	};
	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}
	const sendCardMemberOnSMS = () => {
		sendGoogleAnalytics('club_card','club_card','submit_form_sms',Lang.format('SendSms'));
		profileCardStore
			.sendCardMemberOnSMS()
			.then((response) => {
				AlertUtils.successAlert(Lang.format('MessageWasSentSuccessfully'), '');
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			});
	};
	const changePassword = () => {
		sendGoogleAnalytics('my_details_sub_menu','my_details_sub_menu','click','איפוס סיסמא');
		menuStore.toggleProfileShow(); 
		history.push(RoutesPath.profile.changePassword)
	}
	const firstName = authStore.currentUser.firstName ? authStore.currentUser.firstName : '';
	const lastName = authStore.currentUser.lastName ? authStore.currentUser.lastName : '';
	const cardNumber =
		authStore.currentUser && authStore.currentUser.cardNumber ? authStore.currentUser.cardNumber : '';
	const balance = walletStore.card && walletStore.card.balance ? walletStore.card.balance + ' ₪ ' : '';
	return (
		<Router history={history}>
			<div className='profile-hover-main-container'>
				<CustomModal
					visible={logoutModal}
					componentToRender={onLogoutRender()}
					onCancel={onCancel}
				/>
				<CustomModal
					componentToRender={
						<InvitNewCard
							history={history}
							onCloseModalClick={cancelModal}
							onOrderCardLinkClicked={onOrderCardClicked}
						/>
					}
					onCancel={cancelModal}
					visible={noCardModal}
				/>
				<CustomModal
					onCancel={() => setCardModal(false)}
					visible={cardModal}
					componentToRender={
						<ProfileCardModal
							sendCardMemberOnSMS={sendCardMemberOnSMS}
							onCancel={() => setCardModal(false)}
							cvv={cvv} 
							expiredDate={expiredDate}
						/>
					}
				/>
				<div className='profile-hover-items'>
					<div className='close' onClick={() => menuStore.toggleProfileShow()}>X</div>
					<div className='profile-hover-name'>
						<div className='profile-hover-card-number'>
							<div>
								{Lang.format('CardNumberIs')}
							</div>
							<div>
								{cardNumber}
							</div>
						</div>
						{!cardNumber && (
							<CustomSpan
								classNameSpan={'blue-normal'}
								text={`${cardNumber ? cardNumber : Lang.format('CardIsNotConnected')}`}
							/>
						)}
						<img
							className='profile-hover-name-image cursor-pointer'
							title={Lang.format('Logout')}
							onClick={showModal}
							src={require('../../../../assets/profile-hover-back.png')}
						/>
					</div>

					<div className='profile-hover-button margin-top' onClick={() => { menuStore.toggleProfileShow(); history.push(RoutesPath.profile.root) }}>
						<Link
							className={`${authStore.canActivateAction ? 'cursor-pointer display-flex' : ''}`}
							to={RoutesPath.profile.root}
							onClick={(e) => {
								menuStore.toggleProfileShow();
								if (!authStore.canActivateAction) {
									e.preventDefault();
								}
							}}>
							<img src={require('../../../../assets/personal-info.png')}></img>
						</Link>
						<div className='profile-hover-button-text' onClick={() => {menuStore.toggleProfileShow(); history.push(RoutesPath.profile.history) }}>
							{Lang.format('PersonalInfo')}
						</div>
					</div>
					<div className='profile-hover-button' onClick={() => { history.push(RoutesPath.profile.history) }}>
						<Link
							className={`${authStore.canActivateAction ? 'cursor-pointer' : ''}`}
							to={RoutesPath.profile.history}
							onClick={(e) => {
								menuStore.toggleProfileShow();
								if (!authStore.canActivateAction) {
									e.preventDefault();
								}
							}}>
							<svg height="30" viewBox="0 0 468 468" width="30" xmlns="http://www.w3.org/2000/svg" className='svg-class'>
								<path d="M325.055 293.424c-8.837 0-16-7.163-16-16v-6.926c0-8.837 7.163-16 16-16s16 7.163 16 16v6.926c0 8.837-7.163 16-16 16zM252.688 319.424H120.366c-8.837 0-16-7.163-16-16s7.163-16 16-16h132.322c8.837 0 16 7.163 16 16s-7.163 16-16 16zM252.688 394.274H120.366c-8.837 0-16-7.163-16-16s7.163-16 16-16h132.322c8.837 0 16 7.163 16 16s-7.163 16-16 16z" />
								<g>
									<path d="M104.366 229.572c0 8.837 7.163 16 16 16h132.322c6.323 0 11.773-3.677 14.371-9.001 14.239 5.78 29.795 8.972 46.086 8.972 67.742 0 122.854-55.075 122.854-122.772C436 55.075 380.888 0 313.146 0c-46.854 0-87.659 26.35-108.373 64.996H62c-16.542 0-30 13.458-30 30V438c0 16.542 13.458 30 30 30h249.055c16.542 0 30-13.458 30-30V325.065c0-8.837-7.163-16-16-16s-16 7.163-16 16V436H64V96.996h129.024a123.273 123.273 0 0 0-1.697 41.726h-70.961c-8.837 0-16 7.163-16 16s7.163 16 16 16h79.686c6.996 16.416 17.468 31.009 30.49 42.851H120.366c-8.837-.001-16 7.162-16 15.999zm117.925-106.801C222.291 72.72 263.048 32 313.146 32S404 72.72 404 122.771s-40.757 90.772-90.854 90.772-90.855-40.72-90.855-90.772z" />
									<path d="M347.711 156.173c-2.418 0-4.871-.55-7.179-1.711l-34.578-17.397a16.003 16.003 0 0 1-8.809-14.293V56.715c0-8.837 7.163-16 16-16s16 7.163 16 16v56.195l25.77 12.966c14.667 7.38 9.271 30.294-7.204 30.297-2.418 0 5.854-.001 0 0z" />
								</g>
							</svg>
						</Link>
						<div className='profile-hover-button-text' onClick={() => {GoogleAnalyticsUtils.clickButtonAnalytics('profile_menu','profile_menu','',Lang.format('OrdersHistory'))}}>
							{Lang.format('OrdersHistory')}
						</div>

					</div>
					{/* <div className='profile-hover-button'
						onClick={() => { changePassword() }}>
						<img src={require('../../../../assets/password.png')}></img>
						<div className='profile-hover-button-text'>
							{Lang.format('ChangePasswordBY')}
						</div>

					</div> */}
					<div className='profile-hover-button'
						onClick={() => {
							menuStore.toggleProfileShow();
							onMyMemberCardClicked(cardNumber);
						}}>
						<Link
							className={`${authStore.canActivateAction ? 'cursor-pointer' : ''}`}
							to={RoutesPath.profile.root}
							onClick={(e) => {
								if (!authStore.canActivateAction) {
									e.preventDefault();
								}
							}}>
							<img src={require('../../../../assets/send-sms.png')}></img>
						</Link>
						<div className='profile-hover-button-text'>
							{'שליחת SMS עם פרטי הכרטיס'}
						</div>
					</div>
				</div>
			</div>
		</Router>
	);
}
export default observer(ByProfileHover)
