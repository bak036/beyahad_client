import {makeAutoObservable, observable} from 'mobx';
import Varient from './Varient';
import Ticket from './Ticket';

export default class CartItem {
	@observable id: string;

	@observable categoryId: string;

	@observable supplierName: string;

	@observable name: string;

	@observable productJsonForGA: string;

	@observable quantity: number;

	@observable images?: string[];

	@observable eventDate: Date;

	@observable expireDate: Date;
	@observable variants: Varient[];
	@observable tickets: Ticket[];

	@observable location?: string;

	@observable shortDescription?: string;

	@observable allowPriceZero: boolean = false;

	constructor(cartItem?: any) {
		makeAutoObservable(this);
		if (cartItem) {
			this.images = cartItem.images ? cartItem.images : [];
			this.eventDate = cartItem.expireDate ? cartItem.expireDate : '';
			this.location = cartItem.location ? cartItem.location : 'ישראל';
			this.quantity = cartItem.quantity ? cartItem.quantity : 0;
			this.categoryId = cartItem.categoryId;
			this.supplierName = cartItem.supplierName ? cartItem.supplierName : '';
			this.name = cartItem.name;
			this.variants = cartItem.variants ? cartItem.variants.map((x) => new Varient(x)) : [];
			this.shortDescription = cartItem.shortDescription ? cartItem.shortDescription : [];
			this.eventDate = cartItem.eventDate ? cartItem.eventDate : '';
			this.productJsonForGA = cartItem.productJsonForGA ? cartItem.productJsonForGA : '';
			// this.quantity = cartItem.quantity;
		} else {
			this.images = [];
			this.location = 'ישראל';
			this.categoryId = '0';
			this.supplierName = '';
			this.name = 'default';
			this.variants = [];
			this.quantity = 0;
			this.shortDescription = 'no data';
			this.eventDate = new Date(Date.now());
			// this.quantity = 0;
		}
	}
}
