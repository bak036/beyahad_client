import * as _ from 'lodash';
import { action, computed, observable, toJS, IObservableArray, makeAutoObservable } from 'mobx';
import Lang from '../config/Language';
import Order from '../models/Order';
import { default as Orders } from '../models/Orders';
import OrdersHistoryService from '../services/OrdersHistoryService';
import AuthStore from './AuthStore';
import { Logger } from 'nofshonit-base-web-client';
import { BenefitType, BusinessSubType } from '../models/enums';

export default class OrdersHistoryStore {
	authStore: AuthStore;

	@observable
	orders: Orders;

	@observable
	oldHistoryLink: string;

	@observable
	businessNames: string[] = [];

	@observable orderArray: IObservableArray<any> = observable([]);

	@observable
	statusArray: any[] = [
		{ key: 'NotImplemented', value: `${Lang.format('NotImplemented')}` },
		{ key: 'Implemented', value: `${Lang.format('Implemented')}` },
		{ key: 'Canceled', value: `${Lang.format('Canceled')}` },
		{ key: 'InCancelProcess', value: `${Lang.format('InCancelProcess')}` },
		{ key: 'Expired', value: `${Lang.format('Expired')}` },
	];
	@observable
	businessSelected: string = '';
	@observable
	statusSelected: any = '';
	@observable
	disable: boolean = false;
	@observable
	lastOrder: any;
	@observable
	eventOrders: Order[];

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		// this.statusSelected = 'NotImplemented';
		makeAutoObservable(this)
	}

	@action
	setBusibessSelected = (selected) => {
		this.businessSelected = selected;
	};

	@action setLastOrder(order, creditCardUserIdentity) {
		this.lastOrder = {
			...order,
			creditCardUserIdentity,
		};
	}

	@action
	setOrdersArray = (orders) => {
		this.orderArray.replace(orders);
	};

	@action
	setStatusSelected = (selected) => {
		this.statusSelected = selected;
	};
	@action
	getHistory = async () => {

		try {
			const orders = await OrdersHistoryService.getOrdersHistory();
			this.orders = orders;
			const orderArray: any[] = this.orgnaizeOrders(this.getVariants, this.orgnizeEvents());
			this.setOrdersArray(orderArray);
		} catch (err) {
			throw err;
		}
	};
	@action
	getPopupBarcodeDetails = async (asmachta : string) =>{
		return await OrdersHistoryService.getPopupBarcodeDetails(asmachta);
	}
	@action
	setDisable = (value: boolean) => {
		this.disable = value;
	};

	@action
	initBussniessNames = () => {
		const orders = this.getOrders;
		let businessNames: string[] = [];
		orders.forEach((order) => {
			if (!businessNames.includes(order.businessName)) {
				businessNames.push(order.businessName);
			}
		});
		this.businessNames = businessNames;
	};
	@action
	loadBulkOrders = (page: number) => {

		let bulkOrders: any[] = [];
		let start = (page - 1) * 20;
		let end = page * 20;
		for (let i = start; i < end && i < this.getOrdersAndEvents.length; i++) {
			bulkOrders.push(this.getOrdersAndEvents[i]);
		}
		// if (page == 1) {
		// 	this.orgnizeEvents().forEach((event) => {
		// 		bulkOrders.push(event);
		// 	});
		// }
		return bulkOrders;
	};

	orgnaizeOrders = (varients: Order[], events: any[]) => {
		
		let orders: any[] = [];
		varients.forEach((v) => {
			orders.push(v);
		});
		events.forEach((e) => {
			orders.push(e);
		});
		return orders;
	};
	orgnizeEvents = () => {
		let eventsArray: any[] = [];
		let result = _.groupBy(this.getEvents, 'eventsGuid');

		for (let key in result) {
			const item = {
				eventsGuid: key,
				benefitId: result[key][0].benefitId,
				benefitStatusId: result[key][0].benefitStatusId,
				dtsRedimCode: result[key][0].dtsRedimCode,
				benefitStatusName: result[key][0].benefitStatusName,
				benefitTypeId: result[key][0].benefitTypeId,
				businessId: result[key][0].businessId,
				businessName: result[key][0].businessName,
				businessSubTypeId: result[key][0].businessSubTypeId,
				businessSubTypeName: result[key][0].businessSubTypeName,
				cancelDate: result[key][0].cancelDate,
				creditCard16Digits: result[key][0].creditCard16Digits,
				customerPrice: result[key].map((e) => e.customerPrice).reduce((total, num) => total + num),
				dateOfRedim: result[key][0].dateOfRedim,
				dtsOrderId: result[key][0].dtsOrderId,
				endDate: result[key][0].endDate,
				eventDate: result[key][0].eventDate,
				eventTime: result[key][0].eventTime,
				eventsTicketLink: result[key][0].eventsTicketLink,
				expiredDate: result[key][0].expiredDate,
				isCancelable: result[key][0].isCancelable,
				maxCancelDate: result[key][0].maxCancelDate,
				name: result[key][0].name,
				orderConfirmation: result[key][0].orderConfirmation,
				TTransactionOrder: result[key][0].TTransactionOrder,
				orderDate: result[key][0].orderDate,
				orderGuid: result[key][0].orderGuid,
				orderTicketId: result[key][0].orderTicketId,
				paymentToken: result[key][0].paymentToken,
				priceLevelName: result[key][0].priceLevelName,
				quantity: result[key][0].quantity,
				redimTypeId: result[key][0].redimTypeId,
				redimTypeName: result[key][0].redimTypeName,
				transactionID: result[key][0].transactionID,
				variantBarCode: result[key][0].variantBarCode,
				variantName: result[key][0].variantName,
				venueName: result[key][0].venueName,
				tickets: result[key].map((ticket, index) => {
					return {
						area: result[key][index].area,
						row: result[key][index].row,
						seat: result[key][index].seat,
						eventTicketType: result[key][index].eventTicketType,
						eventsTicketLink: result[key][index].eventsTicketLink,
						ticketTypeName: result[key][index].ticketTypeName,
					};
				}),
			};
			eventsArray.push(item);
		}
		return eventsArray;
	};
	@action
	cancelOrder = async (order: Order) => {
		return await OrdersHistoryService.cancelOrder(order);
	};

	@action
	validateCancelOrderAproove = async (order: Order) => {
		return await OrdersHistoryService.validateCancelOrderAproove(order.variantBarCode);
	};
	@action
	getConfirm = async (orderGuid) => {
		return await OrdersHistoryService.getConfirm(orderGuid);
	};

	@computed
	get getBusinessNames() {
		return toJS(this.businessNames);
	}

	getOldHistoryLink = async () => {
		try {
			const link = await OrdersHistoryService.getOldHistoryLink();
			if (link) {
				this.oldHistoryLink = link;
			}
		} catch (err) {
			Logger.error('error in getOldHistoryLink', err);
		}
	};

	@action
	shouldlShowCustomerServiceMessage = (order: any) => {
		const BusinessSubTypeId = order && order.businessSubTypeId;

		if (BusinessSubTypeId == BusinessSubType.TayarotHool) {
			return true;
		}

		// Check If This Variant Belongs To Hotels Or Consumerism (Not Coupon)
		if (BusinessSubTypeId == BusinessSubType.Hotels || BusinessSubTypeId == BusinessSubType.Consumerism) {
			// Check if canceling on the same day
			const orderDate = order && order.orderDate;
			const orderDay = new Date(orderDate).getDate();
			const orderMonth = new Date(orderDate).getMonth();
			const date = new Date();
			const isSameDay = orderDay == date.getDate() && orderMonth == date.getMonth();
			// Its not the same day, show customer service message
			if (isSameDay == false) {
				return true;
			}
		}
		return false;
	};

	@computed
	get getOrdersAndEvents() {
		let filltered: any[];
		let sorted: any[] = [];
		
		if (this.orderArray) {
			sorted = this.orderArray.slice().sort(function (a, b) {
				return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
			});

			if (this.businessSelected && this.statusSelected) {
				filltered = sorted.filter((order) => {
					return order.businessName === this.businessSelected && order.benefitStatusName === this.statusSelected;
				});
				return filltered;
			}
			if (this.businessSelected) {
				filltered = sorted.filter((order) => {
					return order.businessName === this.businessSelected;
				});
				return filltered;
			}
			if (this.statusSelected) {
				filltered = sorted.filter((order) => {
					return order.benefitStatusName == this.statusSelected;
				});
				return filltered;
			}
		}
		return sorted ? toJS(sorted) : [];
	}

	@computed
	get getOrders() {
		return this.orders && this.orders.variants ? toJS(this.orders.variants) : [];
	}

	@computed
	get getVariants() {
		let fillterVariants: Order[] = [];

		if (this.orders && this.orders.variants) {
			fillterVariants = this.getOrders.filter((v) => v.eventsGuid === null);
		}
		return fillterVariants;
	}

	@computed
	get getEvents() {
		let fillterdEvents: Order[] = [];
		if (this.orders && this.orders.variants) {
			fillterdEvents = this.getOrders.filter((order) => {
				return order.eventsGuid !== null;
			});
		}
		return fillterdEvents;
	}

	@computed
	get getLastOrder() {
		return toJS(this.lastOrder) || {};
	}
	@computed
	get getStatusArray() {
		return this.statusArray;
	}

	@computed
	get getDisable() {
		return this.disable;
	}
}
