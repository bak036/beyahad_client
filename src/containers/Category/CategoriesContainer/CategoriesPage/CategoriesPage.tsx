import {observer} from 'mobx-react';
import {CustomHeader, HeaderType, CustomSpan} from 'nofshonit-base-web-client';
import * as React from 'react';
import Commercial from '../../../../components/BeyhadComponents/CustomService/Advertisement/Commercial';
import CustomEmptyState from '../../../../components/CustomComponents/CustomEmptyState/CustomEmptyState';
import {CustomMediaQuery} from '../../../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import {RoutesPath} from '../../../../consts/RoutesPath';
import {CATEGORY_STORE, ADVERTING_STORE,AUTH_STORE, CONFIGURATION_STORE} from '../../../../consts/stores';
import Category from '../../../../models/Category';
import rootStores from '../../../../stores';
import CategoryStore from '../../../../stores/CategoryStore';
import CategoryUtils from '../../../../utils/categoryUtils';
import AdvertisingStore from '../../../../stores/AdvertisingStore';
import {get} from 'lodash';
import Lang from '../../../../config/Language';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import * as _ from 'lodash';
import TextCustomItemComponent from '../../../../components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import CustomButtonBeyahad from '../../../../components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import AuthStore from '../../../../stores/AuthStore';
import { CategoryType } from 'src/models/enums';
import { useEffect } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface Props {
	location?: any;
	categories?: Category[];
	history?: any;
}
interface IState {}

const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const advertsingStore: AdvertisingStore = rootStores[ADVERTING_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore:ConfigurationStore=rootStores[CONFIGURATION_STORE];

const CategoriesPage : React.FC<Props> = ({
	location,
	categories,
	history
}) => {

	useEffect(() => {
		advertsingStore.getCommercial();
	},[])

	const renderAllCategoriesContainerForDesktop = (categories?: Category[]) => {
		let table: any[] = [];
		if (categories) {
			var categoryLength;
			if (categories.length > categoryStore.page * 100) {
				categoryLength = categoryStore.page * 100;
			} else {
				categoryLength = categories.length;
			}
			for (var i = 0; i < categoryLength; i += 8) {
				table.push(
					<React.Fragment key={i}>
						<div className='categories-container-items-line1'>{renderCategoriesLine(i, i + 4, categories)}</div>
						<div className='categories-container-items-line2'>
							{renderCategoriesLine(i + 4, i + 8, categories)}
						</div>
						<Commercial index={i / 8} />
					</React.Fragment>
				);
			}
			return table;
		} else {
			return <CustomEmptyState />;
		}
	};

	const renderAllCategoriesContainerforMobile = (categories?: Category[]) => {
		let table: any[] = [];
		if (categories) {
			var categoryLength;
			if (categories.length > categoryStore.page * 100) {
				categoryLength = categoryStore.page * 100;
			} else {
				categoryLength = categories.length;
			}
			for (var i = 0; i < categoryLength; i += 4) {
				table.push(
					<React.Fragment key={i}>
						<div className='categories-container-items-line1'>{renderCategoriesLine(i, i + 2, categories)}</div>
						<div className='categories-container-items-line2'>
							{renderCategoriesLine(i + 2, i + 4, categories)}
						</div>
						<Commercial index={i / 4} />
					</React.Fragment>
				);
			}
			return table;
		} else {
			return <CustomEmptyState />;
		}
	};

	const renderCategoriesLine = (start: number, end: number, categories?: Category[]) => {
		var array: Category[] = [];
		if (categories) {
			for (var i = start; i < end; i++) {
				if (categories[i]) {
					categories[i].index = i + 1;
					array.push(categories[i]);
				}
			}
		}
		return <>{renderCategories(array)}</>;
	};
	const renderCategories = (categories: Category[]) => {
		if (categories && categories.length > 0) {
			return categories.map((c: Category, index: number) => {
				const category: Category | any = categoryStore.category ? categoryStore.category : {};
				const rootCategory = category.breadcrumbs && category.breadcrumbs[0] ? category.breadcrumbs[0].name : '';
				const categoryName = _.get(c, 'categoryName', '');
				const businessName = c &&  c.business && c.business.name ? c.business.name : '';
				const alt = _.get(c, 'images[0].alt', categoryName);
				const addressAlt = _.get(c, 'business.address', '');
				const showTitle = 
				c &&
				c.categoryType && 
				c.categoryType != CategoryType.Shows &&
				c.categoryType != CategoryType.Consumerism && 
				c.categoryType != CategoryType.ConsumerismCoupons &&
				Number(c.categoryType) < 99 &&
				c.categorySubTitle;
				return (
					<div
						key={index}
						className='categories-container-item'
						onClick={() => { 
							authStore.productJsonForGA = 'קטגוריות - ' + rootCategory;
							authStore.productIndexForGA = c.index ? c.index.toString() : '0'
							GoogleAnalyticsUtils.sendProductToAnalytics(categories, c,'select_item',authStore.productJsonForGA,authStore.productIndexForGA);
							CategoryUtils.renderPage(
								c.categoryId,
								authStore.canActivateAction,
								c,
								history
							);
						}}>
						{c.images && c.images[0] && (
							<div className="categories-container-item-img-con">
								<img
									className='categories-container-item-img'
									alt={alt}
									title={alt}
									src={`${configurationStore.getConfiguration.picsUrl}/share/${c.images[0].file}`}
								/>
							</div>
						)}
						{c.images.length === 0 && (
							<div className="categories-container-item-img-con">
								<img
									className='categories-container-item-img'
									src={require('../../../../assets/generalimage.jpg')}
									alt={alt}
								/>
							</div>
						)}
						<CustomMediaQuery.Desktop>
						  <div className="categories-container-content-container">
						  <div className='categories-container-content-container-txt'>
							<div className='categories-container-item-header'>
								<CustomHeader
									text={showTitle? businessName : c.categoryName}
									headerClassName='bold'
									type={HeaderType.SubTitle}
								/>
								{showTitle && 
								<div className='title-item-container'>
									<TextCustomItemComponent 
										text = {c.categorySubTitle}
										spanClassName={'smallTxt'}
									/>
								</div>
							}	
							</div>
							<div className='categories-container-item-price'>
								{c.description && 
									<TextCustomItemComponent 
									text = {c.description ? c.description : ''}
									icon= {{src:require('../../../../assets/icons/price_tag.svg'), name: 'price tag'}}
									customClass = {'block'}
									/>
								}
							</div>
							<div className='categories-container-item-location'>
								{!c.isConsumption && c.business && c.business.address && (
									<>
										{get(c, 'business.sumSubBranch') <= 1 ? (
										<TextCustomItemComponent
											text = {c.business.address} 
											icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
											spanClassName='smallTxt'
										/>) : (
											<TextCustomItemComponent
											text = {Lang.format('VarietyOfBranches')} 
											icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
											spanClassName='smallTxt'
										/>)}
									</>
								)}
							</div>
							</div>
							<CustomButtonBeyahad
								customClass = {''}
								onClick={() => { }}
								isCurserPointer={true}
								buttonText = {Lang.format('ForDetailsAndPurchase')}
							/>
						  </div>
						</CustomMediaQuery.Desktop>

						<CustomMediaQuery.Mobile>
						<div className="categories-container-content-container">
							<div className='categories-container-content-container-txt'>
							<div className='categories-container-item-header'>
								<CustomHeader
									text={c.categoryName}
									headerClassName='bold smallTxt'
									type={HeaderType.SubTitle}
								/>
								{showTitle && 
								<div className='title-item-container'>
									<TextCustomItemComponent 
										text = {c.categorySubTitle}
										spanClassName={'smallTxt'}
									/>
								</div>
							}
							</div>
							<div className='categories-container-item-price'>
								{c.description && 
									<TextCustomItemComponent 
									text = {c.description ? c.description : ''}
									icon= {{src:require('../../../../assets/icons/price_tag.svg'), name: 'price tag'}}
									customClass = {'block'}
									spanClassName='smallTxt'
									/>
								}
							</div>
							<div className='categories-container-item-location'>
								{!c.isConsumption && c.business && c.business.address && (
									<>
										{get(c, 'business.sumSubBranch') <= 1 ? (
										<TextCustomItemComponent
											text = {c.business.address} 
											icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
											spanClassName='smallTxt'
										/>) : (
											<TextCustomItemComponent
											text = {Lang.format('VarietyOfBranches')} 
											icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
											spanClassName='smallTxt'
										/>)}
									</>
								)}
							</div>
							</div>
							<CustomButtonBeyahad
								customClass = {''}
								onClick={() => { }}
								isCurserPointer={true}
								buttonText = {Lang.format('ForDetailsAndPurchase')}
								
							/>
						  </div>
						</CustomMediaQuery.Mobile>
					</div>
				);
			});
		} else {
			return null;
		}
	};
	
	return (
		<div className='categories-container-main-container'>
			<CustomMediaQuery.Desktop>
				{renderAllCategoriesContainerForDesktop(categories)}
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				{renderAllCategoriesContainerforMobile(categories)}
			</CustomMediaQuery.Mobile>
		</div>
	);
}
export default observer(CategoriesPage)
