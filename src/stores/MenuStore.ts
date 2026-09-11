import {action, IObservableArray, observable, computed, toJS, makeAutoObservable} from 'mobx';
import Category from '../models/Category';
import CatgoryService from '../services/CatgoryService';
import AuthStore from './AuthStore';
import {SearchStatus} from '../models/enums';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import {Logger} from 'nofshonit-base-web-client';
import StringFormatUtils from '../utils/StringFormatUtils';

export default class MenuStore {
	authStore: AuthStore;

	//var to handle cart box show \ unshow
	@observable cartShow: boolean = false;

	//var to handle cart box show \ unshow
	@observable cartHoverShow: boolean = false;

	//var to handle profile box show \ unshow
	@observable profileShow: boolean = false;

	//var to handle profile box show \ unshow
	@observable profileHoverShow: boolean = false;

	//var to handle search box show \ unshow
	@observable searchBoxShowSuggestions: boolean;

	//var to handle subCategories box show \ unshow
	@observable subCategoriesShow: boolean = false;

	//var to handle sidebar sub Categories box show \ unshow
	@observable subCategoriesHover: boolean = false;

	//var to handle side bar search component show \ unshow
	@observable showSearchContainerInMobile: boolean = false;

	//var to show the search status
	@observable searchStatus: SearchStatus = SearchStatus.Finshed;

	// var to hold the current catergory
	@observable currentCatergory: Category | any = new Category();

	// var to search catergory by name
	@observable searchText?: string = '';

	// var to search catergory by area
	@observable searchArea?: string = '';

	// var to search catergory by category
	@observable searchCategory?: number;

	@observable navHeight: number;

	// array to hold all catergories
	@observable categoriesForMenu: IObservableArray<Category> = observable([]);

	@observable areaForMenu: IObservableArray<string> = observable([]);

	@observable autoCompleteResults: IObservableArray<string> = observable([]);

	@observable catergoryToSearch: IObservableArray<Category> = observable([]);

	@observable numberofselectTop: number;

	@observable selectTopMaxNumber: number;

	@observable amountPerPage: number;

	@observable isOpenBurgerMenu: boolean = false;

	@observable hideSideBarCollapsible: number;

	@observable closeSideBarCollapsible: boolean = false;

	@observable hideSidebarSubCategories: boolean = false;

	@observable borderBottom: boolean = false;

	@observable showGoBackBtn: boolean = false;

	@observable showSideBar: boolean = true;

	constructor(authstore: AuthStore) {
		this.authStore = authstore;
		makeAutoObservable(this);
	}

	@action
	toggleCartShow = () => {
		if (this.cartShow && !this.cartHoverShow) {
			this.cartShow = false;
		} else {
			this.cartShow = true;
		}

		this.profileShow = false;
		this.searchBoxShowSuggestions = false;
		this.currentCatergory = undefined;
	};

	// function that open \ close on click the profile box (used by BYNanBar)
	@action
	toggleProfileShow = () => {
		if (this.profileShow && !this.profileHoverShow) {
			this.profileShow = false;
		} else {
			this.profileShow = true;
		}
		this.cartShow = false;
		this.searchBoxShowSuggestions = false;
		this.currentCatergory = undefined;
	};

	@action
	toggleBorderBottom = () => {
		if (this.borderBottom) {
			this.borderBottom = false;
		} else {
			this.borderBottom = true;
		}
	};

	@action
	setshowSideBarFalse = () => {
		this.showSideBar = false;
	};

	@action
	toggleAllHovers = () => {
		this.profileShow = false;
		this.cartShow = false;
		this.searchBoxShowSuggestions = false;
		this.currentCatergory = undefined;
		this.borderBottom = false;
	};

	// function that open \ close on click the search box (used by BYNanBar)
	@action
	toggleSearchShow = () => {
		if (this.autoCompleteResults.length > 0) {
			if (this.searchBoxShowSuggestions) {
				this.searchBoxShowSuggestions = false;
			} else {
				this.searchBoxShowSuggestions = true;
			}
			this.profileShow = false;
			this.cartShow = false;
			this.currentCatergory = undefined;
		}
	};

	@action
	toggleSideBarSearchBoxShow = () => {
		if (this.showSearchContainerInMobile) {
			this.showSearchContainerInMobile = false;
		} else {
			window.scrollTo(0, 0);
			this.showSearchContainerInMobile = true;
		}
	};

	@action
	toggleSubCatergoriesShow = (c: Category) => {
		if (!this.subCategoriesShow && !this.subCategoriesHover) {
			this.currentCatergory = undefined;
			this.subCategoriesShow = false;
		}
		if (this.subCategoriesShow || this.subCategoriesHover) {
			this.currentCatergory = c;
			this.subCategoriesShow = true;
			this.borderBottom = true;
		} else {
		}
		this.cartShow = false;
		this.profileShow = false;
		this.searchBoxShowSuggestions = false;
	};

	// function that open \ close on click the profile box (used by BYNanBar)
	@action
	toggleIsOpenBurgerMenu = () => {
		this.isOpenBurgerMenu = !this.isOpenBurgerMenu; // to close the burger menu
		this.hideSideBarCollapsible = -1; // to close the collapsible
		this.hideSidebarSubCategories = true;
	};

	@action
	closeBurgeMenu = () => {
		this.isOpenBurgerMenu = true;
	}

	@action
	toggleSideBarCollapsible = (index: number) => {
		if (this.hideSideBarCollapsible === -1) {
			this.hideSideBarCollapsible = index;
			this.closeSideBarCollapsible = true;
		} else if (this.hideSideBarCollapsible != index) {
			this.hideSideBarCollapsible = index;
			this.closeSideBarCollapsible = true;
		} else if (this.hideSideBarCollapsible === index && this.hideSidebarSubCategories === true) {
			this.hideSidebarSubCategories = false;
			this.hideSideBarCollapsible = index;
		} else if (this.hideSideBarCollapsible === index && this.hideSidebarSubCategories === false) {
			this.hideSideBarCollapsible = -1;
			this.closeSideBarCollapsible = true;
		} else {
			this.hideSideBarCollapsible = -1;
		}
	};

	// function to init all the categories into one array
	@action
	async init() {
		this.hideSideBarCollapsible = -1;
		this.isOpenBurgerMenu = true;
		this.hideSidebarSubCategories = false;
		this.closeSideBarCollapsible = true;
		try {
			const configs = await NofhonitConfigurationLoader.loadConfiguration();
			this.numberofselectTop = configs.numberofselectTop;
			if (this.numberofselectTop === undefined) {
				this.numberofselectTop = 10;
			}
			this.selectTopMaxNumber = configs.selectTopMaxNumber;
			if (this.selectTopMaxNumber === undefined) {
				this.selectTopMaxNumber = 100;
			}
			this.amountPerPage = configs.amountPerPage;
			if (this.amountPerPage === undefined) {
				this.amountPerPage = 16;
			}
		} catch (err) {
			Logger.error('err iis ', err);
		}
		return CatgoryService.initCategoriesForMenu().then((response: Category[]) => {
			this.categoriesForMenu.replace(response);
		});
	}

	@action
	setSearchText() {
		this.autoCompleteResults.clear();
		if (this.searchText && this.searchText.length > 2 && this.authStore.isUserLoggedIn) {
			CatgoryService.GetAutoCompleteResults(this.searchText, this.numberofselectTop).then(
				(results) => {
					this.autoCompleteResults.clear();
					for (let i = 0; i < this.numberofselectTop; i++) {
						if (results[i]) {
							this.autoCompleteResults.push(results[i].categoryName);
						}
					}
					if (this.autoCompleteResults.length > 0) {
						this.searchBoxShowSuggestions = true;
					}
				}
			);
		} else {
			this.autoCompleteResults.clear();
			this.searchBoxShowSuggestions = false;
		}
	}

	@action
	GetSearchData = () => {
		this.catergoryToSearch.clear();
		this.searchStatus = SearchStatus.Searcing;
		CatgoryService.GetSearchData(
			this.searchText,
			this.selectTopMaxNumber,
			this.searchCategory,
			this.searchArea
		)
			.then((results) => {
				for (let i = 0; i < results.data.length; i++) {
					if (results.data[i] && this.catergoryToSearch) {
						this.catergoryToSearch.push(toJS(results.data[i]));
					}
				}
				if (this.catergoryToSearch && this.catergoryToSearch.length > 0) {
					this.searchStatus = SearchStatus.Finshed;
				} else {
					this.searchStatus = SearchStatus.NoResualts;
				}
			})
			.catch((err) => {
				Logger.debug(err);
				this.searchStatus = SearchStatus.NoResualts;
			});
	};

	@action
	initSearchByParameter(pathname: string) {
		// Getting Search Paramter
		if (pathname.indexOf('searchCategory') > -1) {
			const pathnameArray = pathname.split('/');
			const searchParam = pathnameArray[pathnameArray.length - 1];

			// Searching with search parameter
			//
			this.searchText = searchParam == 'searchCategory' ? '' : StringFormatUtils.readySearchText(searchParam, true);
			this.setSearchText();
			this.GetSearchData();
		}
	}

	@action
	setNavHeight(height:number) {
		if(height >= 0)
			this.navHeight = height;
	}

	// function to return the current sub category
	@computed
	get getSubCurrentCategories() {
		if (this.currentCatergory) {
			return this.currentCatergory.children;
		}
		return [];
	}

	@computed
	get getCurrentCategorie() {
		if (this.currentCatergory) {
			return this.currentCatergory;
		}
		return [];
	}

	@computed
	get getCatergoriesForMenu() {
		return this.categoriesForMenu;
	}

	@computed
	get getCategories() {
		return this.catergoryToSearch;
	}

	@computed
	get getNavHeight():number{
		return this.navHeight;
	}
}
