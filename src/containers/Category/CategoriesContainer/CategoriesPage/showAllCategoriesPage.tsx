import { observer } from 'mobx-react';
import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';
import BreadCrumbs, { Crumbs } from '../../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { HOMEPAGE_STORE } from '../../../../consts/stores';
import Category from '../../../../models/Category';
import Tag from '../../../../models/Tag';
import rootStores from '../../../../stores';
import HomePageStore from '../../../../stores/HomePageStore';
import CategoriesPage from './CategoriesPage';
import CustomAdvertising from '../../../../components/CustomComponents/CustomAdvertising';
import { useEffect, useState, useRef } from 'react';
import CategoryFilterPopup, { CategoryFilter } from '../../../../components/CustomComponents/CategoryFilterPopup/CategoryFilterPopup';
import CategoryFilterButton from '../../../../components/CustomComponents/CategoryFilterButton/CategoryFilterButton';
import { toJS } from 'mobx';

interface Props {
	location: any;
	history?: any;
	category?: Category;
	match?: any;
}
interface IState { }

const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];

const showAllCategoriesPage: React.FC<Props> = ({
	location,
	history,
	category,
	match
}) => {

	const mounted = useRef(false);
	const prevTagId = useRef<string>('');
	const [showFilterPopup, setShowFilterPopup] = useState(false);
	const [savedFilter, setSavedFilter] = useState<CategoryFilter | undefined>(undefined);
	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

	const renderBreadCrumbs = (tag: Tag) => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs('דף הבית', RoutesPath.root));

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		if (tag) {
			crumbsRoute.push(new Crumbs(tag.tagName, `${RoutesPath.category.rootShowAllCategories}/${tag.tagId}`));
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	useEffect(() => {
		const tagId = match.params.tagid;
		if (!mounted.current) {
			mounted.current = true;
			prevTagId.current = tagId;
			homePageStore.GetCategorysByTagID(tagId).then(() => {
				// Reset filters when tag loads
				setSavedFilter(undefined);
				setFilteredCategories([]);
			});
		} else {
			// If tagId changed, reload
			if (prevTagId.current !== tagId) {
				prevTagId.current = tagId;
				homePageStore.GetCategorysByTagID(tagId).then(() => {
					setSavedFilter(undefined);
					setFilteredCategories([]);
				});
			}
		}
	}, [match.params.tagid]);


	const tag: Tag = homePageStore.getTag;
	let categories: Category[] | any = [];
	if (tag) {
		for (let i = 0; i < tag.tagCategoryInfo.length; i++) {
			if (tag.tagCategoryInfo) {
				const subCats = tag.tagCategoryInfo[i].categories;
				if (Array.isArray(subCats)) {
					categories.push(...subCats);
				} else if (subCats) {
					categories.push(subCats);
				}
			}
		}
	}

	const originalCategories = categories || [];
	const displayCategories = savedFilter ? filteredCategories : originalCategories;

	// Get filter parameters from Tag itself (from server)
	// The server returns isFilterEnabled and filterParameters directly on the Tag object
	const tagVar: Tag | any = tag ? toJS(tag) : {};
	const isFilterEnabled = tagVar.isFilterEnabled === true;

	// Parse filterParameters from Tag
	const parseFilterParameters = (filterParams: any): number[] => {
		if (!filterParams) return [];
		if (Array.isArray(filterParams)) {
			return filterParams.map(p => typeof p === 'string' ? parseInt(p) : p).filter(p => !isNaN(p));
		}
		if (filterParams instanceof Set) {
			return Array.from(filterParams).map(p => typeof p === 'string' ? parseInt(p) : p).filter(p => !isNaN(p));
		}
		if (typeof filterParams === 'string') {
			return filterParams
				.split(',')
				.map(p => p.trim())
				.map(p => parseInt(p))
				.filter(p => !isNaN(p));
		}
		return [];
	};
	const filterParameters = parseFilterParameters(tagVar.filterParameters);

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

	const handleFilterApply = (filter: CategoryFilter) => {
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
	};

	// Create a virtual category object for the filter popup
	// This represents the "parent" category for filter parameters
	// isFilterEnabled and filterParameters come from Tag itself (from server)
	// The actual data (prices, cityIds, regionIds, dateRanges) will be collected from categories (subCategories)
	const tagCategoryForFilter: Category | any = {
		categoryId: tagVar.tagId || 0,
		categoryName: tagVar.tagName || '',
		isFilterEnabled: isFilterEnabled,
		filterParameters: filterParameters,
		subCategories: originalCategories
	};

	return (
		<div className="show-all-categories-container-page">
			<div className="category-lobby-main-container">
				<div className="category-lobby-advertising-container">
					<CustomAdvertising history={history} />
					{tag && renderBreadCrumbs(tag)}
				</div>
				<div className="category-lobby-filter">
					{tag && isFilterEnabled && (
						<CategoryFilterButton
							onClick={() => setShowFilterPopup(true)}
							hasActiveFilters={hasActiveFilters()}
							resultsCount={displayCategories.length}
						/>
					)}
				</div>
				{showFilterPopup && tagCategoryForFilter && (
					<CategoryFilterPopup
						onClose={() => setShowFilterPopup(false)}
						onApply={handleFilterApply}
						category={tagCategoryForFilter}
						savedFilter={savedFilter}
						originalCategories={originalCategories}
					/>
				)}
			</div>
			{categories && <CategoriesPage history={history} categories={displayCategories} />}
		</div>
	);
}
export default observer(showAllCategoriesPage)

