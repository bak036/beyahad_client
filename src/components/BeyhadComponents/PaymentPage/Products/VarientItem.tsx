import * as React from 'react';
import Lang from '../../../../config/Language';
import { CategoryType, QuantityType } from '../../../../models/enums';
import Varient from '../../../../models/Varient';
import { CustomSpan, CustomInputText, TextTypes } from 'nofshonit-base-web-client';
import CartItem from '../../../../models/CartItem';
import 'antd/lib/spin/style/css';
import Spin from 'antd/lib/spin';
import ConfigurationStore from '../../../../stores/ConfigurationStore';
import rootStores from '../../../../stores';
import { CART_STORE, CONFIGURATION_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import ThanksPaymnet from '../ThanksPayment/ThanksPaymnet';
import CartStore from 'src/stores/CartStore';
import { useEffect, useState } from 'react';
import MessagesStore from 'src/stores/MessagesStore';
const moment = require('moment');
interface Props {
	varient: Varient;
	deleteVarient?: boolean;
	description?: boolean;
	quantityValue?: number;
	quantity?: QuantityType;
	onQuantityChanged?: (categoryId, varientId) => Promise<any>;
	categoryId?: string;
	catergoryType?: CategoryType;
	onAddedToCart?: (varient: Varient) => void;
	onRemoveClicked?: (barcode) => void;
	isProductPage?: boolean;
	overLimit?: (orderLimit) => void;
	cardVariant?: CartItem;
	variantActive?: string;
	cardVarientBarcode?: boolean;
	thanksPayment?: boolean;
	onExternalCouponLimit?: (variant: Varient) => void;

}

interface IState {
	quantityItem: number;
	loader: boolean;
}

export enum QuantityAction {
	Increce = 'increce',
	Decrece = 'decrece',
	Empty = 'Empty',
	CardItem = 'CardItem',
}
const cartStore: CartStore = rootStores[CART_STORE];
const configStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const VarientItem: React.FC<Props> = ({
	varient,
	deleteVarient,
	description,
	quantityValue,
	quantity,
	onQuantityChanged,
	categoryId,
	catergoryType,
	onAddedToCart,
	onRemoveClicked,
	isProductPage,
	overLimit,
	cardVariant,
	variantActive,
	cardVarientBarcode,
	thanksPayment,
	onExternalCouponLimit 
}) => {

	const [quantityItem, setQuantityItem] = useState<number>(quantityValue ? quantityValue : (varient.quantity || 0));
	const [loader, setLoader] = useState<boolean>(false);
	const [showMessage, setShowMessage] = useState<boolean>(false);
	const [touchStart, setTouchStart] = useState(false);

	useEffect(() => {
		const handleDocumentClick = () => {
			if (touchStart) {
				setTouchStart(false);
				return;
			}
			if (showMessage) {
				setShowMessage(false);
				console.log('Click after touch detected');
			} else {
				console.log('Click detected');
			}
		};

		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	}, [showMessage, touchStart]);

	const onQuantityIncrece = () => {
		var quantityItemVar = quantityItem + 1;

		
		onExternalCouponLimit?.(varient);

		if (checkQuantity()) {
			setQuantityItem(quantityItemVar);
			if (onQuantityChanged) {
				onQuantityChanged(varient.barCode, QuantityAction.Increce)
			}
		}
		// }
	};

	const onQuantitydecrse = () => {
		const quantityItemVar = isProductPage ? quantityItem - 1 : varient.quantity - 1;

		if (quantityItemVar >= 0) {
			if (onQuantityChanged && !isProductPage) {
				onQuantityChanged(varient.barCode, QuantityAction.Decrece);
			} else if (onQuantityChanged && isProductPage) {
				onQuantityChanged(varient.barCode, QuantityAction.Decrece).then(() => {
					setQuantityItem(quantityItemVar)
				});
			} else {
				setQuantityItem(0)
			}
		} else {
			varient.quantity = 0;
			setQuantityItem(0)
		}
	};

	const checkQuantity = () => {
		if (varient.orderLimit >= 0) {
			if (!isProductPage && varient.orderLimit >= 0) {
				if (varient.quantity >= varient.orderLimit && overLimit) {
					overLimit(varient.orderLimit);
					return false;
				}
			} else if (isProductPage && quantityItem >= varient.orderLimit && overLimit) {
				overLimit(varient.orderLimit);
				return false;
			} else {
				return true;
			}
		}
		return true;
	};

	useEffect(() => {
		if (cardVarientBarcode) {
			setQuantityItem(1);
			if (onQuantityChanged) {
				onQuantityChanged(varient.barCode, QuantityAction.CardItem);
			}
		}
	}, [])

	const renderQuantity = (quantity: QuantityType) => {
		if (varient.isEmpty) {
			quantity = QuantityType.OutOfStock;
		}
		if (cardVariant === varient.barCode) {
			quantity = QuantityType.View;
		}
		switch (quantity) {
			case QuantityType.OutOfStock: {
				return <span className='out-of-stock'>{Lang.format('OutOfStock')}</span>;
			}
			case QuantityType.Edit: {
				return (
					<div
						className={`quantity-with-spin ${cardVarientBarcode ? 'disabled' : ''}`}
						style={{ display: 'flex' }}>
						{loader && <Spin size={'small'} style={{ paddingLeft: 10 }} />}
						<div className='quantity-counter'>
							<div
								className={`upper-arrow-container cursor-pointer`}
								onClick={() => {
									;
									if (
										variantActive === '' ||
										variantActive === varient.barCode ||
										isProductPage
									) {
										if (!isProductPage) {
											onQuantityIncrece();
										} else {
											onQuantityIncrece();
										}
									}
								}}>
								<img style={{ width: '1.5rem', height: '1.5rem' }} src={require('../../../../assets/icons/add.svg')} className='arrow-up-item' />
							</div>
							<div
								className={`quantity-input-container ${cardVarientBarcode ? ' disabled' : ''}`}
								style={{ display: 'flex' }}>
								<input
									className='input-data'
									onChange={() => { }} //if you remove it we has errors in console
									type='tel'
									disabled
									value={isProductPage ? quantityItem : varient.quantity}
								/>
							</div>
							<div
								className={`down-arrow-container cursor-pointer`}
								onClick={() => {
									if (
										variantActive === '' ||
										variantActive === varient.barCode ||
										isProductPage
									) {
										if (!isProductPage) {
											onQuantitydecrse();
										} else {
											onQuantitydecrse();
										}
									}
								}}>
								<img style={{ width: '1.5rem', height: '1.5rem' }} src={require('../../../../assets/icons/minus.svg')} className='arrow-down-item' />
							</div>
						</div>
					</div>
				);
			}
			case QuantityType.View: {
				return (
					<div className='varient-quantity-container'>
						<span style={{ fontSize: 16 }} className='varient-quantity'>
							{thanksPayment ? `${varient.quantity}` : `כמות:${varient.quantity}`}
						</span>
					</div>
				);
			}
		}
	}
	const onRemoveClickedFunc = () => {
		if (onRemoveClicked) {
			GoogleAnalyticsUtils.remove(varient, cartStore.getCartForPayment);
			onRemoveClicked(varient.barCode);
		}
	};

	const deleteVarientVar = deleteVarient ? deleteVarient : false;
	const descriptionVar = description ? description : false;
	const saleVar = varient.isCampaign ? varient.isCampaign : false;
	const quantityVar = quantity ? quantity : QuantityType.View;
	const catergoryTypeVar = catergoryType ? catergoryType : [];
	const isShowAndGotTicker =
		catergoryType === CategoryType.Show && quantity != QuantityType.OutOfStock ? true : false;
	const thanksPaymentVar = thanksPayment ? thanksPayment : false;

	return (
		<div className={`varient-main-container ${saleVar ? 'sale' : ''}`}>
			<div className={`varient-item-container ${saleVar ? 'sale' : ''}`}>
				<div className='varient-item-text-container'>
					<div className={`main-title ${saleVar ? 'sale' : ''}`} style={{ marginTop: '3px', display: 'block' }}>
						<div className={`varient-item-sale-title-container ${saleVar ? 'sale' : ''}`}>
							<div className='title-text-container'>
								<div className={`varient-name`} title={`${varient.expireDate}`}>
									{varient.name}
								</div>
							</div>
						</div>
					</div>
				</div>
				{thanksPayment ? (
					<>
						<div className={`varient-item-prices ${saleVar ? 'sale' : ''}`}>
							<div className='varient-item-price'>
								<span className={`price-text`}>{`${varient.price.toLocaleString()} ₪`}</span>
							</div>
							{varient.kupaPrice && isProductPage && varient.kupaPrice > varient.price ? (
								<div className='varient-item-discount'>
									<span className='discount-text'>{`${StringFormatUtils.tryConvertToLocaleString(
										varient.kupaPrice
									)} ₪`}</span>
								</div>
							) : null}
						</div>
						<div className={`varient-item-quantity ${saleVar ? 'sale' : ''}`}>
							{renderQuantity(quantityVar)}
							{isShowAndGotTicker && <button className='varient-item-quantity-button'>בחר מקום</button>}
						</div>
					</>
				) : (
					<>
						<div className={`varient-item-prices ${saleVar ? 'sale' : ''}`}>
							<div className='varient-item-price'>
								<span className={`price-text`} style={{ marginTop: '3px', display: 'block' }}>{`${varient.price.toLocaleString()} ₪`}</span>
							</div>
							{varient.kupaPrice && isProductPage && varient.kupaPrice > varient.price ? (
								<div className='varient-item-discount'>
									<span className='discount-text'>{`${StringFormatUtils.tryConvertToLocaleString(
										varient.kupaPrice
									)} ₪`}</span>
									<div style={{ cursor: 'pointer', position: 'relative' }} onMouseOver={() => { setShowMessage(true); }} onMouseLeave={() => { setShowMessage(false) }} >
										<div className='discount-explanation-icon-div' onTouchStart={() => { setTouchStart(true); ; showMessage == true ? setShowMessage(false) : setShowMessage(true) }}>
											<img className='discount-explanation-icon' style={{ cursor: 'pointer' }} src={require('../../../../assets/Error_Outline_Icon_2.png')}></img>
										</div>
										{showMessage &&
											<div className='discount-explanation-message'>{messagesStore.priceInfo}</div>
										}
									</div>
								</div>
							) : null}
						</div>
						<div className={`varient-item-quantity ${saleVar ? 'sale' : ''}`}>
							{renderQuantity(quantityVar)}
							{isShowAndGotTicker && <button className='varient-item-quantity-button'>בחר מקום</button>}
						</div>
					</>
				)}
				{deleteVarient && (
					<div className='delete-logo-container cursor-pointer'>
						<img
							onClick={onRemoveClickedFunc}
							alt={Lang.format('DeleteVarient')}
							src={require('../../../../assets/icons/trash.svg')}
							className='delete-item'
						/>
					</div>
				)}
			</div>
			{
				description && (
					<div className='desc-container' title={Lang.format('ValidDate')}>
						{/* The valid date from the server is this string, if there is no valid date on the variant */}
						{varient.monthlyLimit && varient.monthlyLimit !== -1 && (
							<div>
								<TextCustomItemComponent
									text={`${Lang.format('MaxBuy1')} ${`${varient.monthlyLimit}`} ${Lang.format('MaxBuy2')}`}
									icon={{ src: require('../../../../assets/icons/bag.svg'), name: '' }} />
							</div>
						)}
						{varient.endDate && !window.location.href.includes('cart') && (
							<TextCustomItemComponent
								text={`${Lang.format('LastOrderDate')}${moment(
									`${varient.endDate}`
								).format('DD/MM/YYYY')}`}
								icon={{ src: require('../../../../assets/icons/calendar.svg'), name: '' }}
							/>
						)}
						{varient.expireDate != '0001-01-01T00:00:00' && (
							<TextCustomItemComponent
								text={`${Lang.format('ValidDate')}${moment(
									`${varient.expireDate}`
								).format('DD/MM/YYYY')}`}
								icon={{ src: require('../../../../assets/icons/calendar.svg'), name: '' }}
							/>
						)}

						{varient.generalLimit && varient.generalLimit !== -1 && (
							<TextCustomItemComponent
								text={`${Lang.format('MaxBuy1')} ${`${varient.generalLimit}`} ${Lang.format('MaxBuy3')}`}
								icon={{ src: require('../../../../assets/icons/bag.svg'), name: '' }} />
						)}
						{/* {varient.yearlyLimit && varient.yearlyLimit !== -1 && (
							<TextCustomItemComponent
								text={`${Lang.format('MaxBuy1')} ${`${varient.yearlyLimit}`} ${Lang.format('MaxBuy4')}`}
								icon={{ src: require('../../../../assets/icons/bag.svg'), name: '' }} />
						)} */}
					</div>
				)
			}
		</div >
	);
}
export default VarientItem;

