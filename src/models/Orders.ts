import Category from './Category';
import Varient from './Varient';
import {makeAutoObservable, observable} from 'mobx';
import Order from './Order';

export default class Orders {
	@observable
	fromDate: Date;
	@observable
	toDate: Date;
	@observable
	variants: Order[];

	constructor(orders?: any) {
		makeAutoObservable(this);
		// Code Section
		if (orders) {
			this.fromDate = orders.fromDate;
			this.toDate = orders.toDate;
			this.variants = orders.variants ? orders.variants.map((x) => new Order(x)) : [];
		}
	}
}
