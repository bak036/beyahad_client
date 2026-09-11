import { observer } from 'mobx-react';
import { CustomSeperator } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { CART_STORE, MENU_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import CartStore from '../../../../stores/CartStore';
import Lang from '../../../../config/Language';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import MenuStore from '../../../../stores/MenuStore';
import { Router } from 'react-router';
import { Link } from 'react-router-dom';
import EditorMessage from '../../../../components/BeyhadComponents/EditorMessage/EditorMessage';
import { isNullOrUndefined } from 'util';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import { useState } from 'react';

interface IProps {
	history?: any;
}

interface IState {
	activeVarient: string;
}

const cartStore: CartStore = rootStores[CART_STORE];
const menuStore: MenuStore = rootStores[MENU_STORE];

const ShoppingCartHover : React.FC<IProps> = ({
	history
}) =>{

	const [activeVarient, setActiveVarient] = useState<string>(''); 

	const loadCart = () => {
		GoogleAnalyticsUtils.clickButtonAnalytics('cart_popup','cart_popup','click','cart');
		cartStore.init();
	};

	const deleteVariant = (item) => {
		setActiveVarient(item.barCode)
		menuStore.cartShow = true;
		menuStore.cartHoverShow = true;
		GoogleAnalyticsUtils.remove(item,cartStore.getCartForPayment);
		if (item.tickets) {
			cartStore.removeCategory(item.categoryId).finally(() => {
				setActiveVarient('')
			});
		} else {
			cartStore.removeVareint(item.barCode).finally(() => {
				setActiveVarient('')
			});
		}
		//this.moveToCartIfPaymentPage();
	};

	const moveToCartIfPaymentPage = () => {
		if (
			history &&
			history.location &&
			history.location &&
			history.location.pathname &&
			history.location.pathname.indexOf('/cart/payment') > -1
		) {
			history.push(RoutesPath.cart.root);
		}
	};

	const isMobile = window.innerWidth < 1025;
	return (
		<Router history={history}>
			<div className='by-shopping-cart-hover-main-contianer'>
				<div className='close' onClick={() => menuStore.toggleCartShow()}>X</div>
				<div className='by-shopping-cart-hover-top-items-contianer'>
					{cartStore.hasVariants || cartStore.getEvents.length > 0
						? cartStore.getVariants.map((item, index) => {
							const itemPrice = item && item.price ? item.price : 0;
							return (
								<div key={index}>
									<div className='by-shopping-cart-hover-top-contianer'>
										<div className='by-shopping-cart-hover-text'>
											<div className='by-shopping-cart-hover-text-headline'>
												{item && item.name ? item.name : ''}
											</div>
											<div className='by-shopping-cart-hover-text-content'>
												<p>{item && item.description && item.description == '' ? '' : item.description}</p>
											</div>
											<div className='by-shopping-cart-hover-text-price'>{`₪${StringFormatUtils.tryConvertToLocaleString(
												itemPrice
											)}`}</div>
										</div>
										<div className='by-shopping-cart-hover-bin'>
											<img
												className='bin-hover-image cursor-pointer'
												onClick={() => {
													if (activeVarient !== item.barCode) {
														deleteVariant(item);
													}
												}}
												src={require('../../../../assets/bin.png')}
												alt={Lang.format('DeleteProduct')}
												title={Lang.format('DeleteProduct')}
											/>
											<div>הסרה</div>
										</div>
									</div>
									{(index < cartStore.getVariants.length - 1 || cartStore.getEvents.length > 0) && <CustomSeperator />}
								</div>
							);
						})
						: <div className='shoping-basket-empty'>סל הקניות שלך ריק</div>}
					{cartStore.getEvents.length > 0
						? cartStore.getEvents.map((event, index) => {
							const eventTikets0Price =
								event && event.tickets && event.tickets[0] && event.tickets[0].price ? event.tickets[0].price : 0;
							return (
								<div key={index}>
									<div className='by-shopping-cart-hover-top-contianer'>
										<div className='by-shopping-cart-hover-text'>
											<div className='by-shopping-cart-hover-text-headline cursor-pointer'>
												{event && event.name ? event.name : ''}
											</div>
											<div className='by-shopping-cart-hover-text-content'>
												<EditorMessage
													doNotCheckLink={false}
													message={
														event && !isNullOrUndefined(event.shortDescription) ? event.shortDescription : ''
													}
												/>
											</div>
											<div className='by-shopping-cart-hover-text-price'>{`₪${StringFormatUtils.tryConvertToLocaleString(
												eventTikets0Price
											)}`}</div>
										</div>
										<div className='by-shopping-cart-hover-bin'
											onClick={() => {
												GoogleAnalyticsUtils.removeCartItem(event);
												cartStore.removeCategory(event.categoryId);
											}}>
											<img
												className='bin-hover-image cursor-pointer'
												src={require('../../../../assets/bin.png')}
												alt={Lang.format('DeleteProduct')}
												title={Lang.format('DeleteProduct')}
											/>
											<div>הסרה</div>
										</div>
									</div>
								</div>
							);
						})
						: null}
				</div>
				<CustomSeperator />
				<div className='by-shopping-cart-price-button-container'>
					<div className='total-payment'>
						<div className='by-shopping-cart-hover-middle-contianer'>סה"כ לתשלום</div>
						<div className='by-shopping-cart-hover-middle-contianer'>{cartStore.getSumCart} ש"ח</div>
					</div>
					<CustomSeperator />
					<div className={`by-shopping-cart-hover-buttom-contianer`}>
						<Link className={'cursor-pointer'} to={RoutesPath.cart.root} onClick={menuStore.toggleCartShow}>
							<button className={`redirect-button`} onClick={() => {loadCart;GoogleAnalyticsUtils.clickButtonAnalytics('cart_popup','cart_popup','click','cart');}}>
								{Lang.format('MyCart')}
							</button>
						</Link>
						<Link className={'cursor-pointer'} to={RoutesPath.cart.payment} onClick={() => {menuStore.toggleCartShow,GoogleAnalyticsUtils.clickButtonAnalytics('cart_popup','cart_popup','click','pay')}}>
							<button className='redirect-button'>{Lang.format('Pay')}</button>
						</Link>
					</div>
				</div>
			</div>
		</Router>
	);
}
export default observer(ShoppingCartHover)
