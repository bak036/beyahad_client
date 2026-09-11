import { Logger } from 'nofshonit-base-web-client';
import ClientConfig from '../config/index';
import Lang from '../config/Language';
import Order from '../models/Order';
import { default as Orders } from '../models/Orders';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import BaseHTTPService from './BaseHTTPService';
import NofhonitConfigurationLoader, { SiteConfiguration } from '../utils/NofhonitConfigurationLoader';
const moment = require('moment');

class OrdersHistoryService extends BaseHTTPService {
	constructor() {
		super(ClientConfig.apiBaseHost);
	}

	getOldHistoryLink = async () => {

		try {
			const config: SiteConfiguration = await NofhonitConfigurationLoader.loadConfiguration();
			const oldHistWebsite = config.oldHistWebsite;
			const res = await this.httpGet('/purchases/purchaseHistoryOld');

			if (res && res.data && res.data.data) {
				const accessToken = res.data.data;
				const fullLink = oldHistWebsite + accessToken;
				return fullLink;
			} else {
				throw new Error('no link for the old "hist" website');
			}
		} catch (err) {
			Logger.error('error occurd in getOldHistoryLink', err);
			throw err;
		}
	};

	getOrdersHistory = async () => {

		const body = {
			FromDate: moment(new Date('2018-01-01T00:00:00')).format('YYYY-MM-DDTHH:mm:ss'),
			ToDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
			BenefitStatusId: null,
		};
		const orders = await this.httpPost('/purchases/purchaseHistory', body);
		const error = ErrorUtils.extractError(orders);
		if (error) {
			throw error;
		}

		if (orders && orders.data && orders.data.data) {
			return this.convertFromApiToOurObject(orders.data.data);
		} else {
			throw new Error('לא נמצאה היסטוריית הזמנות, נסה שנית מאוחר יותר');
		}
	};
	getPopupBarcodeDetails = async (asmachta:string) =>{
		return this.httpGet('/order/GetPopupBarcodeDetails?asmachta='+asmachta)
	}

	cancelOrder = async (order) => {
		const url = '/order/cancel';
		let body = {
			orderGuid: order.orderGuid,
			variantBarCode: order.variantBarCode,
			orderConfirmation: order.TTransactionOrder.toString(),
		};
		try {
			const res = await this.httpPost(url, body);
			const error = ErrorUtils.extractError(res);

			if (error) {
				throw error;
			}
			if (res && res.data && res.data.status) {
				return res.data.data;
			} else {
				throw new Error('פעולת הביטול נכשלה');
			}
		} catch (err) {
			throw err;
		}
	};

	validateCancelOrderAproove = async (barcode) => {
		const url = '/order/IsCancelRequriedAproove?barCode=' + barcode;


		try {
			const res = await this.httpGet(url);
			const error = ErrorUtils.extractError(res);

			if (error) {
				throw error;
			}
			if (res && res.status) {
				return res.data.data;
			}
		} catch (err) {
			throw err;
		}
	};
	getConfirm = async (orderGuid) => {
		const body = {
			orderGuid,
		};
		try {
			const result = await this.httpPost('/order/getConfirmationPage', body);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (!result || !result.data || !result.data.data) {
				throw new Error(`${Lang.format('DataNotFound')}`);
			} else {
				return result.data.data;
			}
		} catch (err) {
			throw err;
		}
	};
	convertFromApiToOurObject = (orders: any) => {
		const o = new Orders();
		o.fromDate = orders.FromDate;
		o.toDate = orders.ToDate;
		o.variants = orders.variants.map((x) => this.convertVariant(x));

		return o;
	};

	convertVariant = (order: any) => {
		const v = new Order();
		(v.eventsGuid = order.eventsGuid ? order.eventsGuid : null), (v.benefitId = order.benefitId);
		v.TTransactionOrder = order.tTransactionOrder;
		v.transactionID = order.tTransactionID;
		v.quantity = order.quantity;
		v.benefitStatusId = order.benefitStatusId;
		v.dtsRedimCode = order.dtsRedimCode;
		v.benefitStatusName = order.benefitStatusName;
		v.benefitTypeId = order.benefitTypeId;
		v.businessId = order.businessId;
		v.businessName = order.businessName;
		v.area = order.ticketArea;
		v.businessSubTypeId = order.businessSubTypeId;
		v.cancelDate = order.cancelDate;
		v.creditCard16Digits = order.creditCard16Digits;
		v.creditCardExpirey = order.creditCardExpirey;
		v.customerPrice = order.customerPrice;
		v.dateOfRedim = order.dateOfRedim;
		v.dtsOrderId = order.dtsOrderId;
		v.endDate = order.endDate;
		v.eventDate = order.eventDate;
		v.row = order.eventRow;
		v.seat = order.eventSeat;
		v.eventTicketType = order.eventTicketType;
		v.eventTime = order.eventTime;
		v.eventsTicketLink = order.eventsTicketLink;
		v.expiredDate = order.expiredDate;
		v.giftCardBalance = order.giftCardBalance;
		v.giftCardValue = order.giftCardValue;
		v.isCancelable = order.isCancelable;
		v.isSendToFriend = order.isSendToFriend;
		v.maxCancelDate = order.maxCancelDate;
		v.movieLink = order.movieLink;
		v.name = order.name;
		v.orderDate = order.orderDate;
		v.orderTicketId = order.orderTicketId;
		v.paymentToken = order.paymentToken;
		v.priceLevelName = order.priceLevelName;
		v.variantName = order.variantName;
		v.digitalCodeType = order.digitalCodeType;
		v.venueName = order.venueName;
		v.orderConfirmation = order.orderConfirmation;
		v.variantBarCode = order.variantBarCode;
		v.orderGuid = order.orderGuid;
		v.businessAddress = order.businessAddress;
		v.businessStreetNumber = order.businessStreetNumber;
		v.businessCity = order.businessCity;
		v.businessPhoneNumber = order.businessPhoneNumber;
		v.trackingNumber = order.trackingNumber;
		v.trackingWebsite = order.trackingWebsite;
		v.orderStatus = order.orderStatus;
		v.deliveryModeDescription = order.deliveryModeDescription;
		v.deliveryAddress = order.deliveryAddress;
		v.isDisplayButton = order.isDisplayButton;
		v.IsExternalCoupon = order.isExternalCoupon;
		return v;
	};
}

export default new OrdersHistoryService();
