import {makeAutoObservable, observable} from 'mobx';
import CartItem from './CartItem';
export default class Cart {
	@observable id: string;

	cartItems: CartItem[];

	constructor(cart?: any) {
		makeAutoObservable(this);
		if (cart) {
			cart.map((cartItem) => {
				const item = new CartItem(cartItem);
				this.cartItems.push(item);
			});
		} else {
			this.id = '1';
			this.cartItems = [];
		}
	}
}
