import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config';
import BaseHTTPService from './BaseHTTPService';
import User from '../models/User';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';

class AccessTokenService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	async getUserTokenByAccessToken(accessToken: string) {
		try {
			const res = await this.httpGet(`/users/getSilentLoginMember?accessToken=${accessToken}`);
			if (res && res.status) {
				return res.data;
			}
			throw new Error('Error in response from getSilentLoginMember');
		} catch (err) {
			Logger.error(`error in getUserTokenByAccessToken`, err);
			throw err;
		}
	}

	getUserDataByAccessToken(accessToken: string | undefined) {
		return this.httpGet(`/users/getMemberByAccessToken?accessToken=${accessToken}`).then((res) => {
			const error = ErrorUtils.extractError(res);
			if (error) {
				throw error;
			}
			if (res && res.status) {
				return this.initUserFromResponseData(res.data.data);
			} else {
				throw new Error('Error in response from getUserDataByAccessToken');
			}
		});
	}

	private initUserFromResponseData(responseData: any) {
		let user: User = new User();
		user.identityNumber = responseData.identityNumber ? responseData.identityNumber : '';
		user.shouldUpdateorRegister = responseData.updateOrRegister ? responseData.updateOrRegister : '';
		return user;
	}
}

export default new AccessTokenService(ClientConfig.apiBaseHost);
