import {makeAutoObservable, observable} from 'mobx';
import {OrderStatus} from './enums';

export default class Order {
	@observable
	benefitId: string;
	@observable
	benefitStatusId: number;
	@observable
	benefitStatusName: OrderStatus;
	@observable
	dtsRedimCode: string;
	@observable
	benefitTypeId: number;
	@observable
	businessId: string;
	@observable
	businessName: string;
	@observable
	businessSubTypeId: string;
	@observable
	businessSubTypeName: string;
	@observable
	cancelDate: Date;
	@observable
	creditCard16Digits: string;
	@observable
	creditCardExpirey: string;
	@observable
	customerPrice: string;
	@observable
	dateOfRedim: string;
	@observable
	dtsOrderId: number;
	@observable
	orderDate: Date;
	@observable
	expiredDate: Date;
	@observable
	endDate: Date;
	@observable
	isSendToFriend: number;
	@observable
	giftCardValue: string;
	@observable
	giftCardBalance: number;
	@observable
	isCancelable: number;
	@observable
	maxCancelDate: Date;
	@observable
	paymentToken: string;
	@observable
	redimTypeId: number;
	@observable
	redimTypeName: string;
	@observable
	eventsTicketLink: string;
	@observable
	movieLink: string;
	@observable
	row: string;
	@observable
	seat: string;
	@observable
	eventDate: string;
	@observable
	eventTime: string;
	@observable
	venueName: string;
	@observable
	priceLevelName: string;
	@observable
	eventTicketType: number;
	@observable
	ticketTypeName: string;
	@observable
	orderTicketId: string;
	@observable
	variantName: string;
	@observable
	digitalCodeType : number;
	@observable
	orderConfirmation: string;
	@observable
	name: string;
	@observable
	variantBarCode: string;
	@observable
	orderGuid: string;
	@observable
	quantity: number;
	@observable
	transactionID: number;
	@observable
	eventsGuid: string;
	@observable
	area: string;
	@observable 
	TTransactionOrder: number;
	@observable 
	businessAddress: string;
	@observable 
	businessStreetNumber: string;
	@observable 
	businessCity: string;
	@observable 
	businessPhoneNumber: string;
	@observable 
	trackingNumber: string;
	@observable 
	trackingWebsite: string;
	@observable 
	orderStatus: string;
	@observable 
	deliveryModeDescription: string;
	@observable
	deliveryAddress: string;
	@observable
	isDisplayButton:boolean;
	@observable
	IsExternalCoupon: boolean;


	constructor(item?: any) {
		makeAutoObservable(this);
		if (item) {
			this.eventsGuid = item.eventsGuid ? item.eventsGuid : null;
			this.variantBarCode = item.variantBarCode;
			this.variantName = item.variantName ? item.variantName : '';
			this.digitalCodeType = item.digitalCodeType;
			this.name = item.name ? item.name : '';
			this.benefitId = item.benefitId;
			this.orderConfirmation = item.orderConfirmation;
			this.benefitStatusId = item.benefitStatusId;
			this.dtsRedimCode = item.dtsRedimCode;
			this.quantity = item.quantity;
			this.benefitStatusName = item.benefitStatusName;
			this.transactionID = item.transactionID;
			this.benefitTypeId = item.benefitTypeId;
			this.area = item.area;
			this.businessId = item.businessId;

			this.businessSubTypeName = item.businessSubTypeName;

			this.businessSubTypeId = item.businessSubTypeId;

			this.businessSubTypeName = item.businessSubTypeName;

			this.cancelDate = item.cancelDate;
			this.creditCard16Digits = item.creditCard16Digits;
			this.creditCardExpirey = item.creditCardExpirey;
			this.customerPrice = item.customerPrice;
			this.dateOfRedim = item.dateOfRedim;
			this.dtsOrderId = item.dtsOrderId;

			this.orderDate = item.orderDate;
			this.expiredDate = item.expiredDate;
			this.endDate = item.endDate;
			this.isSendToFriend = item.isSendToFriend;

			this.giftCardValue = item.giftCardValue;
			this.giftCardBalance = item.giftCardBalance;
			this.isCancelable = item.isCancelable;
			this.maxCancelDate = item.maxCancelDate;
			this.paymentToken = item.paymentToken;
			this.redimTypeId = item.redimTypeId;
			this.redimTypeName = item.redimTypeName;
			this.eventsTicketLink = item.eventsTicketLink;
			this.movieLink = item.movieLink;
			this.row = item.row;
			this.seat = item.seat;
			this.eventTime = item.eventTime;
			this.venueName = item.venueName;
			this.priceLevelName = item.priceLevelName;
			this.eventTicketType = item.priceLevelName;
			this.ticketTypeName = item.ticketTypeName;
			this.orderTicketId = item.orderTicketId;
			this.businessAddress = item.businessAddress;
			this.businessStreetNumber = item.businessStreetNumber;
			this.businessCity = item.businessCity;
			this.businessPhoneNumber = item.businessPhoneNumber;
			this.trackingNumber = item.trackingNumber;
			this.trackingWebsite = item.trackingWebsite;
			this.orderStatus = item.orderStatus;
			this.deliveryModeDescription = item.deliveryModeDescription;
			this.deliveryAddress = item.deliveryAddress;
			this.isDisplayButton = item.isDisplayButton;
			this.IsExternalCoupon = item.IsExternalCoupon;
		} else {
			this.variantName = '';
			this.name = '';
		}
	}
}
