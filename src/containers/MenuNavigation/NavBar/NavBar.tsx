import * as _ from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { CustomButton, CustomSelector, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import { MENU_STORE, PROFILE_CARD_STORE, VIEW_STORE, AUTH_STORE, CART_STORE, CONFIGURATION_STORE, HOMEPAGE_STORE, MESSAGES_STORE } from '../../../consts/stores';
import Category from '../../../models/Category';
import rootStores from '../../../stores';
import MenuStore from '../../../stores/MenuStore';
import ProfileCardStore from '../../../stores/ProfileCardStore';
import ViewStore from '../../../stores/ViewStore';
import ProfileHover from '../NavBar/ProfileHover/ProfileHover';
import ShopingCartHover from '../NavBar/ShoppingCartHover/ShoppingCartHover';
import SubCatergories from '../NavBar/SubCatergories/SubCatergories';
import AuthStore from '../../../stores/AuthStore';
import MessagesStore from '../../../stores/MessagesStore';
import AlertUtils from '../../../utils/AlertUtils';
import { tryNavigateToLoadCard } from '../../../utils/WalletNavigationUtils';
import Region from '../../../models/Region';
import CategoryUtils from '../../../utils/categoryUtils';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import { NavLink, Router, Link } from 'react-router-dom';
import StringFormatUtils from '../../../utils/StringFormatUtils';
import NofhonitStorage from '../../../utils/NofhonitStorage';
import CartStore from 'src/stores/CartStore';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import { useEffect, useState } from 'react';
import HomePageStore from 'src/stores/HomePageStore';

interface Props {
	history?: any;
	categories: Category[];
}
interface IState {
	categoryId: string;
	areaValueText: any;
	categoryValueText: any;
	disableSearch: boolean;
	selected: number;
}

// the options on the select box
const cartStore: CartStore = rootStores[CART_STORE];
const profileStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const menuStore: MenuStore = rootStores[MENU_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const navRef: React.RefObject<HTMLDivElement> = React.createRef();

const NavBar : React.FC<Props> = ({ 
	history,
	categories
}) => {

	const [categoryId,setCategoryId] = useState<string>('')
	const [areaValueText,setAreaValueText] = useState<any>('כל האזורים')
	const [categoryValueText,setCategoryValueText] = useState<any>('כל הקטגוריות')
	const [disableSearch,setDisableSearch] = useState<boolean>(true)
	const [selected,setSelected] = useState<number>(-1)

	const searchRef = React.createRef<HTMLInputElement>();
	let isAnalyticsSent = false;


	useEffect(() => {
		menuStore.initSearchByParameter(history.location.pathname);
	},[])

	const updateDimensions = () => {
		const height: HTMLDivElement | null = navRef.current;
		const navClientHeight = height ? height.clientHeight : 0;
		menuStore.setNavHeight(navClientHeight);
	}

	let setSearchTextToMenuStore = (event) => {
		if (event) {
			menuStore.searchText = event.target.value;
			debouncedOnChange(event.target.value); // sending only the values not the entire event
		}
	}
	setSearchTextToMenuStore = setSearchTextToMenuStore.bind(window); // binding this because onChange is called in another scope

	let debouncedOnChange = (value) => {
		menuStore.autoCompleteResults.clear();
		menuStore.setSearchText(); // perform a search only once every 200ms
		menuStore.toggleSearchShow();
	}
	debouncedOnChange = _.debounce(debouncedOnChange.bind(window), 200); // debouncing function to 200ms and binding this

	const closeCart = () => {
		menuStore.cartShow = true;
		menuStore.cartHoverShow = false;
		menuStore.toggleCartShow();
	}

	const closePrifile = () => {
		menuStore.profileShow = true;
		menuStore.profileHoverShow = false;
		menuStore.toggleProfileShow();
	}
	const onHoverNavbarItem = (index: number) => {
		setSelected(index)
		menuStore.borderBottom = true;
	}

	// function that rendring all the catergories , function get catergory array and display all the catergories into the screen
	const renderAllCategories = (categories?: Category[]) => {
		const orangeBottomLine = menuStore.borderBottom ? 'orange' : '';
		if (categories) {
			const numOfCategories = categories.length;
			categories = categories
				.sort((a, b) => a['sortOrder'] - b['sortOrder'])
				.slice(0, numOfCategories >= 11 ? 11 : numOfCategories);
				return categories.map((c: Category, index: number) => (
					<React.Fragment key={c.categoryId || index}>
						<div
							className={`by-top-nav-bar-middle-item ${selected === index ? orangeBottomLine : ''} ${authStore.canActivateAction ? 'cursor-pointer' : ''}`}
							onClick={() => {
								if (authStore.canActivateAction) {
									GoogleAnalyticsUtils.clickOnProduct(categories, c);
									CategoryUtils.renderSubCategory(c, history, true);
								}
							}}
							onMouseEnter={() => {
								menuStore.toggleSubCatergoriesShow(c);
								onHoverNavbarItem(index);
								if (!isAnalyticsSent) {
									sendImpressionAnalytics();
									isAnalyticsSent = true;
								}
							}}>
							{c.categoryName}
						</div>
						{index < (numOfCategories - 1) && <div className='separation'></div>}
					</React.Fragment>
				));
		} else {
			return null;
		}
	};

	// function to make search box to unshow from the screen
	const onMouseLeaveSearchBox = () => {
		menuStore.searchBoxShowSuggestions = false;
	};

	const setSearcTextFromBarSearch = (resualt?: string) => {
		if (resualt) {
			menuStore.searchText = resualt;
			menuStore.setSearchText();
			menuStore.toggleSearchShow();
			onClickSearchButton();
		}
	};

	const renderAutoComplete = () => {
		let results: string[] = menuStore.autoCompleteResults ? toJS(menuStore.autoCompleteResults) : [];
		if (results) {
			return results.map((result: string, index: number) => (
				<div
					key={index}
					className='by-navbar-floating-search-box-item cursor-pointer'
					onMouseEnter={() => openSearchBox()}>
					{/* <CustomSpan text={result} onClick={() => setSearcTextFromBarSearch(result)} /> */}
					<span className='custom-span-text-show-all' onClick={() => setSearcTextFromBarSearch(result)}>{result}</span>
				</div>
			));
		} else {
			return null;
		}
	};

	const setSearchText = (searchText: string) => {
		menuStore.searchText = searchText;
	};

	const onClickSearchButton = () => {
		menuStore.autoCompleteResults.clear();
		homePageStore.searchPageNumber = 1;
		if (authStore.canActivateAction) {
			menuStore.GetSearchData();
			const category = menuStore.catergoryToSearch ? menuStore.catergoryToSearch : []; // get the category from the menu store by the name
			if (category) {
				menuStore.searchBoxShowSuggestions = false;
				history.push(
					`${RoutesPath.category.searchCategory}${menuStore.searchText ? '/' + StringFormatUtils.readySearchText(menuStore.searchText) : '/'
					}`
				);
			}
		}
	};

	const sendSelectorArea = (info) => {
		if (info) {
			menuStore.searchArea = info.regionId;
			setAreaValueText(info)
		} else {
			menuStore.searchArea = '';
			setAreaValueText('כל האזורים')
		}
	};

	const sendSelectorCategory = (info) => {
		if (info) {
			menuStore.searchCategory = info.categoryId;
			setCategoryValueText(info)
		} else {
			menuStore.searchCategory = -1;
			setCategoryValueText('כל הקטגוריות')
		}
	};

	const redirectToProfile = () => {
		if (authStore.canActivateAction) {
			menuStore.profileShow = false;
			history.push(RoutesPath.profile.root);
		}
	};
	const redirectToChargingCard = () => {
		if (!authStore.canActivateAction) return;
		tryNavigateToLoadCard(history);
	};

	const redirectToCart = () => {
		if (authStore.canActivateAction)
			history.push(RoutesPath.cart.root);
	};

	const sendImpressionAnalytics = () => {
		// Impression of commercials in navbar
		const rightCommercial = {
			messageContext: 'Top Advertisment',
			messageKey: 'Right Advertisment',
			messageName: 'Right Advertisment',
		};

		const leftCommercial = {
			messageContext: 'Top Advertisment',
			messageKey: 'Left Advertisment',
			messageName: 'Left Advertisment',
		};
		//GoogleAnalyticsUtils.onPromoView(rightCommercial, '2');
		//GoogleAnalyticsUtils.onPromoView(leftCommercial, '1');
	}

	const setSubCategoriesHover = () => {
		if (!menuStore.subCategoriesHover) {
			menuStore.subCategoriesHover = true;
			menuStore.subCategoriesShow = true;
		}
	}

	const disablSubCategoriesAndProfileHover = () => {
		menuStore.profileShow = false;
		menuStore.currentCatergory = undefined;
		menuStore.borderBottom = false;
	};
	const openSearchBox = () => {
		if (menuStore.autoCompleteResults.length > 0) {
			menuStore.searchBoxShowSuggestions = true;
		}
	}
	const focusSearch = () => {
		if (searchRef.current) {
			searchRef.current.focus();
		}
	}
	const deleteSearchText = () => {
		menuStore.searchText = '';
	}
	const onOpenProfileNewTab = () => { };
	const openNewPage = (url) => {
		ExternalLinkConfirm.OpenLinkExternal(url, '_blank');
	};
	// varibles to inject "hide" into the css
	const hideSeachClass = menuStore.searchBoxShowSuggestions && menuStore.searchText ? '' : 'hide';
	const hideCartClass = menuStore.cartShow && authStore.canActivateAction ? '' : 'hide';
	const hideProfileClass = menuStore.profileShow && authStore.canActivateAction ? '' : 'hide';
	const hideSubCategories = menuStore.subCategoriesShow ? '' : 'hide';
	// varibles to inject "color" into the css
	const changeShoppingCarColor = menuStore.cartShow && authStore.canActivateAction ? 'color' : '';
	const changeProfileColor = menuStore.profileShow && authStore.canActivateAction ? 'color' : '';
	const regions = profileStore.getRegions ? profileStore.getRegions : [];
	const categoriesforSelector = menuStore.categoriesForMenu ? menuStore.categoriesForMenu : [];
	return (
		<div className='navbar-container-1' ref={navRef} onLoad={updateDimensions}>
			<div className='navbar-container'>
				<div className='navbar-right'>
					<div className='navbar-right-up'
						onMouseLeave={menuStore.toggleAllHovers}
					>
						<div className='logo-container' onMouseEnter={disablSubCategoriesAndProfileHover}>
							<img
								className='logo-item cursor-pointer'
								src={require('../../../assets/beyhad-newLogo.png')}
								onClick={() => {
									if (authStore.canActivateAction) {
										history.push(`/`);
									} else {
										authStore.logout();
									}
								}}
								alt={Lang.format('BeyahadBeshvilha')}
							/>
						</div>
						{menuStore.currentCatergory && authStore.canActivateAction && (
							<div className={`by-navbar-floating-box top sub-categories ${hideSubCategories}`}>
								<SubCatergories history={history} />
							</div>
						)}
						<div
							className={`by-top-nav-bar-middle`}
							onMouseEnter={setSubCategoriesHover}
							onMouseLeave={setSubCategoriesHover}>
							{renderAllCategories(categories)}
						</div>
					</div>
					<div className='navbar-right-botoom'>
					{authStore.showNavBarSearchBox && (
						<div className='navbar-right-botoom1'>
							<div className='by-buttom-nav-bar-right'>
								<div className='input-container'>
									<img src={require('../../../assets/magnifying-glass.png')} alt="" />
									<input
										className='by-buttom-nav-bar-right search-box'
										type={'text'}
										disabled={disableSearch}
										onMouseOver={() => {
											setDisableSearch(false)
										}}
										onBlur={() => {
											setDisableSearch(true)
										}}
										onClick={() => {
											setDisableSearch(false)
										}}
										value={menuStore.searchText}
										autoComplete={'nope'}
										placeholder={Lang.format('Search_for_Brands_or_Tags')}
										onChange={setSearchTextToMenuStore}
										onMouseEnter={openSearchBox}
										id='navbar-search'
										onKeyPress={(event) => {
											if (event.key === 'Enter') {
												onClickSearchButton();
											}
										}}
										ref={searchRef}
									/>
								</div>
								<CustomButton
									onClick={() => onClickSearchButton()}
									disabled={false}
									text={'חיפוש'}
									buttonClassName={`center normal-blue tags-home-page font-size`}
								/>
							</div>
						</div>
					)}
						<div className='navbar-right-botoom2'>
							<div className='max-button right-button' onClick={() => openNewPage(configurationStore.getConfiguration.pointsSkyMaxLink)}>צברת {authStore.currentUser.points_skymax} נקודות ב &nbsp; <img className='sky-img' src={require('../../../assets/sky-logo.png')}></img>&nbsp; &#62;</div>
							<div className='max-button left-button' onClick={() => openNewPage(configurationStore.getConfiguration.benefitsMaxLink)}>צברת החודש {authStore.currentUser.total_Benefit_quantity} פינוקים בכרטיס &nbsp;<img className='max-img' src={require('../../../assets/max-logo.png')}></img>&nbsp; &#62;</div>
						</div>
					</div>
					<div
						className={`by-navbar-floating-box top search ${hideSeachClass}`}
						onMouseEnter={openSearchBox}
						onMouseLeave={() => (menuStore.searchBoxShowSuggestions = false)}>
						<div className='show-all-button' onClick={() => onClickSearchButton()}>
							הצג הכל
						</div>
						{renderAutoComplete()}
					</div>
				</div>
				<div className='navbar-left'>
					<div className='navbar-left-container'>
						<div className='first-line'>{Lang.format('Hello')}, {authStore.currentUser.firstName}</div>
						<div className='second-line'>
							<div className='second-line-container container-private-area'
								onMouseLeave={closePrifile}
								onMouseEnter={menuStore.toggleProfileShow}
							>
								<svg onClick={(e) => {
									if (authStore.canActivateAction)
										history.push(RoutesPath.profile.history);
								}} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className='svg-nav-bar'>
									<path d="M.93 22a1 1 0 1 0 2 0c0-3.529 2.031-6.653 5.198-8.13a6.952 6.952 0 0 0 7.615-.008 9.125 9.125 0 0 1 2.55 1.775A8.942 8.942 0 0 1 20.93 22a1 1 0 1 0 2 0c0-2.937-1.145-5.698-3.223-7.777a11.074 11.074 0 0 0-2.37-1.784A6.967 6.967 0 0 0 18.928 8c0-3.86-3.14-7-7-7s-7 3.14-7 7c0 1.68.595 3.222 1.585 4.43A10.934 10.934 0 0 0 .93 22zM11.929 3c2.757 0 5 2.243 5 5s-2.243 5-5 5-5-2.243-5-5 2.243-5 5-5z" />
								</svg>
								<CustomSpan text='איזור אישי' />
								<div className={`by-navbar-floating-box top profile ${hideProfileClass}`}>
									<ProfileHover history={history} />
								</div>
							</div>
							<div className='second-line-container'
								onMouseEnter={() => { menuStore.toggleCartShow; GoogleAnalyticsUtils.sendShopingBasketDetailsToAnalytics('view_cart', cartStore.getCartForPayment) }}
								onMouseLeave={closeCart}
								onMouseOver={() => { (menuStore.cartShow = true) }}
							>
								<svg
									onClick={() => {
										if (authStore.canActivateAction) {
											history.push(RoutesPath.cart.root)
											GoogleAnalyticsUtils.sendShopingBasketDetailsToAnalytics('view_cart', cartStore.getCartForPayment)
										}
									}}
									viewBox="0 0 512 512"
									xmlns="http://www.w3.org/2000/svg"
									className='svg-nav-bar'>
									<switch>
										<g>
											<path d="M506 79.6c-4.8-5.5-11.7-8.7-19-8.7H132.4c-13.8 0-25 11.2-25 25s11.2 25 25 25h325.4L436 262c-2.4 15.8-15.8 27.3-31.8 27.3H91.1L49.7 21.2C47.6 7.5 34.8-1.8 21.2.3 7.5 2.4-1.8 15.2.3 28.8l57 368.8c2.2 14.2 9.4 27.2 20.3 36.6s24.9 14.5 39.2 14.5H156V487c0 13.8 11.2 25 25 25s25-11.2 25-25v-38.3h146.2V487c0 13.8 11.2 25 25 25s25-11.2 25-25v-38.3h48.2c13.8 0 25-11.2 25-25s-11.2-25-25-25H116.8c-5.1 0-9.4-3.7-10.2-8.7l-7.8-50.7h305.4c19.6 0 38.6-7 53.5-19.8s24.7-30.5 27.7-49.8l26.3-170c1.1-7.3-1-14.6-5.7-20.1z" />
										</g>
									</switch>
								</svg>
								<CustomSpan text='סל קניות' />
								<div id='123' className={`by-navbar-floating-box top shopping-cart ${hideCartClass}`}>
									<ShopingCartHover history={history} />
								</div>
							</div>

						</div>
						<div className='third-line'>
							<div className='third-line-container' onClick={redirectToChargingCard}>
								<img src={require('../../../assets/credit-nav-bar-card.png')} alt="" />
								<div>{Lang.format('Load_Card')}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default observer(NavBar)
