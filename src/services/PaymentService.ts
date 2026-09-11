import ClientConfig from '../config';
import Address from '../models/Address';
import CreditCard from '../models/CreditCard';
import BaseHTTPService from './BaseHTTPService';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import { CreditCardType } from '../models/enums';
import Lang from '../config/Language';

class PaymentService extends BaseHTTPService {
	async sendPaymnent(
		creditCard: CreditCard,
		totalPrice,
		shoppingBasketCart,
		shortCode,
		eventsGuid,
		creditCardType?: CreditCardType,
		address?: Address
	) {
		let body;
		if (address) {
			body = {
				firstName: creditCard.ownerFirstName,
				lastName: creditCard.ownerLastName,
				mobile: `${creditCard.phoneNumberPrefix}${creditCard.phoneNumber}`,
				email: creditCard.email,
				identity: creditCard.identity,
				creditCardExpirey: `${creditCard.validateMonth}${creditCard.validateYear}`,
				creditCard16Digits: creditCard.cardNumber,
				cvv: creditCard.cvv,
				totalPayment: totalPrice,
				numOfPayments: creditCard.numOfPayments,
				pinCode: shortCode,
				shoppingBasketCart,
				city: address.city,
				streetName: address.streetName,
				zipCode: address.postalCode,
				PayWithRegularCard: creditCardType == CreditCardType.RegularCard,
				// houseNumber called streentNumber in this project.....
				houseNumber: address.streetNumber,
				apartmentNumber: address.apartmentNumber,
				eventsGuid: '', //dont change it keep it empty !!!
				entrance: address.entrance,
				mailbox: address.mailbox
			};
		} else {
			body = {
				firstName: creditCard.ownerFirstName,
				lastName: creditCard.ownerLastName,
				identity: creditCard.identity,

				mobile: `${creditCard.phoneNumberPrefix}${creditCard.phoneNumber}`,
				email: creditCard.email,
				creditCardExpirey: `${creditCard.validateMonth}${creditCard.validateYear}`,
				creditCard16Digits: creditCard.cardNumber,
				cvv: creditCard.cvv,
				totalPayment: totalPrice,
				numOfPayments: creditCard.numOfPayments,
				pinCode: shortCode,
				shoppingBasketCart,
				PayWithRegularCard: creditCardType == CreditCardType.RegularCard,
				eventsGuid,
			};
		}
    
		return await this.httpPost('/order/purchase', body)
			.then((res) => {
				 const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}
				if (res && res.data && res.data.data && res.data.status) {
					return res.data.data;
				} else {
					throw new Error('purchase request faild.');
				}
			})
			.catch((err) => {
				throw err;
			});
	}

	getCopunPath = (code, price) => {
		return `/CouponsExternalApi/GetCouponDiscount?couponCode=${code}&price=${price}`;
	};

	sendCopunRequest = (code, price) => {
		const body = {
			price,
			couponCode: code,
		};
		return this.httpPost(this.getCopunPath(code, price), {});
	};
}

export default new PaymentService(ClientConfig.apiBaseHost);
