import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { CustomButton, CustomSelector, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { MENU_STORE, PROFILE_CARD_STORE, AUTH_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import MenuStore from '../../../../stores/MenuStore';
import * as _ from 'lodash';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import AuthStore from '../../../../stores/AuthStore';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';
import StringFormatUtils from 'src/utils/StringFormatUtils';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
}
interface IState {
	areaValueText: any;
	categoryValueText: any;
	disableSearch: boolean;
}

const menuStore: MenuStore = rootStores[MENU_STORE];
const profileStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const SideBarSearchHover : React.FC<Props> = ({
	history
}) => {
	const [areaValueText, setAreaValueText] = useState<any>('כל האזורים');
	const [categoryValueText, setCategoryValueText] = useState<any>('כל הקטגוריות');
	const [disableSearch, setDisableSearch] = useState<boolean>(true);
	let searchRef = React.createRef<HTMLInputElement>();


	useEffect(() => {
		menuStore.initSearchByParameter(history.location.pathname);
	},[])

	const setSearchTextToMenuStore = (event) => {
		menuStore.searchText = event.target.value;
		debouncedOnChange(); // sending only the values not the entire event
	}

	const debouncedOnChange = () => {
		menuStore.autoCompleteResults.clear();
		menuStore.setSearchText(); // perform a search only once every 200ms
	}

	const setSearcTextFromBarSearch = (resualt?: string) => {
		if (resualt) {
			menuStore.searchText = resualt;
			menuStore.setSearchText();
			//menuStore.toggleSearchShow();
			menuStore.searchBoxShowSuggestions = false;
			onClickSearchButton();
		}
	};

	const renderAutoComplete = () => {
		let results: string[] = menuStore.autoCompleteResults ? toJS(menuStore.autoCompleteResults) : [];
		if (results) {
			return results.map((result: string, index: number) => (
				<>
					<div key={index} className='side-bar-floating-search-box-item' onMouseEnter={() => openSearchBox()}>
						<CustomSpan text={result} onClick={() => setSearcTextFromBarSearch(result)} />
					</div>
				</>
			));
		} else {
			return null;
		}
	};

	const onClickSearchButton = () => {
		if (authStore.canActivateAction) {
			menuStore.GetSearchData();
			const category = menuStore.catergoryToSearch ? menuStore.catergoryToSearch : []; // get the category from the menu store by the name
			if (category) {
				menuStore.showSearchContainerInMobile = false;
				menuStore.searchBoxShowSuggestions = false;
				history.push(
					`${RoutesPath.category.searchCategory}${menuStore.searchText ? '/' + StringFormatUtils.readySearchText(menuStore.searchText) : '/'}`
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
		menuStore.autoCompleteResults.clear();
	}
	const hideSeachClass = menuStore.searchBoxShowSuggestions ? '' : 'hide';
	const regions = profileStore.getRegions ? profileStore.getRegions : [];
	return (
		<div className='side-bar-search-hover'>
			<div className='side-bar-search-hover-main-container'>
				<div className='side-bar-search-hover-input'>
					<input
						className='side-bar-search-hover-input-text'
						type={'text'}
						value={menuStore.searchText}
						placeholder={Lang.format('Search_for_Brands_or_Tags')}
						onChange={setSearchTextToMenuStore}
						onKeyPress={(event) => {
							if (event.key === 'Enter') {
								onClickSearchButton();
							}
						}}
						ref={searchRef}
					/>
					<img
						className={`search-icon`}
						src={require('../../../../assets/searchSideBar.png')}
						alt={Lang.format('Search')}
						onClick={() => focusSearch()}
					/>
					{menuStore.searchText && menuStore.searchText != '' && (
						<div className={`delete-text-icon`} onClick={() => deleteSearchText()}>
							<img
								src={require('../../../../assets/X.png')}
							/>
						</div>
					)}
				</div>
				<div className={`side-bar-search-floating-box ${hideSeachClass}`} onClick={() => openSearchBox()}>
					<div className='button-container'>
						<div className='blue-button-show-all' onClick={onClickSearchButton}>הצג הכל</div>
					</div>

					{renderAutoComplete()}
				</div>
				{<div className='side-bar-search-button'>
					<CustomButton text='חיפוש' buttonClassName='primary-design center' onClick={onClickSearchButton} />
				</div>}
			</div>
		</div>
	);
}
export default observer(SideBarSearchHover)
