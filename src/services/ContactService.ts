import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config/index';
import {ContactReason} from '../stores/ContactStore';
import BaseHTTPService from './BaseHTTPService';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';

class ContactService extends BaseHTTPService {
	constructor(baseUrl) {
		super(baseUrl);
	}

	sendContactRequest(
		fullName: string,
		phoneNumber: string,
		id: string,
		description: string,
		email: string,
		contactReason: ContactReason,
	) {
		// Variable Definition
		const body = {
			FullName: fullName,
			IdentityNumber: id,
			mobilePhone: phoneNumber ? phoneNumber : '',
			CrmSubjectId: contactReason && contactReason.crmTypeID ? contactReason.crmTypeID : '',
			subject: contactReason && contactReason.crmTypeDescription ? contactReason.crmTypeDescription : '',
			Description: description,
			inputemail: email,
		};

		// Code Section
		return this.httpPost('/contact/openService', body).then((response) => {
			// Extract the error from the response (if has one)
			const error = ErrorUtils.extractError(response);
			if (error) {
				throw error;
			}

			// When no error field, return the data from the response
			if (response && response.data) {
				return response.data;
			} else {
				throw new Error('Response data not found');
			}
		});
	}
	getCrmTypes = () => {
		return this.httpGet('/contact/getCrmTypes').catch((err) => {
			Logger.error('error when getting "getCrmTypes"', err);
			return [];
		});
	};
}
export default new ContactService(ClientConfig.apiBaseHost);
