import {observer} from 'mobx-react';
import * as moment from 'moment';
import {CustomButton, CustomHeader, CustomSpan, HeaderType} from 'nofshonit-base-web-client';
import CustomLink from '../../../CustomComponents/CustomLink/CustomLink';
import * as React from 'react';
import Lang from '../../../../config/Language';
import {CART_STORE, ORDERS_HISTORY_STORE} from '../../../../consts/stores';
import rootStores from '../../../../stores';
import CartStore from '../../../../stores/CartStore';
import OrdersHistoryStore from '../../../../stores/OrdersHistoryStore';
import TagsAdvertisment from '../../CustomService/Advertisement/TagsAdvertisment/TagsAdvertisment';
import Products from '../Products/Products';
import { forEach, set } from 'lodash';
import CustomButtonBeyahad from '../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import {CustomMediaQuery} from '../../../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
	isMint?: boolean;
	accessToken?: string;
	setAccess: (accessPaymnnent: boolean) => void;

}
interface IState {
	printMode: boolean;
	printHTML: string;
}

const cartStore: CartStore = rootStores[CART_STORE];
const orderHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];

const ThanksPaymnet : React.FC<Props> = ({
	history,
	isMint,
	accessToken,
	setAccess
}) => {

	const [printMode, setPrintMode] = useState<boolean>(false);
	const [printHTML, setPrintHTML] = useState<string>('');
	
	const printScreenClicked = () => {
		setPrintMode(true);
		setTimeout(() => window.print(), 1000);
	};

	const closePrintWindow = () => {
		setPrintMode(false);
	};

	useEffect(() => {
		const orderGuid = orderHistoryStore && orderHistoryStore.getLastOrder && orderHistoryStore.getLastOrder.orderGuid;
		orderHistoryStore.getConfirm(orderGuid).then((res) =>
			setPrintHTML(res)
		)
			return () => {
		setAccess(false);
	};
	},[])


	const returnHomePageClicked = () => {
		if (history) history.push('/');
	};

	const returnHistoryPageClicked = () => {
		if (history) history.push('/profile/orderHistory');
	};

	const renderDetailsHeaders = () => { return Object.keys(getDetailsList()).map(dh => (<TextCustomItemComponent text={Lang.format(dh)} isBold={true} />)) }

	const renderDetailsMobile = () => {
		const details = getDetailsList();
		return (
			Object.keys(details).map(dh => (
				<div className='thanks_details_row'>
					<div className='thanks_details_item'>
						<TextCustomItemComponent text={Lang.format(dh)} isBold={true} />
					</div>
					<div className='thanks_details_item'>
						<TextCustomItemComponent text={Lang.format(details[dh])} />
					</div>
				</div>
			))
		)
	}

	const getDetailsList = ()=>{
		let cardNumber =
		orderHistoryStore &&
		orderHistoryStore.authStore &&
		orderHistoryStore.authStore.currentUser &&
		orderHistoryStore.authStore.currentUser.cardNumber;
		const orderDetails = orderHistoryStore.getLastOrder;

		const date = moment(`${new Date()}`).format('DD/MM/YYYY');

		return {
			ThanksOrderNumber: `${orderDetails.dtsOrderId}`,
			ThanksCardNumber: cardNumber,
			ThanksTZNumber: `${orderDetails.creditCardUserIdentity}`,
			ThanksPayerName: `${orderDetails.firstName} ${orderDetails.lastName}`,
			ThanksOrderDate: date,
			ThanksPaymentsNumber: `${orderDetails.numOfPayments}`,
			ThanksPaymentSum: `${orderDetails.totalPayments} ₪`
		}
	}

		const orderDetails = orderHistoryStore.getLastOrder;

		let categories: any = cartStore.getCartCopy;
		categories = orderDetails.totalPayments == 0 ? categories.filter((c) => c.allowPriceZero == true) : categories;

		categories.forEach((cat, i) => {
			if (cat.variants){
				cat.variants.forEach((variant: any) => {
					const orderedItems = orderDetails.variants.filter(orederVar => orederVar.variantBarCode === variant.barCode);
					if (orderedItems.length > 0) {
						variant.price = orderedItems[0].moneyPay;
					}
				});
			}
			if (cat.tickets){
				cat.tickets.forEach((ticket: any) => {
					const orderedItems = orderDetails.variants.filter(orederVar => orederVar.variantBarCode === ticket.variantFullBarcode);
					if (orderedItems.length > 0) {
						ticket.price = orderedItems[0].moneyPay;
					}
				});
			}
		});

		console.log(orderDetails);

		let cardNumber =
			orderHistoryStore &&
			orderHistoryStore.authStore &&
			orderHistoryStore.authStore.currentUser &&
			orderHistoryStore.authStore.currentUser.cardNumber;
		const date = moment(`${new Date()}`).format('DD/MM/YYYY');
		
		return (
			<>
			<CustomMediaQuery.Desktop>
				{printMode && (
					<div className='print-order'>
						<div className='print-close-btn' onClick={closePrintWindow}>
							{Lang.format('ClosePrintWindow')}
						</div>
						<div className='print-text' dangerouslySetInnerHTML={{__html: printHTML}}></div>
					</div>
				)}
				<div className='main-thanks-container'>
					<div className='title-without-border'>
						<div className='logo-container'>
							<img className='v-logo-img' src={require('../../../../assets/icons/approve.svg')} />
						</div>
						<CustomHeader type={HeaderType.Title} text={`${Lang.format('Thanks')} ${Lang.format('ThanksPayment')}`} />
						<CustomButtonBeyahad
						onClick={returnHomePageClicked}
						isCurserPointer={true}
						buttonText = {Lang.format('BackToHomePage')}
					/>
						<div className='text-with-undeline'
							onClick={returnHistoryPageClicked}
						>
							{Lang.format('ShowHistory')}
						</div>
					</div>

					<div className='content-with-products'>
						<div className='main-thanks-content'>
							<div className='order-detail-text'>
								<div className='order-detail-header'>
								<CustomHeader
										text={Lang.format('OrderInfo')}
										headerClassName='bold'
										type={HeaderType.SubTitle}
									/>
								<CustomButtonBeyahad
										customClass = {'white narrow'}
										onClick={printScreenClicked}
										isCurserPointer={true}
										buttonText = {Lang.format('Print')} />
								</div>
								<div className='order-header-text-container'>
									{renderDetailsHeaders()}
								</div>
								<div className='order-detail-text-container'>
									<TextCustomItemComponent 
											text={`${orderDetails.dtsOrderId}`} />
										<TextCustomItemComponent 
											text={cardNumber} />	
										<TextCustomItemComponent 
											text={orderDetails.creditCardUserIdentity} />	
										<TextCustomItemComponent 
											text={`${orderDetails.firstName} ${orderDetails.lastName}`} />	
										<TextCustomItemComponent 
											text={date} />	
										<TextCustomItemComponent 
											text={`${orderDetails.numOfPayments}`} />	
										<TextCustomItemComponent 
											text={`${orderDetails.totalPayments} ₪`}/>																		
								</div>
							</div>
						</div>
						<div className='product-list-container'>
							<CustomHeader
											text={Lang.format('ProductsOrdered')}
											headerClassName='bold'
											type={HeaderType.SubTitle}
							/>

							<div className='allproduct-container'>
								<Products
									categories={categories}
									thanksPayment={true}
									history={history}
									accessToken={accessToken}
									isMint={isMint}
								/>
								<div className='sum-allproducts' />
							</div>
						</div>
					</div>
					{!isMint ? (
						<div className='tags-contianer'>
							<TagsAdvertisment tags={1} history={history} />
						</div>
					) : null}
				</div>
				</CustomMediaQuery.Desktop>

				<CustomMediaQuery.Mobile>
				
				{printMode && (
					<div className='print-order'>
						<div className='print-close-btn' onClick={closePrintWindow}>
							{Lang.format('ClosePrintWindow')}
						</div>
						<div className='print-text' dangerouslySetInnerHTML={{__html: printHTML}}></div>
					</div>
				)}
				<div className='main-thanks-container'>
					<div className='title-without-border'>
						<div className='logo-container'>
							<img className='v-logo-img' src={require('../../../../assets/icons/approve.svg')} />
						</div>
						<CustomHeader type={HeaderType.Title} text={`${Lang.format('Thanks')} ${Lang.format('ThanksPayment')}`} />
						<CustomLink
							text={Lang.format('BackToHomePage')}
							onClick={returnHomePageClicked}
						/>
						<br></br>
						<CustomLink
							text={Lang.format('ShowHistory')}
							onClick={returnHistoryPageClicked}
						/>
					</div>

					<CustomButtonBeyahad
						customClass = {'white narrow'}
						onClick={printScreenClicked}
						isCurserPointer={true}
						buttonText = {Lang.format('Print')} />

					<div className='order-detail-header'>
						<CustomHeader
								text={Lang.format('OrderInfo')}
								headerClassName='bold'
								type={HeaderType.SubTitle}
							/>
					</div>
					
					<div className='content-with-products'>
						<div className='main-thanks-content'>
							<div className='order-detail-text'>
								{renderDetailsMobile()}
							</div>
						</div>

						<div className='product-list-container'>
							<CustomHeader
											text={Lang.format('ProductsOrdered')}
											headerClassName='bold'
											type={HeaderType.SubTitle}
							/>

							<div className='allproduct-container'>
								<Products
									categories={categories}
									thanksPayment={true}
									history={history}
									accessToken={accessToken}
									isMint={isMint}
								/>
								<div className='sum-allproducts' />
							</div>
						</div>
					</div>
					{!isMint ? (
						<div className='tags-contianer'>
							<TagsAdvertisment tags={1} history={history} />
						</div>
					) : null}
				</div>						

				</CustomMediaQuery.Mobile>	
			</>
		);
	}
	export default observer(ThanksPaymnet);
