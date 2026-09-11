import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { CustomSelector, CustomHeader, Logger, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { CATEGORY_STORE, PROFILE_CARD_STORE, VIEW_STORE } from '../../../../consts/stores';
import Category from '../../../../models/Category';
import rootStores from '../../../../stores';
import CategoryStore from '../../../../stores/CategoryStore';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import ViewStore from '../../../../stores/ViewStore';
import CategoryUtils from '../../../../utils/categoryUtils';
import Lang from '../../../../config/Language';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useRef, useState } from 'react';

const options = [
	{
		id: 1,
		name: 'מהמחיר הגבוה לנמוך'
	},
	{
		id: 2,
		name: 'מהמחיר הנמוך לגבוה'
	}
];

const profileStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

interface Props {
	innerCategoryFilterFirstOption?: string;
	match?: any;
	history?: any;
}
interface IState {
	areaFilter: string;
	priceFilter: string;
	innerCategoryFilter: string;
}

const CategoryLobbyFilter : React.FC<Props> = ({
	innerCategoryFilterFirstOption,
	match,
	history
}) => {
	const [areaFilter, setAreaFilter] = useState<string>('');
	const [priceFilter, setPriceFilter] = useState<string>('');
	const [innerCategoryFilter, setInnerCategoryFilter] = useState<string>('');
	const mounted = useRef(false);

	useEffect(() => {
		if(!mounted.current){
			mounted.current = true;
			const prId = match.params.categoryId;
			categoryStore.getCategoryById(prId);
			const category: Category | any = categoryStore.category ? toJS(categoryStore.category) : {};
			if(category.subCategories)
				GoogleAnalyticsUtils.sendAnalyticsResultProducts(category.subCategories,'קטגוריות - ' + category.categoryName);
			}
			else {
				if (categoryStore.category.categoryId && categoryStore.category.categoryId != match.params.categoryId)
					categoryStore.getCategoryById(match.params.categoryId);
			}
	},[])

	const setAreaFilterFunc = (info) => { };
	const setPriceFilterFunc = (info) => { };

	const renderInnerCategory = async (id: number) => {
		try {
			viewStore.setLoadingView(true);
			await categoryStore.getCategoryById(id.toString());
			viewStore.setLoadingView(false);
			const category: Category | any = categoryStore.category ? toJS(categoryStore.category) : {};
			if (category) {
				CategoryUtils.renderSubCategory(category, history, true);
				// if (category.isAllGrandchildren === false) {
				// 	this.history.push(`${RoutesPath.category.rootLobby}/${category.categoryId}`);
				// } else {
				// 	this.history.push(`${RoutesPath.category.rootProducts}/${category.categoryId}`);
				// }
			}
		} catch (err) {
			Logger.debug(err);
		}
	};

	const setInnerCategoryFilterFunc = (info) => {
		setInnerCategoryFilter(info.name)
		renderInnerCategory(info.id);
	};

	const regions = profileStore.getRegions ? profileStore.getRegions : [];
	const category: Category | any = categoryStore.category ? toJS(categoryStore.category) : {};
	const rootCategory = category.breadcrumbs && category.breadcrumbs[0] ? category.breadcrumbs[0].name : '';
	
	return (
		<div className="category-lobby-filter-main-container">
			{(category.sameLevelCategories) && (
				<>
					<CustomHeader
						text={`${Lang.format('MoreInRootCategory')}${rootCategory}`}
						headerClassName='bold smallTxt'
						type={HeaderType.SubTitle}
					/>

					<CustomSelector
						containerClassName={'category-lobby-filter-category'}
						placeholder={innerCategoryFilterFirstOption}
						options={category.sameLevelCategories}
						value={innerCategoryFilter}
						keyAttribute={'id'}
						valueAttribute={'name'}
						onSelected={setInnerCategoryFilterFunc}
					/>
				</>
			)}
			{/* <CustomSelector
				containerClassName={'category-lobby-filter-area'}
				placeholder={'כל האזורים'}
				options={regions}
				value={advertisingStore.areaFilter}
				keyAttribute={'regionId'}
				valueAttribute={'regionName'}
				onSelected={this.setAreaFilter}
			/>
			<CustomSelector
				containerClassName={'category-lobby-filter-any'}
				placeholder={'מיין לפי'}
				options={options}
				keyAttribute={'id'}
				valueAttribute={'name'}
				value={advertisingStore.priceFilter}
				onSelected={this.setPriceFilter}
			/> */}
		</div>
	);
}
export default observer(CategoryLobbyFilter)

