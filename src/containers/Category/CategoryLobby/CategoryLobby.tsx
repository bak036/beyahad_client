import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { CustomHeader, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../consts/RoutesPath';
import { CATEGORY_STORE, CONFIGURATION_STORE, VIEW_STORE } from '../../../consts/stores';
import Category from '../../../models/Category';
import rootStores from '../../../stores';
import CategoryStore from '../../../stores/CategoryStore';
import { Carousel } from 'react-responsive-carousel';
import BreadCrumbs, { Crumbs } from '../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CategoryLobbyFilter from './CategoryLobbyFilter/CategoryLobbyFilter';
import CustomAdvertising from '../../../components/CustomComponents/CustomAdvertising';
import ViewStore from '../../../stores/ViewStore';
import CustomEmptyState from '../../../components/CustomComponents/CustomEmptyState/CustomEmptyState';
import { CategoryType } from '../../../models/enums';
import AlertUtils from '../../../utils/AlertUtils';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import CategoryUtils from '../../../utils/categoryUtils';
import * as _ from 'lodash';
import { url } from 'inspector';
import { useEffect, useRef } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface Props {
	history?: any;
	location: any;
	match?: any;
}
interface IState { }

const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const CategoryLobby : React.FC<Props> = ({
	history,
	location,
	match
}) => {
	const mounted = useRef(false);
	const ref = useRef('');
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
					crumbsRoute.push(
						new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
					);
				}
			}
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	useEffect(() => {
		if(!mounted.current){
			mounted.current = true;
			const prId = match.params.categoryId;
			categoryStore.category = new Category();
			viewStore.setLoadingView(true);
			categoryStore.getCategoryById(prId).then(() => {
				viewStore.setLoadingView(false);
				// GoogleAnalyticsUtils.listOfProducts(categoryStore.category.subCategories);
			});
		} else {
			const prId = match.params.categoryId;
			if (ref.current != prId) {
				ref.current = prId;
				categoryStore.category = new Category();
				viewStore.setLoadingView(true);
				categoryStore.getCategoryById(prId).then(() => {
					viewStore.setLoadingView(false);
					// GoogleAnalyticsUtils.listOfProducts(categoryStore.category.subCategories);
				});
			}
		}
	})

	const onSubCategoryClicked = (category: Category) => {
		GoogleAnalyticsUtils.clickOnProduct(categoryStore.category, category);
		categoryStore.category = undefined;
		viewStore.setLoadingView(true);
		categoryStore.getCategoryById(category.categoryId).then((res) => {
			CategoryUtils.renderSubCategory(categoryStore.category, history, true);
		})
	};

	const renderAllCategoriesForLobby = (categories?: Category[]) => {
		if (categories && categories.length > 0) {
			return categories.map((c: Category, index: number) => {
				const categoryName = _.get(c, 'categoryName', '');
				const alt = _.get(c, 'images[0].alt', categoryName);
				return (
					<div key={index} className='category-lobby-item' onClick={() => onSubCategoryClicked(c)}>
						{c.images && c.images[0] && (
							<img
								className='category-lobby-item-img'
								src={`${configurationStore.getConfiguration.picsUrl}/share/${c.images[0].file}`}
								alt={alt}
								title={alt}
							/>
						)}
						{c.images.length === 0 && (
							<img src={require('../../../assets/generalimage.jpg')} className='category-lobby-item-img' alt={alt} />
						)}
						<CustomSpan classNameSpan='category-lobby-item-text' text={c.categoryName} />
					</div>
				);
			});
		} else {
			categoryStore.getCategoryById(match.params.categoryId)
			return <CustomEmptyState />;
		}
	};

	const category: Category | any = categoryStore.category ? toJS(categoryStore.category) : {};
	console.log(category)
	const categoryName = category.breadcrumbs && category.breadcrumbs.length > 0 ? category.breadcrumbs[0].name : '';
	const categoryId = category.breadcrumbs && category.breadcrumbs.length > 0 ? category.breadcrumbs[0].id : '';

	let imageBackroundURL = '';
	let titleForImage = '';
	
	if(category.images && category.images.length > 0){
	const imageBackround = category.images.filter(i => i.imageTypeId == 17);
	if(imageBackround && imageBackround.length > 0){
		console.log(imageBackround[0]);
		titleForImage = imageBackround[0].alt;
		imageBackroundURL = imageBackround[0].file;
	}
	}
	return (
		<div className='category-lobby-main-container'>
			{/* <div className="category-lobby-header">
				<CustomHeader text={category.name} type={HeaderType.Title} />
			</div> */}
			<div className='category-lobby-advertising-container'>
				<CustomAdvertising history={history} />
				{renderBreadCrumbs(category)}
			</div>
			{/* '../../../assets/sidebar-'+ path + '.png' */}
			{category.parentId == '0' && categoryId && <div title={titleForImage} className='header-lobby-container' style={{ backgroundImage: `url(${configurationStore.getConfiguration.picsUrl}/share/${imageBackroundURL})` }}>
				<div>{categoryName}</div>
			</div>}
			<div className='all-categories-for-loby-container'>
				{category && category.subCategories && renderAllCategoriesForLobby(category.subCategories)}
			</div>
		</div>
	);
}
export default observer(CategoryLobby)
