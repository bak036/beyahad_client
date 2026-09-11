import ClientConfig from '../config';
import BaseHTTPService from './BaseHTTPService';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import {Logger} from 'nofshonit-base-web-client';

class ProfileService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	getAllRegions = () => {
				return this.httpGet('/addresses/GetRegions').then((res) => {
			if (res && res.data && res.data.data) {
				return res.data.data;
			} else {
				return null;
			}
		});
	};

	blockCard = () => {
		return this.httpPost('/cards/BlockCard', {})
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}
				if (res && res.data) {
					return true;
				} else {
					throw new Error('Response data not found');
				}
			})
			.catch((err) => {
				throw err;
			});
	};

	sendCardMemberOnSMS = () => {
		return this.httpPost(`/users/userSlinkSMS`, {})
			.then((response) => {
				const error = ErrorUtils.extractError(response);
				if (error) {
					throw error;
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling using "loginWithToken"', err);
				throw err;
			});
	};
	possibleToOrderCard = async () => {
		try {
			const allow = await this.httpGet('/cards/GetNewCardOrderPossible');
			const error = ErrorUtils.extractError(allow);
			if (error) {
				throw error;
			}
			return allow.data;
		} catch (err) {
			throw err;
		}
	};
	GetCardDetailsByCardNumber = async(cardNumber:string) =>{
		return this.httpGet(`/cards/GetCardDetailsByCardNumber?cardNumber=${cardNumber}`).then((res) => {
			if (res && res.data && res.data.data) {
				return res.data.data;
			} else {
				return null;
			}
		});
	}

}

export default new ProfileService(ClientConfig.apiBaseHost);
