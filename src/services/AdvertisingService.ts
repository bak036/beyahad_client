import BaseHTTPService from './BaseHTTPService';
import { Logger } from 'nofshonit-base-web-client';
import ClientConfig from '../config';

class AdvertisingService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	async getImagesSlider() {
		try {
			const res = await this.httpGet(`/media/GetImagesSlider`);
			if (res && res.status) {
				const advertisement = res.data.data;
				return advertisement;
			}
			throw new Error('Error in response from getImagesSlider');
		} catch (err) {
			Logger.error(`error in getImagesSlider`, err);
			throw err;
		}
	}

	async getCommercial() {
		try {
			const res = await this.httpGet(`/media/GetCommercial`);
			if (res && res.status) {
				const commercial = res.data.data;
				return commercial;
			}
			throw new Error('Error in response from getCommercial');
		} catch (err) {
			Logger.error(`error in getCommercial`, err);
			throw err;
		}
	}
	async addReferralHistory(externalLlink: string, ineerLlink: string) {
		const body = {
			MemberId: '',
			OrgId: 0,
			ExternalLlink: externalLlink,
			ineerLlink: ineerLlink,
			LastUpdateMember: new Date()
		};
		try {
			return await this.httpPost('/media/AddReferralHistory', body)

		} catch (err) {
			Logger.error(`error in addReferralHistory`, err);
			return null;
		}

	}
}

export default new AdvertisingService(ClientConfig.apiBaseHost);
