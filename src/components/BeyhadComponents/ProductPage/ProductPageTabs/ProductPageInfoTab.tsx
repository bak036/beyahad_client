import { get } from 'lodash';
import { observer } from 'mobx-react';
import { CustomHeader, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { CATEGORY_STORE } from '../../../../consts/stores';
import Category from '../../../../models/Category';
import rootStores from '../../../../stores';
import CategoryStore from '../../../../stores/CategoryStore';
import CustomAntdCollapsible from '../../../CustomComponents/CustomAntdCollapsible/CustomAntdCollapsible';
import CustomMaps from '../../../CustomComponents/CustomMaps/CustomMaps';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import EditorMessage from '../../EditorMessage/EditorMessage';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import Icon from 'antd/lib/icon';
import CustomButton from '../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';

// https://www.npmjs.com/package/react-scrollbars-custom

interface Props {
	catergory: Category;
	isMobile?: boolean;
	triggerText?: string;
}
interface IState { }

const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];

const ProductInfoPageTab : React.FC<Props> = ({
	catergory,
	isMobile,
	triggerText,
}) => {

	const checkPhoneNumber = (phone: string) => {
		const poneNumber = phone ? phone.trim() : '';
		if (poneNumber.length === 10 && poneNumber[0] != '1') {
			return '+972'.concat(poneNumber.substr(1));
		} else {
			return poneNumber;
		}
	}

	const renderComponent = () => {
		const images: any = catergory && catergory.images ? catergory.images : [];
		const categoryMoreInfo = catergory && catergory.business.locationExplain
			? catergory.business.locationExplain
			: '';
		const categoryPhone = catergory && catergory.business.phone ? catergory.business.phone : '';
		const mobilePhone = checkPhoneNumber(categoryPhone);
		const categoryWebSite = catergory && catergory.business.webSite ? catergory.business.webSite : '';
		const prodcutAltitude =
			catergory && catergory.locations && catergory.locations.length === 1
				? catergory.locations[0].gpsPointer_Lon
				: undefined;
		const prodcutLatitude =
			catergory && catergory.locations && catergory.locations.length === 1
				? catergory.locations[0].gpsPointer_Lat
				: undefined;
		const category = catergory;
		const hasConsumer = categoryStore.hasConsumerProduct(category);

		return (
			<>

				<div className='product-page-info-tabs-component-data-text'>
					<EditorMessage textClassName='how-to-reach-text' message={categoryMoreInfo} />
				</div>
				{category.categoryType === 26 ?
					(<>
						{category && category.business && category.business.name && (
							<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
								<TextCustomItemComponent isBold={true}
									text={"פרטי הספק"}
									icon={{ src: require('../../../../assets/icons/information.svg'), name: 'pin icon' }}
									customClass={'block'} />
								<p>{category.business.name}</p>
							</div>

						)}
						{mobilePhone && (
							<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
								<CustomMediaQuery.Desktop>
									<TextCustomItemComponent
										isBold={true}
										text={"טלפון"}
										icon={{ src: require('../../../../assets/icons/phone.svg'), name: 'phone icon' }}
										customClass={'block'} />
									<p>{"טלפון לתיאום ולבירורים: " + mobilePhone.replace('+972', '0')}</p>
								</CustomMediaQuery.Desktop>
								<CustomMediaQuery.Mobile>
									<TextCustomItemComponent
										isBold={true}
										text={"טלפון"}
										icon={{ src: require('../../../../assets/icons/phone.svg'), name: 'phone icon' }}
										customClass={'block'} />
									<span>טלפון לתיאום ולבירורים: </span>
									<TextCustomItemComponent
										isExternalUrl={true}
										link={`tel:${mobilePhone}`}
										text={mobilePhone.replace('+972', '0')}
										customClass={'inline'}
									/>
								</CustomMediaQuery.Mobile>
							</div>
						)}
					</>)
					: (<>
					{category && category.business && category.business.name && (
							<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
								<TextCustomItemComponent isBold={true}
									text={"פרטי הספק"}
									icon={{ src: require('../../../../assets/icons/information.svg'), name: 'pin icon' }}
									customClass={'block'} />
								<p>{category.business.name}</p>
							</div>

						)}
						{category && !category.isConsumption && category.business && category.business.address && (
							<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
								{catergory.locations && catergory.locations.length > 1 ?
									<TextCustomItemComponent isBold={true}
										text={'מגוון סניפים'}
										icon={{ src: require('../../../../assets/icons/pin.svg'), name: 'pin icon' }}
										customClass={'block'} /> :
									<TextCustomItemComponent isBold={true}
										text={category.business.address ? category.business.address : ''}
										icon={{ src: require('../../../../assets/icons/pin.svg'), name: 'pin icon' }}
										customClass={'block'} />
								}
							</div>
						)}
						{mobilePhone && (
							<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>

								<CustomMediaQuery.Desktop>
									<TextCustomItemComponent
										isBold={true}
										text={mobilePhone.replace('+972', '0')}
										icon={{ src: require('../../../../assets/icons/phone.svg'), name: 'phone icon' }}
										customClass={'block'} />

								</CustomMediaQuery.Desktop>
								<CustomMediaQuery.Mobile>
									<TextCustomItemComponent
										isBold={true}
										isExternalUrl={true}
										link={`tel:${mobilePhone}`}
										text={mobilePhone.replace('+972', '0')}
										icon={{ src: require('../../../../assets/icons/phone.svg'), name: 'phone icon' }}
										customClass={'block'} />
								</CustomMediaQuery.Mobile>
							</div>
						)}
					</>)
				}
				{/* <div className='product-page-info-tabs-component-data-phone-website' > */}
				<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
					{categoryWebSite && (
						<>
							<TextCustomItemComponent
								isBold={true}
								link={categoryWebSite}
								text={Lang.format('Location_Info_Visit_Website')}
								icon={{ src: require('../../../../assets/icons/website-icon@3x.png'), name: 'website icon' }}
								customClass={'block'} />
						</>
					)}
				</div>

				{category && hasConsumer && category.business && category.business.openHours && (
					<div style={{ marginBottom: "20px", fontFamily: 'Rubik-Regular' }}>
						<TextCustomItemComponent isBold={true}
							text={Lang.format('Location_Info_Working_Hours')}
							icon={{ src: require('../../../../assets/icons/clock.svg'), name: 'clock icon' }}
							customClass={'block'}
						/>
						<div className='open-hour-text' >
							<EditorMessage message={category && category.business && category.business.openHours ? category.business.openHours : ''} />
						</div>
					</div>
				)}
				{prodcutAltitude && prodcutLatitude && get(category, 'business.sumSubBranch') <= 1 && (
					<>
						<TextCustomItemComponent isBold={true}
							text={Lang.format('location_indfo_location')}
							icon={{ src: require('../../../../assets/icons/map-sign.png'), name: 'map sign' }}
							customClass={'block'} />
						<div className='product-page-info-tabs-component-data-map'>

							<CustomMaps
								altitude={prodcutAltitude}
								latitude={prodcutLatitude}
								categoryName={catergory.categoryName}
							/>
						</div>
					</>
				)}
			</>
		)
	};

	const sendGoogleAnalytics = () => {
		GoogleAnalyticsUtils.clickButtonAnalytics('product_page','product_page','click',Lang.format('Location_Info'))
	}
	return (
		<div className='product-page-info-tabs-main-container' onClick={() => {sendGoogleAnalytics}}>
			{isMobile ? (
				<CustomAntdCollapsible
					showArrow={true}
					className='product-page-info-tabs-component-name'
					trigger={triggerText ? triggerText : Lang.format('Location_Info')}
					isSideBar={false}>
					{renderComponent()}
				</CustomAntdCollapsible>
			) : (
				renderComponent()
			)}
		</div>
	);
}
export default observer(ProductInfoPageTab)
