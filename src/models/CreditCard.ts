import {makeAutoObservable, observable} from 'mobx';

export default class CreditCard {
	@observable id: string = '';

	@observable ownerFirstName: string = '';

	@observable ownerLastName: string = '';

	@observable phoneNumberPrefix: string = '';
	@observable phoneNumber: string = '';
	@observable email: string = '';

	@observable cardNumber: string = '';

	@observable identity: string = '';

	@observable validateYear: string = '';
	@observable validateMonth: string = '';

	@observable cvv: string = '';

	@observable numOfPayments: any = '';

	@observable saveCard: boolean;

	constructor(data?: any) {
		makeAutoObservable(this);
		if (data) {
			this.id = data.id ? data.id : '';
			this.ownerFirstName = data.ownerFirstName ? data.ownerFirstName : '';
			this.ownerLastName = data.ownerLastName ? data.ownerFirstName : '';
			this.phoneNumber = data.phoneNumber ? data.phoneNumber : '';
			this.phoneNumberPrefix = data.phoneNumberPrefix ? data.phoneNumberPrefix : '';
			this.email = data.email ? data.email : '';
			this.cardNumber = data.cardNumber ? data.cardNumber : '';
			this.identity = data.identity ? data.identity : '';
			this.validateYear = data.validateYear ? data.validateYear : '';
			this.validateMonth = data.validateMonth ? data.validateMonth : '';
			this.cvv = data.cvv ? data.cvv : '';
			this.numOfPayments = data.numOfPayments ? data.numOfPayments : '';
			this.saveCard = data.saveCard ? data.saveCard : false;
		} else {
			this.id = '';
			this.ownerFirstName = '';
			this.ownerLastName = '';
			this.phoneNumber = '';
			this.phoneNumberPrefix = '';
			this.email = '';
			this.cardNumber = '';
			this.identity = '';
			this.validateYear = '';
			this.validateMonth = '';
			this.cvv = '';
			this.numOfPayments = '';
			this.saveCard = false;
		}
	}
}
