import { observer } from 'mobx-react';
import { CustomHeader, Logger } from 'nofshonit-base-web-client';
import * as React from 'react';
import TagsAdvertisment from '../../components/BeyhadComponents/CustomService/Advertisement/TagsAdvertisment/TagsAdvertisment';
import EditorMessage from '../../components/BeyhadComponents/EditorMessage/EditorMessage';
import ImageProductPage from '../../components/BeyhadComponents/ProductPage/ImageProductPage/ImageProductPage';
import ProductPageHeader from '../../components/BeyhadComponents/ProductPage/ProductPageHeader/ProductPageHeader';
import ProductPageInfoTab from '../../components/BeyhadComponents/ProductPage/ProductPageTabs/ProductPageInfoTab';
import ProductPageTabs from '../../components/BeyhadComponents/ProductPage/ProductPageTabs/ProductPageTabs';
import TabsHorizontalComponent from 'src/components/CustomComponents/TabsHorizontalComponent/TabsHorizontalComponent';
import BreadCrumbs, { Crumbs } from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomEmptyState from '../../components/CustomComponents/CustomEmptyState/CustomEmptyState';
import { CustomMediaQuery } from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import Lang from '../../config/Language';
import { RoutesPath } from '../../consts/RoutesPath';
import { AUTH_STORE, CATEGORY_STORE, CONFIGURATION_STORE, HOMEPAGE_STORE, VIEW_STORE } from '../../consts/stores';
import Category from '../../models/Category';
import Varient from '../../models/Varient';
import rootStores from '../../stores';
import CategoryStore from '../../stores/CategoryStore';
import HomePageStore from '../../stores/HomePageStore';
import ViewStore from '../../stores/ViewStore';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import ErrorUtils, { ErrorDescription, ErrorHTML } from '../../utils/errorHandling/ErrorUtils';
import NofhonitStorage from '../../utils/NofhonitStorage';
import * as _ from 'lodash';
import CustomProductImageCarousel from '../../components/CustomComponents/CustomProductImageCarousel/CustomProductImageCarousel';
import AuthStore from 'src/stores/AuthStore';
import { useEffect, useRef, useState } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

const starIcon = require('../../assets/Star.png');
const questionMarkIcon = require('../../assets/quastionmark.png');
const termsIcon = require('../../assets/Vector-terms.png');
const defaultImage = require('../../assets/generalimage.jpg');

interface Props {
	match?: any; z
	location?: any;
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	foundCategory?: boolean;
	productPageErr?: string;
}

const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const ProductPage: React.FC<Props> = ({
	match,
	location,
	history,
	isMint,
	accessToken
}) => {

	const [foundCategory, setFoundCategory] = useState<boolean>(false);
	const [productPageErr, setProductPageErr] = useState<string>('');
	let mounted = useRef(false);
	let prevCategory = useRef('');

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			window.scrollTo(0, 0);
			const prId = match.params.categoryId;
			categoryStore.productPageCategory = new Category();
			viewStore.setLoadingView(true);

			const select_promotion = localStorage.getItem('select_promotion');
			if (select_promotion) {
				authStore.creativeNameForGA = 'banner',
					authStore.promotionNameForGA = 'HomePageBanner'
				localStorage.removeItem('select_promotion');
			}
			categoryStore
				.getCategoryProductsByID(prId)
				.then((category: Category) => {
					if (categoryStore.productPageCategory.isEvents) {
						if (isMint) {
							history.push(
								`${RoutesPath.mint.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
							);
						} else {
							history.replace(
								`${RoutesPath.category.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
							);
						}
					}
					if (category) {
						setFoundCategory(true)
					}
					GoogleAnalyticsUtils.sendProductToAnalytics(null, category, 'view_item', authStore.productJsonForGA, authStore.productIndexForGA, authStore.creativeNameForGA
						, authStore.promotionNameForGA);
					// if (!this.props.isMint) homePageStore.getTopTags(1);
				})
				.catch((err) => {
					Logger.error('new error for product page is', err);

					// Check if there is an error from the server
					// This is a patch from 11.08.19
					if (ErrorUtils.isStringError(err)) {
						const errorDescription = err as ErrorDescription;
						setProductPageErr(errorDescription.message)
					} else if (ErrorUtils.isHTMLError(err)) {
						const errorHtml = err as ErrorHTML;
						setProductPageErr(errorHtml.message)
					}
				})
				.finally(() => {
					viewStore.setLoadingView(false);
				});
		} else {
			const prId = match.params.categoryId;
			NofhonitStorage.saveCategoryIdSession(prId);
			if (prevCategory.current != prId) {
				categoryStore.productPageCategory = new Category();
				viewStore.setLoadingView(true);
				categoryStore
					.getCategoryProductsByID(prId)
					.then(() => {
						if (categoryStore.productPageCategory.isEvents) {
							if (isMint) {
								history.push(
									`${RoutesPath.mint.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
								);
							} else {
								history.push(
									`${RoutesPath.category.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
								);
							}
						}
					})
					.finally(() => {
						viewStore.setLoadingView(false);
					});
			}
			prevCategory.current = prId;
		}
		return () => {
			authStore.creativeNameForGA = undefined,
				authStore.promotionNameForGA = undefined
		}
	})

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
					if (product.breadcrumbs.length > 2) {
						if (i === product.breadcrumbs.length - 2) {
							crumbsRoute.push(
								new Crumbs(
									product.breadcrumbs[i].name,
									`${RoutesPath.category.rootProducts}/${product.breadcrumbs[i].id}`
								)
							);
						} else if (i === product.breadcrumbs.length - 1) {
							crumbsRoute.push(
								new Crumbs(
									product.breadcrumbs[i].name,
									`${RoutesPath.category.rootProductPage}/${product.breadcrumbs[i].id}`
								)
							);
						} else {
							crumbsRoute.push(
								new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
							);
						}
					} else {
						crumbsRoute.push(
							new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
						);
					}
				}
			}
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	const renderProductPageMobileTabs = (termsOfUseData, howToUseData, moreInfoTabData, product: Category) => {
		/* 
		TODO: fix location according to new dev
		*/
		const usefulInformationTab = (
			<ProductPageTabs
				ComponentName={Lang.format('Useful_Information')}
				ComponentImg={termsIcon}
				ComponentDataArray={termsOfUseData}
				isHtml={true}
			/>
		);
		const howToUseTab = (
			<ProductPageTabs
				ComponentName={Lang.format('How_to_Use')}
				ComponentImg={starIcon}
				ComponentData={howToUseData}
				isHtml={true}
			/>
		);
		const moreInfoTab = (
			<ProductPageTabs
				ComponentName={Lang.format('More_Info')}
				ComponentImg={questionMarkIcon}
				ComponentData={moreInfoTabData}
				isHtml={true}
			/>
		);

		if (product.isConsumption) {
			return (
				<>
					{moreInfoTab}
					{usefulInformationTab}
					{howToUseTab}
				</>
			);
		} else {
			return (
				<>
					{usefulInformationTab}
					{howToUseTab}
					{moreInfoTab}
				</>
			);
		}
	};

	const sendGoogleAnalytics = (title: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics('product_page', 'product_page', 'click', title)
	}

	const renderProductPage = () => {
		const product = categoryStore.getProductPageCategory;
		if (product && product.categoryId) {
			const images = product.images ? product.images : [];
			const howToUse = product.redimType ? product.redimType : '';
			const categoryName = _.get(product, 'categoryName', '');

			const termsOfUse: string[] = [
				product.termsOfUse ? product.termsOfUse : '',
				product.remarks ? product.remarks : '',
				product.campaignDetails ? product.campaignDetails : '',
				product.minimumInventoryForSale ? `<p style="margin-top:10px;font-family:Arial;font-size:16px;color:#808080";><span> ${product.minimumInventoryForSale}</span></p>` : '',
			];
			const moreInfoTab = product.categoryHTML ? product.categoryHTML : '';
			// Because we had to do a patch, this code isn't that great...
			let componentsToRender;
			if (product.isConsumption) {
				componentsToRender = [
					{ title: product.categoryType != 20 ? Lang.format('Location_Info_Distributor') : Lang.format('Location_Info'), content: <ProductPageInfoTab catergory={product} /> },
					{ isHtml: true, title: Lang.format('More_Info'), content: moreInfoTab },
					{ isHtml: true, title: Lang.format('Useful_Information'), content: termsOfUse },
					{ isHtml: true, title: Lang.format('How_to_Use'), content: howToUse },
				];
		} else {
			componentsToRender = [
				{ title: Lang.format('Location_Info'), content: <ProductPageInfoTab catergory={product} /> },
				{ isHtml: true, icon: questionMarkIcon, title: Lang.format('More_Info'), content: moreInfoTab },
				{ isHtml: true, icon: termsIcon, title: Lang.format('Useful_Information'), content: termsOfUse },
				{ isHtml: true, icon: starIcon, title: Lang.format('How_to_Use'), content: howToUse },
			];
		}
		let isCategoryType20 = product.isConsumption && product.categoryType != 20;

		return (
			<div className='product-page-main-container'>
 					<div className='breadcrumbs'>{!isMint ? renderBreadCrumbs(product) : null}</div>
  
				{/* // ! DO NOT CHANGE THE HEIGHT OF THE IFRAME - this height is for "Har Bituach" as the customer asked for */}
				{product.categoryType === 100 && (
					<iframe width='100%' height='1383.26px' src={product.categoryUrl} scrolling='yes' />
				)}
				{product.categoryType != 100 && (
					<CustomMediaQuery.Mobile>
						<div className='product-page-image-header-info-tab'>
							<div className='product-page-top-image'>
								{images.length > 0 ? (
									<ImageProductPage imgArr={images} />
								) : (
									<img src={defaultImage} style={{ width: '100%' }} alt={categoryName} />
								)}
							</div>

							<div className='product-page-varient'>
								<ProductPageHeader
									history={history}
									category={product}
									isMint={isMint}
									accessToken={accessToken}
								/>
							</div>
						</div>
						<div className='product-page-info-tab' onClick={() => sendGoogleAnalytics(product.isConsumption ? Lang.format('Location_Info_Distributor') : Lang.format('Location_Info'))}>
							<ProductPageInfoTab isMobile={true} catergory={product} triggerText={isCategoryType20  ? Lang.format('Location_Info_Distributor') : Lang.format('Location_Info')} />
						</div>
						<div className='product-page-tabs'>
							{renderProductPageMobileTabs(termsOfUse, howToUse, moreInfoTab,product)}
						</div>
					</CustomMediaQuery.Mobile>
				)}
					{product.categoryType != 100 && (
						<CustomMediaQuery.Desktop>
							<div className='product-page-image-header-info-tab'>
								<div className='product-page-varient'>
									<ProductPageHeader
										history={history}
										category={product}
										isMint={isMint}
										accessToken={accessToken}
									/>
								</div>
								<div className='product-page-image-info-tab'>
									<div className='product-page-top-image'>
										{images.length > 0 ? (
											<ImageProductPage imgArr={images} />
										) : (
											<img src={defaultImage} style={{ width: '100%' }} alt={categoryName} />
										)}
										{/* <ImageProductPage imgArr={images} /> */}
									</div>
									{images.length > 0 && (
										<div className='product-page-info-tabs-component-data'>
											<div className='product-page-info-tabs-images-container'>
												<CustomProductImageCarousel>
													{renderAllImges(images)}
												</CustomProductImageCarousel>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className='product-page-tab-desktop'>
								<TabsHorizontalComponent tabComponents={componentsToRender} />
							</div>
						</CustomMediaQuery.Desktop>
					)}
					{!isMint ? (
						<div>
							<TagsAdvertisment tags={1} history={history} isHomePage={false} />
						</div>
					) : null}
				</div>
			);
		} else {
			return <CustomEmptyState text={Lang.format('BenefitNotFound')} />;
		}
	};

	const renderAllImges = (imgArr) => {
		return imgArr.map((img, index) => (
			<div key={index} className='product-page-info-tabs-images' onClick={() => (categoryStore.caruselImg = index)}>
				<img
					className='product-page-info-tabs-img'
					title={`${img.alt}`}
					alt={`${img.alt}`}
					src={`${configurationStore.getConfiguration.picsUrl}/share/${img.file}`}
				/>
			</div>
		));
	};

	if (!isMint) {
		// Beyahad Website
		if (productPageErr) {
			return <EditorMessage textClassName='product-page-only-for-members' doNotCheckLink={false} message={productPageErr} />;
		} else {
			return renderProductPage();
		}
	} else {
		// Mint Website
		if (foundCategory) {
			return renderProductPage();
		} else {
			return (
				<React.Fragment>
					{!viewStore.loadingView ? (
						<div className='mint-error-container'>
							<div className='error'>{<CustomHeader text={Lang.format('Mint105Error')} />}</div>
						</div>
					) : null}
				</React.Fragment>
			);
		}
	}
}
export default observer(ProductPage)