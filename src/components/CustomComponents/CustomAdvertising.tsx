import { observer } from 'mobx-react';
import * as React from 'react';
import { isNullOrUndefined } from 'util';
import { ADVERTING_STORE, CONFIGURATION_STORE } from '../../consts/stores';
import Advertisement from '../../models/Advertisement';
import rootStores from '../../stores';
import AdvertisingStore from '../../stores/AdvertisingStore';
import CustomCarousel from './CustomCarousel';
import { CustomMediaQuery } from './CustomMediaQuery/CustomMediaQuery';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import Commercial from '../BeyhadComponents/CustomService/Advertisement/Commercial';
import * as _ from 'lodash';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { useEffect } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface IState { }

interface Props {
	history?: any;
}

const advertisingStore: AdvertisingStore = rootStores[ADVERTING_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const CustomAdvertising : React.FC<Props> = ({
	history,
}) => {

	useEffect(() => {
		advertisingStore.getAdvertisement();
		const imagesSlider: Advertisement[] | any = advertisingStore.getImagesSlider;
		GoogleAnalyticsUtils.sendAnalyticsBanner(imagesSlider,'view_promotion');
	},[])

	let ref: any = React.createRef<HTMLDivElement>();

	const onImageClick = (image?: Advertisement) => {
		const imagesSlider: Advertisement[] = [];
		if(image){
			imagesSlider.push(image)
			GoogleAnalyticsUtils.sendAnalyticsBanner(imagesSlider,'select_promotion');
		}
		if (history && image && image.link) {
			// External link
			if(image.link.includes('productPage') || image.link.includes('eventimProductPage')){
                localStorage.setItem('select_promotion','true');
            }
			
			if (image.link.startsWith('http')) {
				ExternalLinkConfirm.OpenLinkExternal(image.link,"_blank");
			} else {
				// Internal Link
				history.push(image.link);
			}
		}
	};

	const renderAllImges = (imges?: Advertisement[],isMobile: boolean = true) => {
		if (imges) {
			return imges.map((img: Advertisement, index) => {
				const alt = _.get(img, 'alt', '');
				return (
					<div title={alt} key={index} className='single-advertising-container' onClick={() => onImageClick(img)}>
						<img
							className='single-advertising-image'
							src={getImageLink(isMobile ? img.imageUrlSmall : img.imageUrlBig)}
							alt={alt}
							style={{ borderRadius: '30px' }}
						/>
					</div>
				);
			});
		} else {
			return null;
		}
	};

	const getImageLink = (imagUrl) => {
		if (imagUrl.includes('http'))
			return imagUrl;
		else
			return `${configurationStore.getConfiguration.picsUrl}/share/histadrut/${imagUrl}`
	}

	const onChangeSendAnalyticsData = (item, images) => {
		try {
			if (isInViewPort()) {
				isInViewPort;
				let commercial = {
					messageName: images[item].alt,
					messageKey: images[item].alt,
				};
				// GoogleAnalyticsUtils.onPromoView(
				// 	commercial,
				// 	images && images[item] && 'Carousel Top Homepage - ' + images[item].sortOrder.toString()
				// );
			}
		} catch (e) {
			console.log('Analytics Error - onPromoView Top Carousel');
		}
	}

	const onClickSendAnalyticsData = (item, images) => {
		try {
			let commercial = {
				messageName: images[item].alt,
				messageKey: images[item].alt,
			};
			// GoogleAnalyticsUtils.onPromoClick(
			// 	commercial,
			// 	images && images[item] && 'Carousel Top Homepage - ' + images[item].sortOrder.toString()
			// );
		} catch (e) {
			console.log('Analytics Error - onPromoClick Top Carousel');
		}
	}

	const isInViewPort = () => {
		try {
			if (!ref) {
				return false;
			}
			var distance = ref.getBoundingClientRect();
			if (
				distance.top >= 0 &&
				distance.left >= 0 &&
				distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				distance.right <= (window.innerWidth || document.documentElement.clientWidth)
			) {
				return true;
			}
		} catch (err) {
			// Silent Error
			console.log('CaruselItem is in view test failed.');
		}
		return false;
	};

	const renderFilteredCaruosel = (images: Advertisement[], isMobile: boolean = true) => {
		if (images && images.length > 0) {
			return (
				<div className='advertising-container' ref={(r) => (ref = r)}>
					<CustomCarousel
						width={`100%`}
						showStatus={false}
						stopOnHover
						showArrows
						showThumbs={false}
						onClickItem={(item) => onClickSendAnalyticsData(item, images)}
						onChange={(item) => onChangeSendAnalyticsData(item, images)}>
						{renderAllImges(images,isMobile)}
					</CustomCarousel>
				</div>
			);
		} else {
			return null;
		}
	};

	const imagesSlider: Advertisement[] | any = advertisingStore.getImagesSlider;
	return (
		<>
			<CustomMediaQuery.Mobile>
				{renderFilteredCaruosel(imagesSlider, true)}
			</CustomMediaQuery.Mobile>
			<CustomMediaQuery.Desktop>
				{renderFilteredCaruosel(imagesSlider, false)}
			</CustomMediaQuery.Desktop>
		</>
	);
}
export default observer(CustomAdvertising)

