import {action, computed, IObservableArray, makeAutoObservable, observable, toJS} from 'mobx';
import {Logger} from 'nofshonit-base-web-client';
import CartItem from '../models/CartItem';
import Category from '../models/Category';
import PaymentService from '../services/PaymentService';
import WalletService from '../services/WalletService';
import AuthStore from './AuthStore';
import Varient from '../models/Varient';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import Cart from '../models/Cart';

export default class CartStore {
	@observable code: string;
	@observable cartCopy: IObservableArray<CartItem> = observable([]);
	@observable coupon: string;

	@observable cartOne: IObservableArray<CartItem> = observable([]);

	@observable cardVariant: CartItem;
	@observable digitalCardVariant: CartItem;

	@observable cartPayment: IObservableArray<CartItem> = observable([]);
	@observable categoryListForGA: IObservableArray<CartItem> = observable([]);

	authStore: AuthStore;
	@observable timer: number = 0;

	@observable
	eventsGuid: string;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	setCartCopy = (cart) => {
		this.cartCopy.replace(cart);
	};

	@action
	setEventsGuid = () => {
		this.cartOne.forEach((cartItem) => {
			if (cartItem.tickets) {
				this.eventsGuid = cartItem.tickets[0].orderGuid;
			}
		});
	};

	@action
	setCardVariant = (cardVar: CartItem) => {
		this.cardVariant = cardVar;
	};

	@action
	init = () => {
		return WalletService.cartInit().then((res) => {
			this.setCartPayment(res);
			this.setCart(WalletService.organizeCart(res));
			this.setTime();
			this.setEventsGuid();
			return true;
		});
	};
	@action
	updateCart = async (barCode, quantity) => {
		try {
			const res = await WalletService.updateCart(barCode, quantity);
			this.setCartPayment(res);
			this.setCart(WalletService.organizeCart(res));
		} catch (err) {
			throw err;
		}
	};

	@action 
	updateCreditCardType = async (creditCardType) => {
		try {
			const res = await WalletService.creditCardType(creditCardType);
			this.setCartPayment(res);
			this.setCart(WalletService.organizeCart(res));
		} catch (err) {
			throw err;
		}
	};
	@action
	setCartPayment = (cart) => {
		if (cart) {
			this.cartPayment.replace(cart);
		}
	};

	@action
	setCart = (cartItems: any) => {
		if (cartItems) {
			this.cartOne.clear();
			this.cartOne.replace(cartItems);
		}
	};

	@action
	initConfig = async () => {
		const config = await NofhonitConfigurationLoader.loadConfiguration();
		this.cardVariant = new CartItem(config.cardVariant);
		this.digitalCardVariant = new CartItem(config.digitalCardVariant);
	};

	@action
	sendCopunRequest = (price, code) => {
		PaymentService.sendCopunRequest(price, code).catch((err) => {
			Logger.error(err);
		});
	};

	@action
	removeVareint = async (barcode) => {
		try {
			const res = await WalletService.removeVareint(barcode);
			this.setCartPayment(res);
			this.setTime();
			this.setCart(WalletService.organizeCart(res));
		} catch (err) {
			throw err;
		}
	};

	@action
	removeCategory = async (categoryId) => {
		return WalletService.removeCategory(categoryId).then((res) => {
			this.setCartPayment(res);
			this.setTime();
			this.setCart(WalletService.organizeCart(res));
		});
	};

	@action
	addToCart = (request) => {
		return WalletService.addToCart(request)
			.then((res) => {
				if (res) {
					this.setCartPayment(res);
					this.setCart(WalletService.organizeCart(res));
					this.setTime();
					this.setEventsGuid();
					return res;
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};

	@action
	setCouponCode = (coupon: string) => {
		this.coupon = coupon;
	};

	@computed
	get getCartForPayment() {
		return toJS(this.cartPayment) || [];
	}

	@computed
	get getCartCopy() {
		return toJS(this.cartCopy) || [];
	}
	@computed
	get getEventsGuid() {
		return toJS(this.eventsGuid) || '';
	}

	@computed
	get getCart() {
		return this.cartOne && this.cartOne.length > 0 ? toJS(this.cartOne) : [];
	}
	@computed
	get hasVariants() {
		return this.getCart && this.getCart[0] && this.getCart[0].variants;
	}

	@computed
	get getVariants() {
		let variants: Varient[] = [];
		if (this.hasVariants) {
			if (this.getCart) {
				this.getCart.forEach((category: CartItem) => {
					category &&
						category.variants &&
						category.variants.forEach((v) => {
							variants.push(v);
						});
				});
				return variants;
			}
			return [];
		} else {
			return [];
		}
	}

	@computed
	get getSumCart() {
		var sum = 0;
		const cart: CartItem[] = this.getCart;
		if (cart) {
			cart.forEach((category) => {
				if (category && category.variants) {
					category.variants.forEach((varient) => {
						sum += varient.quantity * varient.price;
					});
				}
				if (category && category.tickets) {
					category.tickets.forEach((ticket) => {
						sum += ticket.price;
					});
				}
			});
		}

		return sum;
	}

	@computed
	get hasConsumerProduct(): any {
		for (let i = 0; i < this.cartOne.length; i++) {
			if (this.cartOne[i].variants) {
				for (let j = 0; j < this.cartOne[i].variants.length; j++) {
					if (this.cartOne[i].variants[j].businessSubTypeId === 26) {
						return true;
					}
				}
			}
		}
		return false;
	}

	@computed
	get getCardVariant() {
		return this.cardVariant;
	}

	@computed
	get getDigitalCardVariant() {
		return this.digitalCardVariant;
	}

	@computed
	get getCoupon() {
		if (this.coupon) return this.coupon;
		else return '';
	}

	// TODO: Eliran - this is bad for performance!
	@computed
	get numOfPayment() {
		let numOfPayments: any[] = [];
		const sum = this.getSumCart;
		const hasEvents = this.hasEvents;

		if (hasEvents) {
			numOfPayments.push({key: 1, value: 'תשלום אחד'});
			numOfPayments.push({key: 2, value: 'שני תשלומים'});
			return numOfPayments;
		}

		if (sum >= 0) {
			numOfPayments.push({key: 1, value: 'תשלום אחד'});
		}
		if (sum > 150) {
			numOfPayments.push({key: 2, value: 'שני תשלומים'});
		}
		if (sum > 299) {
			numOfPayments.push({key: 3, value: 'שלושה תשלומים'});
		}
		if (sum > 499) {
			numOfPayments.push({key: 4, value: 'ארבעה תשלומים'});
		}
		if (sum > 699) {
			numOfPayments.push({key: 5, value: 'חמישה תשלומים'});
		}
		if (sum > 899) {
			numOfPayments.push({key: 6, value: 'שישה תשלומים'});
		}
		if (sum > 1199) {
			numOfPayments.push({key: 7, value: 'שבעה תשלומים'});
		}
		if (sum > 1399) {
			numOfPayments.push({key: 8, value: 'שמונה תשלומים'});
		}
		if (sum > 1599) {
			numOfPayments.push({key: 9, value: 'תשעה תשלומים'});
		}
		if (sum > 1799) {
			numOfPayments.push({key: 10, value: 'עשרה תשלומים'});
		}
		if (sum > 1999) {
			numOfPayments.push({key: 12, value: 'שניים עשר תשלומים'});
		}
		return numOfPayments;
	}

	@action
	setTime = () => {
		let time: number = 0;
		this.cartOne.forEach((cartItem: CartItem) => {
			if (cartItem.tickets) {
				time = new Date(cartItem.expireDate).getTime() - Date.now();
			}
		});
		this.timer = time;
	};

	@computed
	get getTimer() {
		return toJS(this.timer);
	}

	@computed
	get getEvents() {
		let events: CartItem[] = [];
		this.cartOne.forEach((cartItem: CartItem) => {
			if (cartItem.tickets) {
				events.push(cartItem);
			}
		});
		return events;
	}

	@computed
	get hasEvents() {
		let flag = false;
		this.cartOne.forEach((cartItem: CartItem) => {
			if (cartItem.tickets) {
				flag = true;
			}
		});
		return flag;
	}
}
