import {makeAutoObservable, observable} from 'mobx';
import {NumberUtils} from 'nofshonit-base-web-client';
import Varient from './Varient';

export default class OrderDetails {
	@observable
	orderId: number;
	@observable
	email: string;
	@observable
	errorId: string;
	@observable
	firstName: string;
	@observable
	lastName: string;
	@observable
	currentUserId: string;
	@observable
	mobile: string;
	@observable
	orderConfirmation: string;
	@observable
	status: number;
	@observable
	numOfPayments;
	@observable
	totalPayements: number;
	@observable
	errorMessage: string;
	@observable
	variants: Varient[];

	constructor(order?: any) {
		makeAutoObservable(this);
		if (order) {
			this.orderId = order.DtsOrderId;
			this.email = order.Email;
			this.errorId = order.ErrorId;
			this.errorMessage = order.ErrorMessage;
			this.firstName = order.FirstName;
			this.lastName = order.LastName;
			this.mobile = order.Mobile;
			this.numOfPayments = order.NumOfPayments;
			this.totalPayements = order.TotalPayments;
			this.currentUserId = order.GetUserBalance ? order.GetUserBalance.DtsId : '';
			this.status = order.Status;
			this.variants = order.Variants ? order.Variants.map((x) => new Varient(x)) : [];
		} else {
			this.orderId = -1;
			this.email = '';
			this.errorId = '';
			this.errorMessage = '';
			this.firstName = '';
			this.lastName = '';
			this.mobile = '';
			this.numOfPayments = '';
			this.totalPayements = -1;
			this.currentUserId = '';
			this.status = -1;
			this.variants = [];
		}
	}
}
