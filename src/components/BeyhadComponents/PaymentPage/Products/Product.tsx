import * as _ from 'lodash';
import {observer} from 'mobx-react';
import {CustomButton, CustomHeader, CustomSeperator, CustomSpan,HeaderType} from 'nofshonit-base-web-client';
import * as React from 'react';
import {NavLink} from 'react-router-dom';
import Lang from '../../../../config/Language';
import {RoutesPath} from '../../../../consts/RoutesPath';
import {CART_STORE, CONFIGURATION_STORE} from '../../../../consts/stores';
import CartItem from '../../../../models/CartItem';
import {QuantityType} from '../../../../models/enums';
import Varient from '../../../../models/Varient';
import rootStores from '../../../../stores';
import ConfigurationStore from '../../../../stores/ConfigurationStore';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import CustomModal from '../../../CustomComponents/CustomModal';
import EventItem from './EventItem';
import VarientItem, {QuantityAction} from './VarientItem';
import {isMint} from '../../../../utils/authentication/historyUtils';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import 'antd/lib/row/style/css';
import 'antd/lib/col/style/css';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import EditorMessage from '../../EditorMessage/EditorMessage';
import CartStore from 'src/stores/CartStore';
import { useState } from 'react';

const moment = require('moment');
interface Props {
	category: CartItem;
	cart?: boolean;
	deleteVarient?: boolean;
	description?: boolean;
	sale?: boolean;
	deleteCategory?: boolean;
	overLimit?: (productLimit) => void;
	cardVariant?: CartItem;
	quantity?: QuantityType;
	onQuantityChanged?: (varient: Varient, category: CartItem) => Promise<any>;
	onRemoveClicked?: (barcode) => Promise<any>;
	onDeleteCategoryClicked?: (categoryId) => void;
	history?: any;
	accessToken?: any;
	isMint?: boolean;
	variantActive?: string;
	totalSumPrice?: number;
	totalPrice?: number;
	thanksPayment?: boolean;
}

interface IState {
	totalPrice?: number;
	variantLimit: number;
	overLimitModal: boolean;
}
const cartStore: CartStore = rootStores[CART_STORE];
const configStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const Product : React.FC<Props> = ({
	category,
	cart,
	deleteVarient,
	description,
	sale,
	deleteCategory,
	overLimit,
	cardVariant,
	quantity,
	onQuantityChanged,
	onRemoveClicked,
	onDeleteCategoryClicked,
	history,
	accessToken,
	isMint,
	variantActive,
	totalSumPrice,
	totalPrice,
	thanksPayment
}) => {

	const [totalPriceState, setTotalPriceState] = useState<number>(totalPrice ? totalPrice : 0);
	const [variantLimit, setVariantLimit] = useState<number>(0);
	const [overLimitModal, setOverLimitModal] = useState<boolean>(false);

	const onDeleteCategoryClickedFunc = () => {
		if (onDeleteCategoryClicked) {
			if(category.variants){
				for(let index = 0; index < category.variants.length; index ++){
					GoogleAnalyticsUtils.remove(category.variants[index],cartStore.getCartForPayment);
				}
			}
			onDeleteCategoryClicked(category.categoryId);
		}
	};

	const sumTotalPrice = () => {
		let sum = 0;
		if (category && category.variants) {
			category.variants.forEach((varient) => {
				sum += varient.price * varient.quantity;
			});
		}
		setTotalPriceState(sum)
	};

	const onQuantityChange = async (barcode, quantityAction: QuantityAction) => {
		var i;
		if (category.variants) {
			const filtered: Varient | any = category.variants.filter((varient, index) => {
				if (varient.barCode === barcode) {
					i = index;
				}
				return varient.barCode === barcode;
			});
			if (quantityAction === QuantityAction.Increce) {
				category.variants[i].quantity = category.variants[i].quantity + 1;
			} else if (quantityAction === QuantityAction.Decrece) {
				category.variants[i].quantity = category.variants[i].quantity - 1;
			} else if (quantityAction === QuantityAction.CardItem) {
				category.variants[i].quantity = 1;
			}
		}

		if (onQuantityChanged) {
			return onQuantityChanged(category.variants[i], category).then(() => {
				sumTotalPrice();
			});
		} else {
			sumTotalPrice();
		}
	};
	const onRemoveClickedFunc = async (barcode) => {
		if (onRemoveClicked) {
			onRemoveClicked(barcode).then(() => {
				sumTotalPrice();
			});
		} else {
			sumTotalPrice();
		}
	};

	const renderAllVariants = () => {
		if (category && category.variants) {
			return category.variants.map((varient, index) => (
				<React.Fragment key={index}>
					{index > 0 ? <CustomSeperator /> : null}
					<VarientItem
						thanksPayment={thanksPayment}
						varient={varient}
						categoryId={category.categoryId}
						quantity={quantity}
						description={description}
						deleteVarient={deleteVarient}
						quantityValue={category.quantity}
						onQuantityChanged={onQuantityChange}
						onRemoveClicked={onRemoveClickedFunc}
						cardVariant={cardVariant}
						overLimit={(productLimit) => {
							if (overLimit) overLimit(productLimit);
						}}
						variantActive={variantActive}
						cardVarientBarcode={
							varient.barCode == configStore.getConfiguration.cardVariant.variants[0].barCode ? true : false
						}
					/>
				</React.Fragment>
			));
		} else {
			return null;
		}
	};

	const renderAllEvent = () => {
		const events = orgnaizEvents(category);
		if (events) {
			return events.map((event, index) => (
				<>
					{index > 0 ? <CustomSeperator /> : null}
					<EventItem
						event={event}
						eventDate={category.eventDate}
						description={description}
						quantityValue={category.quantity}
						quantity={QuantityType.View}
					/>
				</>
			));
		} else {
			return null;
		}
	};
	const orgnaizEvents = (event: CartItem) => {
		var eventsArray: any[] = [];
		var result = _.groupBy(event.tickets, 'variantFullBarcode');
		for (let key in result) {
			const item = {
				variantFullBarcode: key,
				orderLimit: result[key][0].orderLimit,
				price: result[key][0].price,
				eventimTicketTypeName: result[key][0].eventimTicketTypeName,
				venuName: result[key][0].venuName,
				eventTime: result[key][0].eventTime,
				eventDate: category.eventDate,
				tickets: result[key].map((ticket, index) => {
					return {
						area: ticket.area,
						priceLevelName: ticket.priceLevelName,
						row: ticket.row,
						seat: ticket.seat,
						ticketTypeName: ticket.ticketTypeName,
						quantity: ticket.quantity,
					};
				}),
			};
			eventsArray.push(item);
		}
		return eventsArray;
	};

	const LimitModal = () => {
		return (
			<div>
				<div style={{paddingTop: 20}}>
					<CustomSpan
						text={`ברשותך לרכוש רק ${
							variantLimit
						} פרטים ממוצר זה אנא בדוק שאינך חרגת מכמות המוצרים המותרת  `}
					/>
				</div>
				<div style={{paddingTop: 15}}>
					<CustomButton
						text={Lang.format('Cancel')}
						buttonClassName={'primary-design center smallHeight'}
						onClick={onCancel}
					/>
				</div>
			</div>
		);
	};

	const onCancel = () => {
		setOverLimitModal(false)
	};

	const shortDescription = category && category.shortDescription ? category.shortDescription : '';
	let priceTotal = 0;

	if (totalSumPrice) {
		priceTotal = totalSumPrice;
	} else if (totalPrice) {
		priceTotal = totalPrice;
	}
	priceTotal = StringFormatUtils.tryConvertToLocaleString(priceTotal);



	return (
		<>
			{category && category.variants && (
				<div className='product-item-container'>
					<CustomModal
						componentToRender={LimitModal()}
						onCancel={onCancel}
						visible={overLimitModal}
					/>
					<div className='product-title'>
						{/* <CustomHeader type={HeaderType.SubTitle} text={category ? category.name : ''} /> */}
						{isMint ? (
							<NavLink
								to={`${RoutesPath.mint.category}/${category.categoryId}`}
								className={'title-link'}>
								{category ? category.name : ''}
							</NavLink>
						) : (
							<NavLink
								to={`/category/productPage/${category.categoryId}`}
								className={'title-link'}>
								{category ? category.name : ''}
							</NavLink>
						)}
						{deleteCategory && (
									<div className='delete-logo-container cursor-pointer'
											onClick={onDeleteCategoryClickedFunc}>
										<img
											alt={Lang.format('DeleteVarient')}
											src={require('../../../../assets/icons/trash-blue.svg')}
											className='delete-item-image'
										/>
										<CustomSpan text={Lang.format('DeleteProduct')} classNameSpan={'delete-item-text'} />
									</div>
						)}
					</div>
					{description && (
    					<div className='product-description-container'>
        					<div
            					className='contact-message'
            					dangerouslySetInnerHTML={{
                					__html: shortDescription,
            					}}
        					/>
    					</div>
					)}
					<div className='product-titles-container'>
					{thanksPayment ? (
							<>
							<div className={'product-header-varient-title-name'}>{Lang.format('Item')}</div>
							<div className={'product-header-varient-title-price'}>{Lang.format('Price')}</div>
							<div className={'product-header-varient-title-amount'}>{Lang.format('Amount')}</div>
							</>
					) : (
							<>
							<div className={'product-header-varient-title-name'}>{Lang.format('Item')}</div>
							<div className={'product-header-varient-title-price'}>{Lang.format('Price')}</div>
							<div className={'product-header-varient-title-amount'}>{Lang.format('Amount')}</div>
							</>
					)}
					</div>	

					<div className='variants-container'>{renderAllVariants()}</div>
					{cart && (
						<>
							<CustomSeperator />
							<div className='sum-category-container'>
									<div className='sum-category'>
										<CustomSpan classNameSpan='sum-category-item' text={Lang.format('Total')} />
									</div>
									<div className='total-category'>
										<CustomSpan classNameSpan='total-item' text={`${priceTotal} ₪`} />
									</div>
							</div>
						</>
					)}
				</div>
			)}
			{category && category.tickets && (
				/*
				TODO : update tickets cart item
				
				*/
				<div className='product-item-container'>
					<div className='product-title'>
						<div className='product-title-right'>
							{isMint ? (
									<NavLink
										to={`${RoutesPath.mint.rooteventimProductPage}/${category.categoryId}`}
										className={'title-link'}>
										{category ? category.name : ''}
									</NavLink>
								) : (
									<NavLink
										to={`${RoutesPath.category.rooteventimProductPage}/${category.categoryId}`}
										className={'title-link'}>
										{category ? category.name : ''}
									</NavLink>
								)}
								{description && (
								<div className='product-description-container'>
									<div
										className='contact-message'
										dangerouslySetInnerHTML={{
											__html: shortDescription,
										}}
									/>
								</div>
							)}
						</div>
						{deleteCategory && (
									<div className='delete-logo-container cursor-pointer'
											onClick={onDeleteCategoryClickedFunc}>
										<img
											alt={Lang.format('DeleteVarient')}
											src={require('../../../../assets/icons/trash-blue.svg')}
											className='delete-item-image'
										/>
										<CustomSpan text={Lang.format('DeleteProduct')} classNameSpan={'delete-item-text'} />
									</div>
						)}
					</div>
					<div className='product-titles-container'>
					{thanksPayment ? (
							<>
							<div className={'product-header-varient-title-name'}>{Lang.format('Item')}</div>
							<div className={'product-header-varient-title-name'}>{Lang.format('Amount')}</div>
							<div className={'product-header-varient-title-name'}>{Lang.format('Price')}</div>
							</>
					) : (
						<>
						<div className={'product-header-varient-title-name'}>{Lang.format('Item')}</div>
						<div className={'product-header-varient-title-name'}>{Lang.format('Price')}</div>
						<div className={'product-header-varient-title-name'}>{Lang.format('Amount')}</div>
						</>
					)}
					</div>

					<div className='tickets-container'>{renderAllEvent()}</div>
					{cart && (
						<>
							<CustomSeperator />
							<div className='sum-category-container'>
									<div className='sum-category'>
										<CustomSpan classNameSpan='sum-category-item' text={Lang.format('Total')} />
									</div>
									<div className='total-category'>
										<CustomSpan classNameSpan='total-item' text={`${priceTotal} ₪`} />
									</div>
							</div>
						</>
					)}
				</div>
			)}
		</>
	);
}

export default Product;
