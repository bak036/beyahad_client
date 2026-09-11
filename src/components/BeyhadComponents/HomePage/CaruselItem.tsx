import { CustomButton, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../consts/RoutesPath';
import { AUTH_STORE, CONFIGURATION_STORE, HOMEPAGE_STORE } from '../../../consts/stores';
import rootStores from '../../../stores';
import AuthStore from '../../../stores/AuthStore';
import CategoryUtils from '../../../utils/categoryUtils';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import { throttle } from 'lodash';
import * as _ from 'lodash';
import { CategoryType } from 'src/models/enums';
import HomePageStore from 'src/stores/HomePageStore';
import Lang from '../../../config/Language';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import ConfigurationStore from 'src/stores/ConfigurationStore';
interface Props {
	category: any;
	history?: any;
	onDragStart?: any;
	tagIndex?: number;
}

interface IState {
	carouselMargin: boolean;
}
const authStore: AuthStore = rootStores[AUTH_STORE];
const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const configurationStore : ConfigurationStore = rootStores[CONFIGURATION_STORE];
const CaruselItem : React.FC<Props> = ({
	category,
	history,
	onDragStart,
	tagIndex
}) => {

	const [carouselMargin, setCarouselMargin] = useState<boolean>(false);
	
	let ref: any = React.createRef<HTMLDivElement>();
	let inView: boolean = false;
	let scrollListener;

	const renderProductPage = (id: string) => {
		if (id) {
			if (authStore.canActivateAction) {
				history.push(`${RoutesPath.category.rootProductPage}/${id}`);
			}
		}
	};

	const isInViewPort = () => {
		try {
			if (!ref) {
				return;
			}
			if (!inView) {
				var distance = ref.getBoundingClientRect();
				if (
					distance.top >= 0 &&
					distance.left >= 0 &&
					distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
					distance.right <= (window.innerWidth || document.documentElement.clientWidth)
				) {
					inView = true;
					window.removeEventListener('scroll', scrollListener);
					const index = tagIndex ? tagIndex : 0;
					// GoogleAnalyticsUtils.singleImpression(this.props.category, index);
				}
			}
		} catch (err) {
			// Silent Error
			console.log('CaruselItem is in view test failed.');
		}
	};

	const resize = () => {
		setCarouselMargin(true)
	};

	useEffect(()=> {
		const throttleIsInViewPort = throttle(isInViewPort, 300);
		// When the commercial is visible send an impression to google analytics
		scrollListener = window.addEventListener('scroll', throttleIsInViewPort);

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('scroll', scrollListener);
		}
	},[])
	
	const categoryName = _.get(category, 'categories.categoryName', '');
	const businessName = category.categories.business.name;
	const alt = _.get(category, 'categories.images[0].alt', categoryName);
	const addressAlt = _.get(category, 'categories.business.address', '');
	const title = _.get(category, 'categories.images[0].alt', categoryName);
	const tagName = homePageStore.tags[tagIndex ? tagIndex : 0].tagName;
	const showTitle = category &&
		category.categories &&
		category.categories.categoryType != CategoryType.Consumerism &&
		category.categories.categoryType != CategoryType.ConsumerismCoupons &&
		category.categories.categoryType != CategoryType.Shows &&
		category.categories.categorySubTitle
	category.categories.categoryType < 99;
	return (
		<>
			{category.categories && (
				<div
					ref={(i) => (ref = i)}
					onDragStart={onDragStart}
					className={`carusel-item-container cursor-pointer ${carouselMargin ? 'fix-resize' : ''}`}
					onClick={() => {
						const page = window.location.href.includes('productPage') || window.location.href.includes('EventimProductPage') ? Lang.format('ProductPage') : Lang.format('HomePage') + ' - ';
						authStore.productJsonForGA = page + tagName;
						authStore.productIndexForGA = category.categoryTagSort;
						GoogleAnalyticsUtils.sendProductToAnalytics(category, category.categories,'select_item',authStore.productJsonForGA,authStore.productIndexForGA);
						CategoryUtils.renderPage(
							category.categories.categoryId,
							authStore.canActivateAction,
							category,
							history
						);
					}}
					style={{ margin: '10px' }}>
					<div className='img-container'>
						{category.categories.images && category.categories.images[0] && (
							<img
								className='img-item lazy'
								src={`${category.categories.images[0] ? `${configurationStore.getConfiguration.picsUrl}/share/${category.categories.images[0].file}` : require('../../../assets/white_bg.png')}`}
								data-src={`${configurationStore.getConfiguration.picsUrl}/share/${category.categories.images[0].file}`}
								alt={alt}
								title={title}
								style={{ maxHeight: '230px' }}
							/>
						)}
						{category.categories.images.length === 0 && (
							<img className='img-item' src={require('../../../assets/white_bg.png')} alt={alt} title={title} />
						)}
					</div>
					<div className='all-text-container'>
						<div style={{ display: 'flex', flexDirection: 'column', lineHeight: '5px' }}>
							{<div className={`title-main-item-container title-main-item-container-hight}`}>
								<CustomSpan classNameSpan='title-main-item-container' text={
									showTitle ? businessName : categoryName} />
							</div>}
							<div className='title-item-container'>
								{showTitle && <div>
									<CustomSpan classNameSpan='homepage-title-text' text={category.categories.categorySubTitle} />
								</div>}
							</div>
						</div>
						<div className='line'></div>
						<div className='location-and-prices'>
							<div style={{ marginTop: '10px' }}>
								<CustomButton
									disabled={false}
									text={'לפרטים ורכישה'}
									buttonClassName={`center normal-blue tags-home-page font-size`}
								/>
							</div>
							<div className='location-container'>
								{category &&
									category.categories &&
									category.categories.business &&
									category.categories.business.address &&
									!category.categories.isConsumption && (
										<React.Fragment>
											<div className='logo-container'>
												<img className='logo-item img-logo' src={require('../../../assets/location.png')} alt={addressAlt} />
											</div>

											<div className='location-name'>
												<CustomSpan classNameSpan='location-name-text' text={addressAlt} />
											</div>
										</React.Fragment>
									)}
							</div>
							{category &&
								category.categories &&
								category.categories.business &&
								category.categories.business.address &&
								!category.categories.isConsumption && <div className='line'>

								</div>}
							<div className='prices-container'>
								{/* <div className='discount-container'>
									<CustomSpan
										classNameSpan='discount-text'
										text={category.varients ? category.varients[0].description : ''}
									/>
								</div> */}
								<div className='price-container'>
									<div className='img-price'>
										<img className='logo-item' src={require('../../../assets/price-tag-copy.png')} alt={addressAlt} />
									</div>
									<CustomSpan
										classNameSpan='price-text'
										text={`${category.categories
											? `${category.categories.description === 'אזל המלאי'
												? category.categories.description
												: `${category.categories.description}`
											}`
											: ` 0`
											} `}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
export default observer(CaruselItem);

