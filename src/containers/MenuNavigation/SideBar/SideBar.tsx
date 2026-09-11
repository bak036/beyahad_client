import { observer } from 'mobx-react';
import { CustomSpan } from 'nofshonit-base-web-client';
import CustomBurgerMenu from '../../../components/CustomComponents/CustomBurgerMenu/CustomBurgerMenu';
import * as React from 'react';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import { MENU_STORE, VIEW_STORE, AUTH_STORE, BIOMETRICS_STORE, CONFIGURATION_STORE, MESSAGES_STORE } from '../../../consts/stores';
import Category from '../../../models/Category';
import rootStores from '../../../stores';
import MenuStore from '../../../stores/MenuStore';
import CustomAntdCollapsible from '../../../components/CustomComponents/CustomAntdCollapsible/CustomAntdCollapsible';
import ViewStore from '../../../stores/ViewStore';
import AuthStore from '../../../stores/AuthStore';
import MessagesStore from '../../../stores/MessagesStore';
import AlertUtils from '../../../utils/AlertUtils';
import { tryNavigateToLoadCard } from '../../../utils/WalletNavigationUtils';
import CategoryUtils from '../../../utils/categoryUtils';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import CustomCollapsible from '../../../components/CustomComponents/CustomCollapsible/CustomCollapsible';
import ConfigurationStore from '../../../stores/ConfigurationStore';
import BiometricsStore from 'src/stores/BiometricsStore';
import { useEffect, useState } from 'react';

const searchIcon = require('../../../assets/magnifying-glass.png');
const arrowLeftIcon = require('../../../assets/left-arrow.svg');
const profileIcon = require('../../../assets/userSideBar.png');
const cartIcon = require('../../../assets/cartSideBar.png');
interface Props {
	history?: any;
	categories: Category[];
	onLogoutClicked: () => void;
}
interface IState {
	isBurgeropen: boolean;
}

const menuStore: MenuStore = rootStores[MENU_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const navRef: React.RefObject<HTMLDivElement> = React.createRef();

const useLocationPathname = () => {
	const [pathname, setPathname] = useState(
		typeof window !== 'undefined' ? window.location.pathname : '/'
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const updatePathname = () => {
			setPathname(window.location.pathname);
		};

		window.addEventListener('popstate', updatePathname);

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function (...args) {
			originalPushState.apply(this, args);
			updatePathname();
		};

		window.history.replaceState = function (...args) {
			originalReplaceState.apply(this, args);
			updatePathname();
		};

		return () => {
			window.removeEventListener('popstate', updatePathname);
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
		};
	}, []);

	return pathname;
};

const SideBar: React.FC<Props> = ({
	history,
	categories,
	onLogoutClicked
}) => {

	const [isBurgeropen, setIsBurgeropen] = useState<boolean>(true);
	const pathname = useLocationPathname();
	const [isOriginalHost, setIsOriginalHost] = useState<boolean>(pathname === "/");


	useEffect(() => {
		setIsOriginalHost(pathname === "/");
	}, [pathname]);


	useEffect(() => {
		menuStore.showSearchContainerInMobile = false;
		biometricsStore.postMessageToNativeApp('isLatestVersionApp');
	}, [])


	const updateDimensions = () => {
		const height: HTMLDivElement | null = navRef.current;
		const navClientHeight = height ? height.clientHeight : 0;
		menuStore.setNavHeight(navClientHeight);
	}

	const mobileAndTabletCheck = () => {
		let check = false;
		(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
		return check;
	};
	const onCategoryClick = (c: Category, index: number) => {
		//menuStore.toggleSideBarCollapsible(index);
		//menuStore.hideSidebarSubCategories = true;
		menuStore.toggleIsOpenBurgerMenu();
		CategoryUtils.renderSubCategory(c, history, true);
	}

	const redirectToChargingCard = () => {
		menuStore.toggleIsOpenBurgerMenu();
		tryNavigateToLoadCard(history);
	};
	// function that rendring all the sub catergories , function get catergory array and display all the sub catergories into the screen
	const renderAllSubCatergories = (categories?: Category[]) => {
		if (categories) {
			return categories.map((c: Category, index: number) => (
				<div className='side-bar-subcategory' key={index}>
					<div className='Collapsible menu-item collapse' onClick={() => onCategoryClick(c, index)}>
						{c.categoryName}
					</div>
				</div>
			));
		} else {
			return null;
		}
	};

	const renderAllCategories = (categories?: Category[]) => {
		if (categories && authStore.canActivateAction) {
			const numOfCategories = categories.length;
			let path = '10'
			categories = categories
				.slice(0, numOfCategories >= 11 ? 11 : numOfCategories)
				.sort((a, b) => a['sortOrder'] - b['sortOrder']);
			return categories.map((c: Category, index: number) => {
				path = index <= 10 ? index.toString() : '10';
				let imgLink = '';
				if (c.image && c.image && c.image.length > 0) {
					const imageIcon = c.image.filter(i => i.imageTypeId == 16);
					if (imageIcon?.[0]?.file) {
						imgLink = `${configurationStore.getConfiguration.picsUrl}/share/${imageIcon[0].file}`
					}
				}
				return (
					<React.Fragment key={index}>
						<div
							className='menu-img-item'
							onClick={() => {
								onCategoryClick(c, index);
								menuStore.toggleSideBarCollapsible(index);
							}}>
							{/* {c.image && ( // this part of code is to display images on the side bar . remove this from comment if you want images in the side bar dont delete
							<img
								className="menu-img-item-img"
								src={`//pics.k4a.co.il/share/${c.image.file ? c.image.file : ''}`}
							/>
						)} */}
							<div className='img-size'>
								<img src={imgLink} />
							</div>
							<div>
								<CustomCollapsible index={index} title={c.categoryName} fontSize="17">
									{renderAllSubCatergories(c.children)}
								</CustomCollapsible>
							</div>
						</div>
					</React.Fragment>
				)
			});
		} else {
			return null;
		}
	};
	const onLogOutClicked = () => {
		onLogoutClicked();
	};
	const redirectToCart = () => {
		if (authStore.canActivateAction) {
			history.push(RoutesPath.cart.root);
		}
	};
	const redirectToProfile = () => {
		if (authStore.canActivateAction) {
			// Changed because of request from customer
			history.push(RoutesPath.profile.history);
		}
	};

	const onBackPressed = () => {
		try {
 
			if (authStore.currentUser) {
				const referrer = document.referrer;
				const isSameOrigin = referrer && new URL(referrer).origin === window.location.origin;

				if (isSameOrigin) {
					history.goBack();
				} else {
				window.location.href = RoutesPath.login.login;
				}
			} else {
				window.location.href = RoutesPath.login.login;
			}
		} catch (err) {
			// Logger.error('error in navigating backward', err);
		}
	};


	const openSearchBox = () => {
		if (authStore.canActivateAction) {
			if (menuStore.showSearchContainerInMobile) {
				menuStore.showSearchContainerInMobile = false;
			} else {
				window.scrollTo(0, 0);
				menuStore.showSearchContainerInMobile = true;
				menuStore.searchText = '';
			}
		}
	};

	const categoriesVar = categories;
	const isNotFromMobile = menuStore.showSideBar ? true : (!localStorage.getItem('webview') && mobileAndTabletCheck());

	return (
		<div style={{ marginTop: !isNotFromMobile ? '-61px' : '0' }} className={`by-side-bar-main-contianer`}>
			<div style={{ top: !isNotFromMobile ? '-61px' : '0' }} className='by-top-side-bar' ref={navRef} onLoad={updateDimensions}>
				<div className='by-top-side-bar-left-container'>
					{authStore.isUserLoggedIn && (
						<div className='by-top-side-bar-left-item'>

							<img
								style={{
									height: '19px', width: '19px',
									visibility: isOriginalHost ? 'hidden' : 'visible'

								}}
								className='img-back'
								src={arrowLeftIcon}
								onClick={onBackPressed}
								alt={Lang.format('Search_for_Brands_or_Tags_Without_Dots')}
								title={Lang.format('Search_for_Brands_or_Tags_Without_Dots')}
							/>
						</div>
					)}
					<div className='logo-container'>
						<img
							className='logo-item cursor-pointer'
							style={{ width: 145 }}
							src={require('../../../assets/new-logo-mobile.png')}
							onClick={() => {
								if (authStore.canActivateAction) {
									history.push(`/`);
								}
							}}
							alt={Lang.format('BeyahadBeshvilha')}
						/>
					</div>
					{authStore.isUserLoggedIn && authStore.showSearchIcon && <div className='by-top-side-bar-left-item'>
						<img
							src={searchIcon}
							onClick={openSearchBox}
							alt={Lang.format('Search_for_Brands_or_Tags_Without_Dots')}
							title={Lang.format('Search_for_Brands_or_Tags_Without_Dots')}
						/>
					</div>}
				</div>
				<div className='by-top-side-bar-right-container'>
					{authStore.loggedInUser && (
						<div className="menu-overrides">
							<CustomBurgerMenu
								width={'210px'}
								direction={'right'}
								isOpen={isBurgeropen}
								contianerId={'outer-container'}
								image={
									<img
										className='burger-menu-img'
										src={require('../../../assets/X.png')}
										alt={Lang.format('Close')}
										title={Lang.format('Close')}
									/>
								}>
								<div className='menu-item'>
									{authStore.canActivateAction && (
										<div className='third-line-container' onClick={redirectToChargingCard}>
											<img src={require('../../../assets/credit-nav-bar-card.png')} alt="" />
											<div>{Lang.format('Load_Card')}</div>
										</div>
									)}
									<div className='all-categories'>
										{renderAllCategories(categories)}
									</div>
									<div className='menu-img-item log-out-class'>
										<div className='img-size'>
											<img src={require('../../../assets/sidebar-' + 11 + '.png')} />
										</div>
										<div className="menu-item-logout" onClick={onLogOutClicked}>
											{Lang.format('Logout')}
										</div>
									</div>
								</div>
							</CustomBurgerMenu>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
export default observer(SideBar) 
