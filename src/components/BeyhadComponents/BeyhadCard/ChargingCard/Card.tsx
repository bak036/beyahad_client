import { CustomButton, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../../consts/RoutesPath';
import Wallet from '../../../../models/Wallet';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import rootStores from '../../../../stores';
import { PROFILE_CARD_STORE, MESSAGES_STORE, VIEW_STORE, WALLET_STORE, AUTH_STORE, SHOPS_STORE } from '../../../../consts/stores';
import { observer } from 'mobx-react';
import { PremiumType } from '../../../../models/enums';
import MessagesStore from '../../../../stores/MessagesStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import AlertUtils from '../../../../utils/AlertUtils';
import Lang from '../../../../config/Language';
import * as _ from 'lodash';
import { WalletsEnum } from './../../../../stores/ShopsStore';
import ViewStore from '../../../../stores/ViewStore';
import WalletStore from '../../../../stores/WalletStore';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useRef, useState } from 'react';
import ScreenUtils from 'src/utils/ScreenUtils';
import AuthStore from '../../../../stores/AuthStore';
import { SPECIAL_NAVBAR_PATHS } from "src/utils/navbarVisibilityUtils";
import MonthlyLoadBalanceHint from '../MonthlyLoadBalanceHint/MonthlyLoadBalanceHint';
interface Props {
	wallet: Wallet;
	history?: any;
	withLoad: boolean;
	withRegisterPayemnt?: boolean;
	isLoadAllowed?: boolean;
	withDischarge?: boolean; // Only For Discharge UI Button
	withDischargeAmount?: boolean; // For Showing Available Dischar Amount
	withChains?: boolean;
	maxDischargeAmount?: number; // Actual Amount to display
}
interface IState {
	errorMessage: any;
	errorExist: boolean;
	expiryDate?: number;
	maxAmountToLoadThisMonth: number;

}

const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const shopsStore = rootStores[SHOPS_STORE];

const Card: React.FC<Props> = ({
	wallet,
	history,
	withLoad,
	withRegisterPayemnt,
	isLoadAllowed,
	withDischarge,
	withDischargeAmount,
	withChains,
	maxDischargeAmount,
}) => {
	const [errorMessage, setErrorMessage] = useState<any>(null);
	const [errorExist, seterrorExist] = useState<boolean>(false);
	const [expiryDate, setexpiryDate] = useState<number>(0);
	const [maxAmountToLoadThisMonth, setMaxAmountToLoadThisMonth] = useState<number>(0);
	const currentWallet = useRef(wallet.walletID);
	const isMobile = ScreenUtils.IsMobile();


	useEffect(() => {
		calculateMaxAmountToLoad();
		timeBetweenDischargeAndCharge();
		messagesStore.getSingleMessageFromService(725).then((res) => setErrorMessage(res));
	}, [])

	useEffect(() => {
		authStore.showNavBarSearchBox = isMobile;
		authStore.showSearchIcon = !isMobile;
	}, [isMobile, authStore]);

	useEffect(() => {
		return () => {
			const removeSearchBar = SPECIAL_NAVBAR_PATHS.some(p => location.pathname.startsWith(p));
			if (!removeSearchBar) {
				authStore.showNavBarSearchBox = true;
				authStore.showSearchIcon = true;
			}
		};
	}, [window.location.pathname, authStore]);

	useEffect(() => {
		if (currentWallet.current != wallet.walletID) {
			currentWallet.current = wallet.walletID;
			calculateMaxAmountToLoad();
		}
	}, [wallet.walletID])

	const getAllowedToDischarge = async () => {
		viewStore.setLoadingView(true);
		const res = await AllowedToDischarge(wallet && wallet.walletID);
		viewStore.setLoadingView(false);
		return res;
	};
	const AllowedToDischarge = async (walletID) => {
		return await walletStore.AllowedToDischarge(walletID);
	};
	const timeBetweenDischargeAndCharge = async () => {
		await getTimeBetweenDischargeAndCharge()
			.then((data) => {
				setexpiryDate(data)
			})
			.catch((err) => {
				setexpiryDate(0)
			}).finally(() => {
				viewStore.setLoadingView(false);
			});

	};
	const getTimeBetweenDischargeAndCharge = async () => {
		return await walletStore.getTimeBetweenDischargeAndCharge();
	};

	const sendGoogleAnalytics = () => {
		GoogleAnalyticsUtils.clickButtonAnalytics('chargeCard', 'chargeCard', 'click', 'לטעינה');
	}

	const loadCardClicked = () => {
		sendGoogleAnalytics();
		if (isLoadAllowed) {
			scrollToProfileContent();
			const premiumType = profileCardStore.authStore.currentUser.premiumType;
			if (premiumType === PremiumType.PaymentAccess || premiumType === PremiumType.Type5) {
				history.push(`${RoutesPath.card.cardCharging}/${wallet.walletID}`);
			} else {
				seterrorExist(true);
			}
		}
	};
	const dischargeCardClicked = async () => {
		const res = await getAllowedToDischarge();
		if (res) {
			scrollToProfileContent();
			const premiumType = profileCardStore.authStore.currentUser.premiumType;
			if (premiumType === PremiumType.PaymentAccess || premiumType === PremiumType.Type5) {
				history.push(`${RoutesPath.card.dischargeCard}/${wallet.walletID}`);
			} else {
				seterrorExist(true);
			}
		} else {
			AlertUtils.infoAlert('', `הביטול יתאפשר בתום ${expiryDate && expiryDate / 60} דקות מביצוע הפעולה האחרונה, אפשר לנסות שוב בעוד מספר דקות `);
		}

	};
	const loadBarcodePaymentClicked = () => {
		scrollToProfileContent();
		history.push(RoutesPath.card.barcodePayment);

	};

	const calculateMaxAmountToLoad = () => {
		const maxLoadedThisMonth = parseInt(wallet.maxDeposit) - parseInt(wallet.loadedThisMonth);
		const maxLoadByBalance = parseInt(wallet.maxBalance) - wallet.walletBalance;
		setMaxAmountToLoadThisMonth(Math.min(maxLoadByBalance, maxLoadedThisMonth))
	}
	const goToWalletChainsList = () => {
		walletStore.setCurrentWallet(wallet);
		shopsStore.setGeoFilter(null);
		shopsStore.clearGeoFilter();
		shopsStore.setNavigatedFromGeo(false);
		scrollToProfileContent();
		history.push(`${RoutesPath.card.shopList}?walletId=${wallet.walletID}`);
	};

	const scrollToShopList = () => {
		let contentPosition = document.getElementsByClassName('block-card-button')[0]['offsetTop'];
		window.scrollTo({ top: contentPosition - 70, behavior: 'smooth' });
	};

	const scrollToProfileContent = () => {
		let contentPosition = document.getElementsByClassName('profile-card-content')[0]['offsetTop'];
		window.scrollTo({ top: contentPosition - 70, behavior: 'smooth' });
	};
	const errorPopUp = () => {
		return errorExist ? AlertUtils.infoAlert('', errorMessage) : null;
	};


	const maxMonth = wallet ? wallet.maxDepositForMonth : 0;
	const maxDep = wallet ? parseInt(wallet.maxDeposit) : 0;
	const balance = wallet ? wallet.walletBalance : 0;
	return (
		<div className='card-with-btn'>
			<div className='card-main-container'
				/*style={wallet.backgroundImageUrl.length > 0 ? { backgroundImage: `url(${wallet.backgroundImageUrl})` } : {}}*/>
				<div className='card-inner-container'>
					<div className='header-container'>
						<div className='item-text'>
							<CustomSpan text={`${wallet ? wallet.walletName + ` עד ₪${maxDep.toLocaleString()} לטעינה` : ''}`} />
						</div>
						<div className='item-text sub-header'>
							<CustomSpan text={`ניתן לטעון עד לסכום כולל של ₪${maxMonth.toLocaleString()} בחודש `} />
						</div>
					</div>
					<div className='content-container' style={wallet.backgroundImageUrl.length > 0 ? { backgroundImage: `url(${wallet.backgroundImageUrl})` } : {}}>
						<div className='new-balance-container'>
							<div className='balance-right'>
								<CustomSpan text={`יתרתך בכרטיס:`} />
							</div>
							<div className='balance-left'>{balance.toFixed(2)}</div>
							<div className='recharge-balance'>
								{withDischargeAmount ? <span className='club-color-text' >
									<span>{`הסכום המקסימלי לביטול : `}</span>
									<br />
									<span className='bold club-color-text' style={{ fontWeight: 'bold' }}>
										{maxDischargeAmount !== undefined && maxDischargeAmount >= 0 ? `₪${maxDischargeAmount.toFixed(2)}` : ''}
									</span>
								</span>
									: <MonthlyLoadBalanceHint amount={maxAmountToLoadThisMonth} history={history} />}

							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='load-and-payment'>
				{withLoad && (
					<div onClick={loadCardClicked} className={`new-card-btn ${!isLoadAllowed ? 'button-disabled' : 'button-hover'}`}>
						<div className='img-wallet-right'>
							<img src={require('../../../../assets/white-wallet.png')}></img>
						</div>
						<div className='text-wallet-left'>
							<p>לטעינה</p>
						</div>
					</div>
				)}
				{errorPopUp()}
				{withRegisterPayemnt && (
					<div onClick={loadBarcodePaymentClicked} className={`new-card-btn button-hover`}>
						{/* <div onClick={this.loadBarcodePaymentClicked} className={`new-card-btn ${!this.props.isLoadAllowed ? 'button-disabled' : 'button-hover'}`}> */}
						<div className='img-wallet'>
							<img src={require('../../../../assets/pay-card.png')}></img>
						</div>
						<div className='text-wallet'>
							<p>תשלום בקופה</p>
						</div>
					</div>
				)}
			</div>
			{withDischarge && (
				<div onClick={() => { if (balance > 0) dischargeCardClicked() }} className={`blue-button ${balance > 0 ? 'blue-button-hover' : 'blue-button-disabled'}`}>
					{Lang.format('CancelLoad')}
				</div>
			)}
			{withChains && (
				<div onClick={goToWalletChainsList} className='blue-button blue-button-hover margin-buttom'>
					{Lang.format('ShopsList')}
				</div>
			)}
		</div>
	);
}
export default observer(Card)
