import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { Route } from 'react-router';
import BalanceAndUsesContainer from '../../components/BeyhadComponents/BeyhadCard/BalanceAndUses/BalanceAndUsesContainer';
import AlertBeforeBlock from '../../components/BeyhadComponents/BeyhadCard/BlockCard/AlertBeforeBlock';
import AlertPickCard from '../../components/BeyhadComponents/BeyhadCard/BlockCard/AlertPickCard';
import PickActionModal from '../../components/BeyhadComponents/BeyhadCard/BlockCard/PickActionModal';
import Card from '../../components/BeyhadComponents/BeyhadCard/ChargingCard/Card';
import ChargeCard from '../../components/BeyhadComponents/BeyhadCard/ChargingCard/ChargeCard';
import LoadCard from '../../components/BeyhadComponents/BeyhadCard/ChargingCard/LoadCard';
import InvitNewCard from '../../components/BeyhadComponents/BeyhadCard/InviteNewCard/InviteNewCard';
import MoneyPolicy from '../../components/BeyhadComponents/BeyhadCard/MoneyPolicy/MoneyPolicy';
import BranchesList from '../../components/BeyhadComponents/ShopsList/BranchesList/BranchesList';
import BreadCrumbs, { Crumbs } from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomLink, { IconPosition } from '../../components/CustomComponents/CustomLink/CustomLink';
import CustomModal from '../../components/CustomComponents/CustomModal';
import Lang from '../../config/Language';
import { RoutesPath } from '../../consts/RoutesPath';
import { CART_STORE, PROFILE_CARD_STORE, VIEW_STORE, WALLET_STORE, SHOPS_STORE, AUTH_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import CartStore from '../../stores/CartStore';
import ProfileCardStore from '../../stores/ProfileCardStore';
import ViewStore from '../../stores/ViewStore';
import WalletStore from '../../stores/WalletStore';
import ShopsStore from '../../stores/ShopsStore';
import AuthStore from '../../stores/AuthStore';
import AlertUtils from '../../utils/AlertUtils';
import ErrorUtils from '../../utils/errorHandling/ErrorUtils';
import BarcodePayment from './BarcodePaymentContainer/BarcodePayment';
import { CardTypes } from '../../models/enums';
import { Link } from 'react-router-dom';
import { cardVariant } from 'src/consts/staticData';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useRef, useState } from 'react';
import DesktopShopsCustomLayout from '../DesktopShopsCustomLayout/DesktopShopsCustomLayout';
import ScreenUtils from 'src/utils/ScreenUtils';
import ShopsListMobileContainer from '../../components/BeyhadComponents/ShopsList/ShopsListMain/ShopsListMobileContainer';
interface Props {
	location;
	history?: any;
}

interface IState {
	firstModal: boolean;
	secondModal: boolean;
	thirdModal: boolean;
	pickedCard: CardTypes;
	actionType: ActionType;
	titlePage: string;
}

export enum ActionType {
	Empty = 'empty',
	Block = 'block',
	BlockAndOrder = 'blockAndOrder',
}

const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const cartStore: CartStore = rootStores[CART_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const shopsStore: ShopsStore = rootStores[SHOPS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const ProfileCardContainer: React.FC<Props> = ({
	location,
	history
}) => {

	const getTitlePage = () => {
		var title = "";
		if (location.pathname.includes('dischargeCard'))
			title = 'ביטול טעינה'
		else if (location.pathname.includes('chargingCard'))
			title = 'הכרטיס שלי'
		return title;
	}

	const [firstModal, setFirstModal] = useState<boolean>(false);
	const [secondModal, setSecondModal] = useState<boolean>(false);
	const [thirdModal, setThirdModal] = useState<boolean>(false);
	const [pickedCard, setPickedCard] = useState<CardTypes>(CardTypes.NoCard);
	const [actionType, setActionType] = useState<ActionType>(ActionType.Empty);
	const [titlePage, setTitlePage] = useState<string>(getTitlePage());
	const isMobile = ScreenUtils.IsMobile();

	const mounted = useRef(false);
	let prevPathName = useRef(location.pathname)

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			viewStore.setLoadingView(true);
			cartStore.initConfig();
			walletStore.init().finally(() => {
				viewStore.setLoadingView(false);
			});
		} else {
			if (location.pathname != prevPathName) {
				setTitlePage(getTitlePage())
				prevPathName.current = getTitlePage();
			}
		}
	})

	// Money-terms consent guard: any /card/* route requires an approved money terms document.
	useEffect(() => {
		const needsApproval = !!(authStore.currentUser && authStore.currentUser.needToApproveMoneyTerms);
		const hasUrl = !!(authStore.currentUser && authStore.currentUser.moneyTermsURL);
		const alreadyOnMoneyPolicy = location.pathname === RoutesPath.card.moneyPolicy;
		const isWalletBlocked = !!(
			authStore.currentUser &&
			authStore.currentUser.walletStatus != null &&
			authStore.currentUser.walletStatus !== 1
		);
		if (needsApproval && hasUrl && !alreadyOnMoneyPolicy && !isWalletBlocked) {
			history.replace(RoutesPath.card.moneyPolicy);
		}
	}, [
		location.pathname,
		authStore.currentUser && authStore.currentUser.needToApproveMoneyTerms,
		authStore.currentUser && authStore.currentUser.walletStatus,
	]);

	const firstModalClicked = () => {
		sendGoogleAnalytics(Lang.format('LostYourcard'));
		setFirstModal(true)
	};
	const secondModalClicked = () => {
		setFirstModal(true)
	};
	const onBlockClicked = () => {
		setFirstModal(false)
		setThirdModal(true)
		setActionType(ActionType.Block)
	};

	const onBlockAndOrderClicked = () => {
		setFirstModal(false)
		setSecondModal(true)
		setActionType(ActionType.BlockAndOrder)
	};
	const cancelTheFirstModal = () => {
		setFirstModal(false)
	};
	const cancelTheSecondModal = () => {
		setSecondModal(false)
	};
	const cancelThethirdModal = () => {
		setThirdModal(false)
	};
	const successBlock = () => {
		walletStore.setCard(null);
		AlertUtils.successAlert(Lang.format('CancelSuccess'), '');
	};
	const sendGoogleAnalytics = (title: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics('lost_your_card', 'lost_your_card', 'click', title)
	}
	const onBlockCard = () => {
		viewStore.setLoadingView(true);
		profileCardStore
			.blockCard()
			.then((res) => {
				viewStore.setLoadingView(false);
				if (res) {
					setThirdModal(false)
					successBlock();

					if (actionType === ActionType.BlockAndOrder) {
						const card =
							pickedCard == CardTypes.DigitalCard
								? cartStore.getDigitalCardVariant
								: cartStore.getCardVariant;
						const request = {
							categoryName: card.name,
							categoryNumber: card.categoryId.toString(),
							variants: card.variants,
						};
						// Quantity check in Varient.ts does not check based on variant quantity,
						// it checks based on a second qunatity parameter passed to the constructor of the variant
						// thats why it ignores the varients.quantity of the configuration.json and sets it to 0.
						// Thats also why i set it manually to 1 here.
						request.variants && request.variants[0] ? (request.variants[0].quantity = 1) : null;
						//-----------------------------------------------------------------------------------
						cartStore.addToCart(request).then((res) => {
							if (res) {
								// TODO: Eliran - change to RoutesPath
								history.replace('/cart');
							} else {
								// TODO: Eliran - what with else?
							}
						});

						// TODO: Eliran - why "cartStore" not using its own variable?... ()
						// TODO: Eliran - "cartStore.getCardVariant" can be an empty object...
					} else {
						successBlock();
					}
				} else {
					// TODO: Eliran - what with else?
				}
			})
			.catch((err) => {
				viewStore.setLoadingView(false);
				setThirdModal(false)
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			});
	};
	const onReturnClicked = () => {
		setThirdModal(false)
	};

	const LoadCardFunc = ({ match }) => <LoadCard history={history} cardId={match.params.id} />;

	const dischargeCard = ({ match }) => <LoadCard history={history} isDischarge={true} cardId={match.params.id} />;

	const onOrderCardClicked = async () => {
		try {
			viewStore.setLoadingView(true);
			const allow = await profileCardStore.possibleToOrderCard();
			viewStore.setLoadingView(false);
			if (allow) {
				history.replace('/category/productpage/16534');
			}
		} catch (err) {
			viewStore.setLoadingView(false);
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		}
	};

	const onLinkButtonClicked = (link: string) => {
		if (!mobileAndTabletCheck())
			window.open(link);
		else
			window.location.replace(link);
	};

	const onPickCard = (cardType: CardTypes) => {
		setPickedCard(cardType)
		setSecondModal(false)
		setThirdModal(true)
	};

	const mobileAndTabletCheck = () => {
		let check = false;
		(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
		return check;
	};

	const renderMenu = () => {
		const isCardCharging = window.location.pathname.includes(RoutesPath.card.cardCharging) || window.location.pathname.includes(RoutesPath.card.shopList);
		return (

			<div className='profile-card-menu'>

				<div className='quick-actions'>
					פעולות מהירות
				</div>
				<div className='flex-mobile'>
					<div className='inner-link-container-one on-over-one' onClick={() => { history.push(RoutesPath.card.cardCharging) }}>
						<div className='flex-mobile-img'>
							<img alt='טעינת כרטיס' src={require('../../assets/wallet.svg')} />
						</div>
						<CustomLink
							text={Lang.format('LoadCard')}
							route={isCardCharging ? window.location.pathname : RoutesPath.card.cardCharging}
							onClick={() => { }}
						/>
					</div>
					<div className='inner-link-container-one on-over-two' onClick={() => {
						const el = document.querySelector('.profile-card-content');
						if (el) {
							el.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
						history.push(RoutesPath.card.balanceAndUses);
					}}>
						<div className='flex-mobile-img'>
							<img alt='כלל התנועות' src={require('../../assets/wallet-1.svg')} />
						</div>
						<CustomLink
							text={'כלל התנועות'}
							route={RoutesPath.card.balanceAndUses}
							onClick={() => { }}
						/>
					</div>
					<div className='inner-link-container-one on-over-three' onClick={() => onOrderCardClicked()}>
						<div className='flex-mobile-img'>
							<img alt='יתרה ומימושים' src={require('../../assets/credit-card.svg')} />
						</div>
						<CustomLink
							text={'הזמנת כרטיס'}
							route={RoutesPath.card.orderCard}
							onClick={() => { }}
						/>
					</div>
					<div className='inner-link-container-one on-over-four' onClick={() => { history.push(`${RoutesPath.card.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1`) }}>
						<	div className='flex-mobile-img'>
							<img alt='יתרה ומימושים' src={require('../../assets/document.svg')} />
						</div>
						<CustomLink
							text={'תקנון הכרטיס'}
							route={`${RoutesPath.card.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1`}
							onClick={() => { }}
						/>
					</div>
					<div className='inner-link-container-one on-over-five' onClick={() => { history.push(`${RoutesPath.card.iframe}?link=https://www.dts.co.il/HtmlView/17062019-3`) }}>
						<div className='flex-mobile-img'>
							<img alt='מגבלות יתרה ומימושים' src={require('../../assets/prohibition.svg')} />
						</div>
						<CustomLink
							text={'מגבלות'}
							route={`${RoutesPath.card.iframe}?link=https://www.dts.co.il/HtmlView/17062019-3`}
							onClick={() => { }}
						/>
					</div>
				</div>
				<div className='block-card-btn'>
					<div className='block-card-button' onClick={firstModalClicked}>אבד לך הכרטיס?</div>
				</div>
				{/* <div className='inner-link-container-three'>
				<div className='nav-link-item'>
						<CustomLink
							text={`תקנון הכרטיס`}
							containerClassName={'item-link-container'}
							textClassName={'item-text-container'}
							iconElement={<img alt='הזמנת כרטיס' src={require('../../assets/audit.png')} />}
							iconPosition={IconPosition.Right}
							iconClassName={`item-icon`}
							route={`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1`}
						/>
					</div>
					<div className='nav-link-item'>
						<CustomLink
							text={`מגבלות`}
							containerClassName={'item-link-container'}
							textClassName={'item-text-container'}
							iconElement={<img alt='הזמנת כרטיס' src={require('../../assets/audit.png')} />}
							iconPosition={IconPosition.Right}
							iconClassName={`item-icon`}
							route={`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/17062019-3`}
						/>
					</div>
				</div>
				<div className='inner-link-container-four'>
					<div className='nav-link-item'>
						<CustomLink
							text={`תשלום בקופה`}
							route={RoutesPath.card.barcodePayment}
							containerClassName={'item-link-container'}
							textClassName={'item-text-container'}
							iconElement={<img alt='תשלום בקופה' src={require('../../assets/store-white.png')} />}
							iconPosition={IconPosition.Right}
							iconClassName={`item-icon smaller`}
						/>
					</div>
				</div>
				<div className='inner-link-container-five'>
					<div className='block-card-btn'>
						<CustomButton
							text={`אבד לך הכרטיס?`}
							buttonClassName={`secondry-design center smallHeight`}
							onClick={firstModalClicked}
						/>
					</div>
				</div> */}
			</div>
		);
	};
	const renderContent = () => {
		return (
			<React.Fragment>
				<CustomModal
					onCancel={cancelTheFirstModal}
					visible={firstModal}
					componentToRender={
						walletStore.getWalletsArray && walletStore.getWalletsArray.length > 0 ? (
							<PickActionModal
								onBlockAndOrderClicked={onBlockAndOrderClicked}
								onBlockClicked={onBlockClicked}
							/>
						) : (
							<InvitNewCard
								history={history}
								onCloseModalClick={cancelTheFirstModal}
								onOrderCardLinkClicked={onOrderCardClicked}
							/>
						)
					}
				/>
				<CustomModal
					onCancel={cancelTheSecondModal}
					visible={secondModal}
					componentToRender={
						<>
							<AlertPickCard cancelSecondModal={cancelTheSecondModal} onPickCard={onPickCard} />
						</>
					}
				/>
				<CustomModal
					onCancel={cancelThethirdModal}
					visible={thirdModal}
					componentToRender={
						<AlertBeforeBlock
							actionType={actionType}
							onRetuern={onReturnClicked}
							onBlock={onBlockCard}
						/>
					}
				/>
				<div className='profile-card-content'>
					<Route exact path={RoutesPath.card.moneyPolicy} render={(props) => <MoneyPolicy history={history} />} />
					<Route exact path={[RoutesPath.card.cardCharging, RoutesPath.card.moneyPolicy]} component={ChargeCard} />
					<Route exact path={RoutesPath.card.balanceAndUses} component={BalanceAndUsesContainer} />
					<Route exact path={RoutesPath.card.branchesList} component={BranchesList} />
					<Route path={`${RoutesPath.card.cardCharging}/:id`} component={LoadCardFunc} />
					<Route path={`${RoutesPath.card.dischargeCard}/:id`} component={dischargeCard} />
					<Route path={RoutesPath.card.barcodePayment} component={BarcodePayment} />

					{isMobile ? (
						<Route exact path={RoutesPath.card.shopList} component={ShopsListMobileContainer} />
					) : (
						<Route
							exact
							path={RoutesPath.card.shopList}
							render={(props) => {
								const searchParams = new URLSearchParams(props.location.search);
								const keys: string[] = [];
								for (const [key] of searchParams as any) {
									keys.push(key);
								}
								const isExactShopListWithWalletId = searchParams.has('walletId') && keys.length === 0;
								return isExactShopListWithWalletId ? (
									<DesktopShopsCustomLayout
										renderMenu={renderMenu}
										renderAllCards={renderAllCards}
									/>
								) : null;
							}}
						/>
					)}


				</div>
			</React.Fragment>
		);
	};

	const renderBreadCrumbs = () => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs(Lang.format('HomePage'), RoutesPath.root));
		crumbsRoute.push(new Crumbs(Lang.format('Profile'), RoutesPath.profile.root));
		crumbsRoute.push(new Crumbs(Lang.format('Card'), RoutesPath.card.cardCharging));

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		switch (pathname) {
			case RoutesPath.card.cardCharging:
				crumbsRoute.push(new Crumbs(Lang.format('טעינת כרטיס'), RoutesPath.card.cardCharging));
				break;
			case RoutesPath.card.balanceAndUses:
				crumbsRoute.push(new Crumbs(Lang.format('BalanceAndUses'), RoutesPath.card.balanceAndUses));
				break;
			case RoutesPath.card.shopList:
				crumbsRoute.push(new Crumbs(Lang.format('ShopsList'), RoutesPath.card.shopList));
				break;
			case RoutesPath.card.barcodePayment:
				crumbsRoute.push(new Crumbs(Lang.format('PaymentAtCheckout'), RoutesPath.card.barcodePayment));
				break;
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	// Sort wallets, active wallets first, disabled last
	const sortFunction = (walletA, walletB) => {
		let LoadAllowedA = walletA.loadingMode.isLoadAllowed ? 1 : 0;
		let LoadAllowedB = walletB.loadingMode.isLoadAllowed ? 1 : 0;
		if (LoadAllowedA == 1 && LoadAllowedB == 0) {
			return -1;
		} else if ((LoadAllowedA == 0 && LoadAllowedB == 0) || (LoadAllowedA == 1 && LoadAllowedB == 1)) {
			return 0;
		} else {
			return 1;
		}
	};

	const renderAllCards = () => {
		if (walletStore.getWalletsArray) {
			return walletStore.getWalletsArray
				.sort(sortFunction)
				.map((wallet, index) => (
					<Card
						isLoadAllowed={wallet.loadingMode.isLoadAllowed === 1}
						key={index}
						withLoad={true}
						withRegisterPayemnt={true}
						wallet={wallet}
						history={history}
						withChains={true}
						withDischarge={true}
						withDischargeAmount={false}
					/>
				));
		} else {
			return null;
		}
	};

	const isExactShopListWithWalletId = React.useMemo(() => {
		const path = location.pathname;
		const searchParams = new URLSearchParams(location.search);
		const keys: string[] = [];
		for (const [key] of searchParams as any) {
			keys.push(key);
		}
		var f = path === RoutesPath.card.shopList &&
			searchParams.has('walletId') &&
			keys.length === 0;

		return (
			path === RoutesPath.card.shopList &&
			searchParams.has('walletId') &&
			keys.length === 0
		);
	}, [location.pathname, location.search]);


	return (
		<div className="menu-and-content-card-container">
			{renderBreadCrumbs()}

			<div className="my-card">
				{titlePage}
			</div>

			<div className="flex-container">
				{(isExactShopListWithWalletId && !isMobile) ? null : (
					<div className="top-menu-container">
						<div className="top-menu-cards">
							{renderAllCards()}
						</div>
						<div className="menu-container">
							{renderMenu()}
						</div>
					</div>
				)}
				<div className="content-container">
					{renderContent()}
				</div>
			</div>

		</div>
	);





}
export default observer(ProfileCardContainer)
