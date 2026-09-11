import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { CustomButton } from 'nofshonit-base-web-client';
import * as React from 'react';
import BreadCrumbs, { Crumbs } from '../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomAdvertising from '../../../components/CustomComponents/CustomAdvertising';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import { CATEGORY_STORE, CONFIGURATION_STORE, VIEW_STORE } from '../../../consts/stores';
import Category from '../../../models/Category';
import rootStores from '../../../stores';
import CategoryStore from '../../../stores/CategoryStore';
import ViewStore from '../../../stores/ViewStore';
import CategoryLobbyFilter from '../CategoryLobby/CategoryLobbyFilter/CategoryLobbyFilter';
import CategoriesPage from './CategoriesPage/CategoriesPage';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import CategoryFilterPopup, { CategoryFilter } from '../../../components/CustomComponents/CategoryFilterPopup/CategoryFilterPopup';
import CategoryFilterButton from '../../../components/CustomComponents/CategoryFilterButton/CategoryFilterButton';

interface Props {
	location: any;
	history?: any;
	category?: Category;
	match?: any;
}
interface IState { }
const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const CategoriesContainer: React.FC<Props> = ({
	location,
	history,
	category,
	match
}) => {

	const mounted = useRef(false);
	let prevCategory = useRef('');

	const [showFilterPopup, setShowFilterPopup] = useState(false);
	const [savedFilter, setSavedFilter] = useState<CategoryFilter | undefined>(undefined);
	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

	const renderBreadCrumbs = (product: Category) => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs('דף הבית', RoutesPath.root));

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		if (product.breadcrumbs) {
			for (let i = 0; i < product.breadcrumbs.length; i++) {
				if (product.breadcrumbs[i]) {
					if (i === product.breadcrumbs.length - 1) {
						crumbsRoute.push(
							new Crumbs(
								product.breadcrumbs[i].name,
								`${RoutesPath.category.rootProducts}/${product.breadcrumbs[i].id}`
							)
						);
					} else
						crumbsRoute.push(
							new Crumbs(
								product.breadcrumbs[i].name,
								`${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`
							)
						);
				}
			}
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	useEffect(() => {
		const prId = match.params.categoryId;
		if (!mounted.current) {
			mounted.current = true;
			if (!categoryStore.category) {
				const prId = match.params.categoryId;
				prevCategory.current = prId;
				categoryStore.category = new Category();
				viewStore.setLoadingView(true);
				categoryStore.getCategoryById(prId).then(() => {
					viewStore.setLoadingView(false);
					if (categoryStore.category) {
						GoogleAnalyticsUtils.sendAnalyticsResultProducts(categoryStore.category.subCategories, 'קטגוריות - ' + categoryStore.category.categoryName);
					}
					// Reset filters when category loads
					setSavedFilter(undefined);
					setFilteredCategories([]);
				});
			}
		} else {
			if (prevCategory.current != prId) {
				prevCategory.current = prId;
				categoryStore.category = new Category();
				viewStore.setLoadingView(true);
				categoryStore.getCategoryById(prId).then(() => {
					viewStore.setLoadingView(false);
					// Reset filters when category changes
					setSavedFilter(undefined);
					setFilteredCategories([]);
				});
			}

		}
	}, [match.params.categoryId]);


	// Update loading state when category is loaded
	useEffect(() => {
		if (categoryStore.category) {
			viewStore.setLoadingView(false);
		}
	}, [categoryStore.category]);

	const categoryVar: Category | any = categoryStore.category ? toJS(categoryStore.category) : {};
	const categoryId = categoryVar ? categoryVar.categoryId : '';

	const originalCategories = useMemo(() => {
		return categoryVar.subCategories || [];
	}, [categoryVar.subCategories]);

	const displayCategories = useMemo(() => {
		return savedFilter ? filteredCategories : originalCategories;
	}, [filteredCategories, originalCategories, savedFilter]);


	let imageBackroundURL = '';

	if (categoryVar.images && categoryVar.images.length > 0) {
		const imageBackround = categoryVar.images.filter(i => i.imageTypeId == 17);
		if (imageBackround && imageBackround.length > 0) {
			console.log(imageBackround[0])
			imageBackroundURL = imageBackround[0].file;
		}
	}
	var flag = false;
	if (categoryVar) {
		viewStore.setLoadingView(false);
	}
	if (categoryVar.subCategories) {
		if (categoryVar.subCategories.length > 100) {
			flag = true;
		}
	}
	const hasActiveFilters = (): boolean => {
		if (!savedFilter) return false;
		return !!(
			savedFilter.priceMin ||
			savedFilter.priceMax ||
			(savedFilter.selectedRegions && savedFilter.selectedRegions.length > 0) ||
			(savedFilter.selectedCities && savedFilter.selectedCities.length > 0) ||
			savedFilter.dateFrom ||
			savedFilter.dateTo
		);
	};

	const handleFilterApply = useCallback((filter: CategoryFilter) => {
		setSavedFilter(filter);
		let filtered = [...originalCategories];

		// Apply price filter if exists
		if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
			const minPrice = filter.priceMin !== undefined ? filter.priceMin : 0;
			const maxPrice = filter.priceMax !== undefined ? filter.priceMax : Number.MAX_SAFE_INTEGER;

			filtered = filtered.filter(category => {
				// Get prices from category.prices (array from server) or from variants
				let categoryPrices: number[] = [];

				// First, try to get prices from category.prices (from server)
				if (category.prices) {
					const pricesArray = Array.isArray(category.prices) ? category.prices : Array.from(category.prices);
					categoryPrices = pricesArray;
				}

				// If no prices from server, try variants
				if (categoryPrices.length === 0 && category.variants && category.variants.length > 0) {
					categoryPrices = category.variants.map(v => v.price || 0).filter(p => p !== undefined && p !== null);
				}

				// If still no prices, check if price range includes 0
				if (categoryPrices.length === 0) {
					return minPrice <= 0 && 0 <= maxPrice;
				}

				// Check if at least one price is in range
				return categoryPrices.some(price => price >= minPrice && price <= maxPrice);
			});
		}

		// Apply location filter if exists
		if ((filter.selectedRegions && filter.selectedRegions.length > 0) || (filter.selectedCities && filter.selectedCities.length > 0)) {
			filtered = filtered.filter(category => {
				// Get cityIds and regionIds from category (from server)
				let categoryCityIds: number[] = [];
				let categoryRegionIds: number[] = [];

				// Get cityIds from category.cityIds (from server)
				if (category.cityIds) {
					const cityIdsArray = Array.isArray(category.cityIds) ? category.cityIds : Array.from(category.cityIds);
					categoryCityIds = cityIdsArray;
				}

				// Get regionIds from category.regionIds (from server)
				if (category.regionIds) {
					const regionIdsArray = Array.isArray(category.regionIds) ? category.regionIds : Array.from(category.regionIds);
					categoryRegionIds = regionIdsArray;
				}

				// If no data from server, try locations array
				if (categoryCityIds.length === 0 && categoryRegionIds.length === 0 && category.locations && category.locations.length > 0) {
					category.locations.forEach(loc => {
						if (loc.cityId) {
							categoryCityIds.push(loc.cityId);
						}
						if (loc.regionId) {
							const regionIdNum = typeof loc.regionId === 'string' ? parseInt(loc.regionId) : loc.regionId;
							if (!isNaN(regionIdNum)) {
								categoryRegionIds.push(regionIdNum);
							}
						}
					});
				}

				// Check if category matches selected regions or cities
				const selectedRegionIds = (filter.selectedRegions || []).map(r => r.regionId);
				const selectedCityIds = (filter.selectedCities || []).map(c => c.cityId);

				const regionMatch = selectedRegionIds.length > 0 && categoryRegionIds.some(r => selectedRegionIds.includes(r));
				const cityMatch = selectedCityIds.length > 0 && categoryCityIds.some(c => selectedCityIds.includes(c));

				return regionMatch || cityMatch;
			});
		}

		// Apply date filter if exists
		if (filter.dateFrom && filter.dateTo) {

			const parseDate = (dateStr: string): Date | null => {
				if (!dateStr) return null;
				const parts = dateStr.split('.');
				if (parts.length === 3) {
					const day = parseInt(parts[0]);
					const month = parseInt(parts[1]) - 1;
					const year = parseInt(parts[2]);
					return new Date(year, month, day);
				}
				return null;
			};

			const fromDateObj = parseDate(filter.dateFrom);
			const toDateObj = parseDate(filter.dateTo);

			if (fromDateObj && toDateObj) {
				// Set toDate to end of day so single-day ranges include the entire day
				const toDateEnd = new Date(toDateObj);
				toDateEnd.setHours(23, 59, 59, 999);

				const fromTime = fromDateObj.getTime();
				const toTime = toDateEnd.getTime();

				filtered = filtered.filter(category => {

					if (!category.dateRanges || category.dateRanges.length === 0) {
						return false;
					}

					return category.dateRanges.some((dr: any) => {
						if (!dr.startDate || !dr.endDate) {
							return false;
						}

						const rangeStart = new Date(dr.startDate).getTime();
						const rangeEnd = new Date(dr.endDate).getTime();

						if (isNaN(rangeStart) || isNaN(rangeEnd)) {
							return false;
						}

						return rangeStart <= toTime && rangeEnd >= fromTime;
					});
				});
			}
		}


		setFilteredCategories(filtered);

	}, [originalCategories]);
	return (
		<React.Fragment>
			<div className="category-lobby-main-container">
				<div className="category-lobby-advertising-container">
					{renderBreadCrumbs(categoryVar)}
					<CustomAdvertising history={history} />
				</div>
				{categoryId && categoryVar.parentId == '0' && <div className='header-lobby-container' style={{ backgroundImage: `url(${configurationStore.getConfiguration.picsUrl}/share/${imageBackroundURL})` }}>
					<div>{categoryVar.categoryName}</div>
				</div>}
				<div className="category-lobby-filter">
					{categoryVar && (
						<>
							<CategoryLobbyFilter
								match={match}
								history={history}
								innerCategoryFilterFirstOption={categoryVar.categoryName}
							/>
							{(() => {
								// Check if filter is enabled for this category level (determined by server)
								// The server returns isFilterEnabled for the current category level
								// Even if all subCategories have isFilterEnabled: false, if the current category
								// has isFilterEnabled: true, we should show the filter button
								const isFilterEnabled = categoryVar.isFilterEnabled === true;

								return isFilterEnabled ? (
									<CategoryFilterButton
										onClick={() => setShowFilterPopup(true)}
										hasActiveFilters={hasActiveFilters()}
										resultsCount={hasActiveFilters() && filteredCategories.length === 0 ? 0 : displayCategories.length}
									/>
								) : null;
							})()}
						</>
					)}
				</div>
				{showFilterPopup && categoryVar && (
					<CategoryFilterPopup
						onClose={() => setShowFilterPopup(false)}
						onApply={handleFilterApply}
						category={categoryVar}
						savedFilter={savedFilter}
						originalCategories={originalCategories}
					/>
				)}
				<CategoriesPage history={history} categories={displayCategories} />
				<div className="categories-container-button">
					{flag && (
						<CustomButton
							text={Lang.format('ReloadMore')}
							buttonClassName="primary-design center largeWidth"
							onClick={() => {
								categoryStore.page += 1;
							}}
						/>
					)}
				</div>
			</div>
		</React.Fragment>
	);
}
export default observer(CategoriesContainer)
