import { observer } from 'mobx-react';
import { CustomButton, CustomSeperator, CustomHeader, HeaderType, Logger, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Products from '../../components/BeyhadComponents/PaymentPage/Products/Products';
import Lang from '../../config/Language';
import { CART_STORE, VIEW_STORE, CONFIGURATION_STORE, MESSAGES_STORE } from '../../consts/stores';
import { QuantityType } from '../../models/enums';
import rootStores from '../../stores';
import CartStore from '../../stores/CartStore';
import ViewStore from '../../stores/ViewStore';
import Varient from '../../models/Varient';
import CartItem from '../../models/CartItem';
import ConfigurationStore from '../../stores/ConfigurationStore';
const moment = require('moment');
import TimePicker from 'antd/lib/time-picker';
import 'antd/lib/time-picker/style/css';
import ErrorUtils from '../../utils/errorHandling/ErrorUtils';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import Statistic from 'antd/lib/statistic';
import * as _ from 'lodash';
import CustomModal from '../../components/CustomComponents/CustomModal';
import MessagesStore from '../../stores/MessagesStore';
import StringFormatUtils from '../../utils/StringFormatUtils';
import CustomButtonBeyahad from '../../components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import ComponentContentEmpty from 'src/components/CustomComponents/ComponentContentEmpty/ComponentContentEmpty';
import { CustomMediaQuery } from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect, useState } from 'react';

interface Props {
	history: any;
	setAccess: (accessPaymnnent: boolean) => void;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	code: string;
	desable: boolean;
	popUpVisible: boolean;
	variantOrderLimit;
	variantActive?: string;
	variantCount: number;
}
const CountDown = Statistic.Countdown;
const cartStore: CartStore = rootStores[CART_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const format = 'mm:ss';

const CartContainer : React.FC<Props> = ({
	history,
	setAccess,
	isMint,
	accessToken
}) => {
	const [code, setCode] = useState<string>('');
	const [disable, setDisable] = useState<boolean>(false);
	const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
	const [variantOrderLimit, setVariantOrderLimit] = useState<any>(undefined);
	const [variantActive, setVariantActive] = useState<string>('');
	const [variantCount, setVariantCount] = useState<number>(0);

	useEffect(() => {
		viewStore.setLoadingView(true);
		cartStore.init().then(() => {
			viewStore.setLoadingView(false);
		});
	},[])

	const onDiscountCodeChange = (value) => {
		const code = value;
		setCode(code)
	};

	const onPaymentClicked = () => {
		// GoogleAnalyticsUtils.checkoutStepTwo(cartStore.getCart);
		setAccess(false);
		if (isMint) {
			history.push('/mint/cart/payment');
		} else {
			history.replace('/cart/payment');
		}
		window.scrollTo(0, 0);
	};

	const onQuantityChange = (varient: Varient, category: CartItem): any => {
		let result;
		try {

			return cartStore.updateCart(varient.barCode, varient.quantity)
				.then(result => result);
		} catch (err) {
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			cartStore.init();
		} finally {
			setDisable(false)
			setVariantActive('')
		}
	};

	const onRemoveClicked = async (barcode) => {
		try {
			setDisable(true)
			const res = await cartStore.removeVareint(barcode);
			setDisable(false)

			return res;
		} catch (err) {
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		}
	};

	const onDeleteCategoryClicked = async (categoryId) => {
		await cartStore.removeCategory(categoryId);
	};

	const onFinish = () => { };

	const onCancel = () => {
		setPopUpVisible(false)
	};
	const overLimit = (orderLimit) => {
		setPopUpVisible(true)
		setVariantOrderLimit(orderLimit)
	};


	const renderLimitaionModal = () => {
		return (
			<div className='product-page-header-pop-up'>
				<CustomSpan
					text={`באפשרותך לרכוש רק ${variantOrderLimit
						} פריטים ממוצר זה אנא בדוק האם חרגת בבחירת הפריטים או שישנם פריטים בסל הקניות או בהזמנות הקודמות`}
				/>

				<CustomButton
					containerClassName={'product-page-button-pop-up'}
					text={'סגור'}
					buttonClassName={'center primary-design small'}
					onClick={onCancel}
				/>
			</div>
		);
	};

	const getVariantNumber = () => {
		let itemsSum = 0;
		const categories: CartItem[] = cartStore.getCart;
		categories.forEach(c => {
			if (c && c.variants && c.variants.length)
				c.variants.forEach(v => itemsSum += v.quantity)
			if (c && c.tickets && c.tickets.length)
				itemsSum += c.tickets.length
		})
		return itemsSum;
	};

	const categories = cartStore.getCart;
	const cardVariant = configurationStore.getConfiguration.cardVariant;
	const timer = Date.now() + cartStore.getTimer;
	const timerColor = cartStore.getTimer <= 5 * 60000 ? 'red' : 'black';
	const variantCountVar = getVariantNumber();

	return (
		<React.Fragment>
			<>
				
				<div className='cart-main-container'>
				<CustomHeader type={HeaderType.Title}
					text={Lang.format('Cart')}
					headerClassName='cart-title-header'

				/>
					{categories.length > 0 && (
						<div className='header-cart-container'>
							<div className="header-cart-top-section-container">

								<div>
									<CustomHeader
										type={HeaderType.Text}
										text={Lang.format('NumOfVariantsInCartNotice').replace('{{}}', getVariantNumber())}
									/>
									<CustomHeader
										headerClassName='no-color'
										type={HeaderType.Text}
										text={Lang.format('CancelAfter72Hours')}
									/>
									<CustomHeader
										headerClassName='no-color no-bold'
										type={HeaderType.Text}
										text={Lang.format('StockMayChangeNotice')}
									/>
									<CustomModal
										visible={popUpVisible}
										componentToRender={renderLimitaionModal()}
										onCancel={onCancel}
									/>
								</div>
							</div>
							{cartStore.hasEvents && (
								<div className={'eventim-time-notice-container'}>
									<CustomHeader
										type={HeaderType.Text}
										text={Lang.format('NoticeEventim')}
										headerClassName={'bold'}
									/>
									<div className='timer-container'>
										<CustomHeader
											type={HeaderType.Text}
											text={Lang.format('NoticeEventim15Min')}
											headerClassName={'no-color no-bold'}
										/>
										<CountDown
											value={timer}
											onFinish={onFinish}
										/>
									</div>
								</div>
							)}
							<div className='cart-without-header-wrapper'>
								<div className='cart-without-header'>
									<div className='allproduct-container'>
										<Products
											overLimit={overLimit}
											categories={categories}
											cart
											cardVariant={cardVariant}
											deleteCategory
											deleteVarient
											quantity={QuantityType.Edit}
											description
											onQuantityChanged={(v, c) => {
												setDisable(true)
												setVariantActive(v.barCode ? v.barCode : '')
												return onQuantityChange(v, c);
											}}
											variantActive={variantActive}
											onRemoveClicked={onRemoveClicked}
											onDeleteCategoryClicked={onDeleteCategoryClicked}
											isMint={isMint}
											accessToken={accessToken}
										/>
									</div>
									{/*}
								<div className='sum-allproduct-container'>
									<div className='sum-allproducts'>
										<div className='sum'>
											<span className='sum-item'>{Lang.format('TotalToPay')}:</span>
										</div>
										<div className='total'>
											<span className='total-item'>{`${StringFormatUtils.tryConvertToLocaleString(
												cartStore.getSumCart
											)} ₪`}</span>
										</div>
									</div>
								</div>
								*/}
								</div>
								<CustomMediaQuery.Desktop>
									<div className='sum-allproduct-container'>
										<CustomHeader type={HeaderType.Title}
											headerClassName={''}
											text={Lang.format('ItemsInCart')} />
										<CustomSeperator />
										<div className='sum-allproduct-container-inner'>
											<div style={{ fontWeight: 300 }} className='total-items-key'>
												{Lang.format('TotalCartItems')}:
											</div>
											<div style={{ fontWeight: 300 }} className='total-items-value'>{variantCountVar}</div>
										</div>
										<div className='sum-allproduct-container-inner'>
											<div className='total-sum-key'>
												{Lang.format('TotalToPay')}:
											</div>
											<div className='total-sum-value'>
												{`${StringFormatUtils.tryConvertToLocaleString(
													cartStore.getSumCart
												)} ₪`}
											</div>
										</div>
										<CustomButtonBeyahad
											buttonText={Lang.format('ContinueToPaymnet')}
											onClick={onPaymentClicked}
											customClass={'full-width'}
											disabled={disable}
										/>
									</div>
								</CustomMediaQuery.Desktop>
							</div>
						</div>
					)}
					{categories.length === 0 && (
						<ComponentContentEmpty history={history}
							text={messagesStore.emptyShoppingCart}
							isMint={isMint}
						/>
					)}
				</div>

				<CustomMediaQuery.Mobile>
					{categories.length !== 0 &&
						<div className='sum-allproduct-container'>
							<div className='sum-allproduct-container-inner'>
								<div className='total-sum-key'>
									{Lang.format('TotalToPay')}:
								</div>
								<div className='total-sum-value'>
									{`${StringFormatUtils.tryConvertToLocaleString(
										cartStore.getSumCart
									)} ₪`}
								</div>
							</div>
							<CustomButtonBeyahad
								buttonText={Lang.format('ContinueToPaymnet')}
								onClick={onPaymentClicked}
								customClass={'full-width'}
								disabled={disable}
							/>
						</div>
					}
				</CustomMediaQuery.Mobile>

			</>
		</React.Fragment>
	);
}
export default observer(CartContainer)
