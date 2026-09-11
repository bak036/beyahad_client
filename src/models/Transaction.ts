import { makeAutoObservable, observable } from 'mobx';

export default class Transaction {
	@observable id: string;
	@observable dateTime: string;
	@observable transactionNumber: string;
	@observable activityTypeName: string;
	@observable activityID: string;
	@observable chainName: string;
	@observable amount: string;
	@observable businessName: string;
	@observable transactionAction: string;
	@observable totalPrice: number;
	@observable invoiceNumber: string;

	constructor(transaction?: Transaction) {
		makeAutoObservable(this);
		if (transaction) {
			this.id = transaction.id;
			this.dateTime = transaction.dateTime;
			this.transactionNumber = transaction.transactionNumber;
			this.activityTypeName = transaction.activityTypeName;
			this.amount = transaction.amount;
			this.activityID = transaction.activityID;
			this.chainName = transaction.chainName;
			this.businessName = transaction.businessName;
			this.transactionAction = transaction.transactionAction;
			this.totalPrice = transaction.totalPrice;
			this.invoiceNumber = transaction.invoiceNumber;
		}
	}
}
