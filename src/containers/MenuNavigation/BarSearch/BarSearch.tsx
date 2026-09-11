import { observer } from 'mobx-react';
import { CustomHeader, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import BreadCrumbs, { Crumbs } from '../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomAdvertising from '../../../components/CustomComponents/CustomAdvertising';
import { RoutesPath } from '../../../consts/RoutesPath';
import { MENU_STORE, AUTH_STORE, CONFIGURATION_STORE, HOMEPAGE_STORE } from '../../../consts/stores';
import Category from '../../../models/Category';
import { SearchStatus } from '../../../models/enums';
import rootStores from '../../../stores';
import MenuStore from '../../../stores/MenuStore';
import { toJS } from 'mobx';
import CategoryUtils from '../../../utils/categoryUtils';
import { CustomMediaQuery } from '../../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import TextCustomItemComponent from '../../../components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import Lang from '../../../config/Language';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import CustomButtonBeyahad from '../../../components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import * as _ from 'lodash';
import { get } from 'lodash';
import AuthStore from '../../../stores/AuthStore';
import { useState } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import HomePageStore from 'src/stores/HomePageStore';

interface Props {
	location?: any;
	category?: Category;
	history?: any;
}
interface IState {
	categories: any;
	startIndex: number;
	endIndex: number;
	isPaginationLastPage: boolean;
}

const menuStore: MenuStore = rootStores[MENU_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];


const BarSearch: React.FC<Props> = ({
	location,
	category,
	history,
}) => {
	const [categories,] = useState<any>(menuStore.getCategories);
	const [startIndex, setStartIndex] = useState<number>(0);
	const [endIndex, setEndIndex] = useState<number>(menuStore.amountPerPage);
	const [isPaginationLastPage, setIsPaginationLastPage] = useState<boolean>(false);

	React.useEffect(() => {

		calculatePage(homePageStore.searchPageNumber);

	}, [homePageStore.searchPageNumber])
	const renderPagination = () => {
		let len = Math.ceil(categories.length / menuStore.amountPerPage);

		let paginationButtons: number[] = new Array(len);
		for (let i = 1; i < len + 1; i++) {
			paginationButtons.push(i);
		}

		return paginationButtons.map((pageNumber, index) => {
			return (
				<div className={`bar-search-pagination-button ${homePageStore.searchPageNumber == pageNumber ? 'pagination_active' : ''}`} key={index} onClick={() => calculatePage(pageNumber)}>
					{pageNumber}
				</div>
			);
		});
	}

	const calculatePage = (pageNumber) => {
		if (pageNumber == homePageStore.searchPageNumber && pageNumber == 1)
			return;

		let amountPerPage = menuStore.amountPerPage,
			startIndexVar = startIndex,
			endIndexVar = endIndex,
			numOfResults = categories.length,
			lastPage = pageNumber * menuStore.amountPerPage >= numOfResults;
		setIsPaginationLastPage(lastPage)
		if (lastPage) {
			endIndexVar = numOfResults;
			startIndexVar = pageNumber * amountPerPage - amountPerPage;
		} else {
			endIndexVar = amountPerPage * pageNumber;
			startIndexVar = endIndexVar - amountPerPage;
		}
		setStartIndex(startIndexVar);
		setEndIndex(endIndexVar);
		homePageStore.searchPageNumber = pageNumber
		scrollTo(0, 0);
	};

	const isLastPage = (pageNumber) => pageNumber * menuStore.amountPerPage >= categories.length;

	const renderBreadCrumbs = () => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs('דף הבית', RoutesPath.root));

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		crumbsRoute.push(new Crumbs('חיפוש', RoutesPath.category.root));
		if (menuStore.searchText && menuStore.searchStatus === SearchStatus.Finshed) {
			crumbsRoute.push(new Crumbs(menuStore.searchText, RoutesPath.category.lobby));
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	const renderVarients = (categories?: Category[]) => {

		if (categories && menuStore.searchStatus === 'finshed') {
			menuStore.toggleSearchShow();
			GoogleAnalyticsUtils.sendAnalyticsResultProducts(categories, 'תוצאות חיפוש');
			return categories.map((c: Category, index: number) => {
				const categoryName = _.get(c, 'categoryName', '');
				const alt = _.get(c, 'images[0].alt', categoryName);
				const addressAlt = _.get(c, 'business.address', '');
				let addSpaces = c.categoryName.split('+ ').join('+');

				// addSpaces = addSpaces.split(' +').join('+');
				// addSpaces = addSpaces.split('+ ').join('+');
				// addSpaces = addSpaces.split(' -').join('-');
				// addSpaces = addSpaces.split('- ').join('-');
				// addSpaces = addSpaces.split('-').join(' - ');
				// addSpaces = addSpaces.split('+').join(' + ');
				// addSpaces = addSpaces.split('/').join(' / ');
				// addSpaces = addSpaces.split(' /').join(' / ');
				// addSpaces = addSpaces.split('/ ').join(' / ');
				// console.log(addSpaces)
				return (
					<div
						onClick={() => {
							authStore.productJsonForGA = 'תוצאות חיפוש';
							authStore.productIndexForGA = (index + 1).toString()
							GoogleAnalyticsUtils.sendProductToAnalytics(categories, c, 'select_item', authStore.productJsonForGA, authStore.productIndexForGA)
							CategoryUtils.renderPage(
								c.categoryId,
								authStore.canActivateAction,
								c,
								history
							);
						}}
						key={index}
						className='bar-search-item'>
						{c.images && c.images[0] && (
							<div className="bar-search-item-img-con">
								<img
									className='bar-search-item-img'
									alt={alt}
									title={alt}
									src={`${configurationStore.getConfiguration.picsUrl}/share/${c.images[0].file}`}
								/>
							</div>
						)}
						{c.images.length === 0 && (
							<div className="bar-search-item-img-con">
								<img
									className='bar-search-item-img'
									src={require('../../../assets/generalimage.jpg')}
									alt={alt}
								/>
							</div>
						)}


						<CustomMediaQuery.Desktop>
							<div className="bar-search-content-container">
								<div className='bar-search-content-container-txt'>
									<div className='bar-search-item-header'>
										<CustomHeader
											text={addSpaces}
											headerClassName='bold'
											type={HeaderType.SubTitle}
										/>
									</div>
									<div className='bar-search-item-price'>
										{c.description &&
											<TextCustomItemComponent
												text={c.description ? c.description : ''}
												icon={{ src: require('../../../assets/icons/price_tag.svg'), name: 'price tag' }}
												customClass={'block'}
											/>
										}
									</div>
									<div className='bar-search-item-location'>
										{!c.isConsumption && c.business && c.business.address && (
											<>
												{get(c, 'business.sumSubBranch') <= 1 ? (
													<TextCustomItemComponent
														text={c.business.address}
														icon={{ src: require('../../../assets/icons/pin.svg'), name: 'location icon' }}
														spanClassName='smallTxt'
													/>) : (
													<TextCustomItemComponent
														text={Lang.format('VarietyOfBranches')}
														icon={{ src: require('../../../assets/icons/pin.svg'), name: 'location icon' }}
														spanClassName='smallTxt'
													/>)}
											</>
										)}
									</div>
								</div>
								<CustomButtonBeyahad
									customClass={''}

									isCurserPointer={true}
									buttonText={Lang.format('ForDetailsAndPurchase')}
								/>
							</div>
						</CustomMediaQuery.Desktop>

						<CustomMediaQuery.Mobile>
							<div className="bar-search-content-container">
								<div className='bar-search-content-container-txt'>
									<div className='bar-search-item-header'>
										<CustomHeader
											text={addSpaces}
											headerClassName='bold smallTxt'
											type={HeaderType.SubTitle}
										/>
									</div>
									<div className='bar-search-item-price'>
										{c.description &&
											<TextCustomItemComponent
												text={c.description ? c.description : ''}
												icon={{ src: require('../../../assets/icons/price_tag.svg'), name: 'price tag' }}
												customClass={'block'}
												spanClassName='smallTxt'
											/>
										}
									</div>
									<div className='bar-search-item-location'>
										{!c.isConsumption && c.business && c.business.address && (
											<>
												{get(c, 'business.sumSubBranch') <= 1 ? (
													<TextCustomItemComponent
														text={c.business.address}
														icon={{ src: require('../../../assets/icons/pin.svg'), name: 'location icon' }}
														spanClassName='smallTxt'
													/>) : (
													<TextCustomItemComponent
														text={Lang.format('VarietyOfBranches')}
														icon={{ src: require('../../../assets/icons/pin.svg'), name: 'location icon' }}
														spanClassName='smallTxt'
													/>)}
											</>
										)}
									</div>
								</div>
								<CustomButtonBeyahad
									customClass={''}
									onClick={() => { GoogleAnalyticsUtils.clickOnProduct(categories, c); }}
									isCurserPointer={true}
									buttonText={Lang.format('ForDetailsAndPurchase')}

								/>
							</div>
						</CustomMediaQuery.Mobile>
					</div>
				);
			});
		} else {
			return (
				<div className='no-resulte-in-search'>
					{menuStore.searchStatus === SearchStatus.NoResualts && (
						<CustomHeader type={HeaderType.Title} text={'אין תוצאות'} />
					)}
				</div>
			);
		}
	};

	return (
		<div className='bar-search-main-container'>
			<div>{renderBreadCrumbs()}</div>
			<CustomAdvertising history={history} />
			<div className='bar-search-page-reasults'>
				{menuStore.searchStatus === SearchStatus.Searcing && <CustomHeader type={HeaderType.Title} text={'מחפש'} />}
			</div>
			{menuStore.searchStatus === SearchStatus.Finshed &&
				<CustomHeader
					text={`${categories.length} ${Lang.format('NumOfSearchResults')} ${menuStore.searchText}`}
					headerClassName='bold smallTxt'
					type={HeaderType.SubTitle}
				/>
			}
			<div className="bar-search-results-container">{renderVarients(categories.slice(startIndex, endIndex))}</div>
			{menuStore.searchStatus === SearchStatus.Finshed &&
				<div className='bar-search-pagination-container'>
					<div className={`page_nav_arrow_btn ${homePageStore.searchPageNumber == 1 ? 'disabled' : ''}`} onClick={() => {
						if (homePageStore.searchPageNumber == 1) return;
						const prevPage = homePageStore.searchPageNumber - 1;
						calculatePage(prevPage)
					}}>
						<div className='arrow right'></div>
					</div>
					{renderPagination()}
					<div className={`page_nav_arrow_btn ${isLastPage(homePageStore.searchPageNumber) ? 'disabled' : ''}`} onClick={() => {
						if (isLastPage(homePageStore.searchPageNumber)) return;
						const nextPage = homePageStore.searchPageNumber + 1;
						calculatePage(nextPage)
					}}>
						<div className='arrow left'></div>
					</div>
				</div>
			}
		</div>
	);
}
export default observer(BarSearch)
