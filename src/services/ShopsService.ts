import ClientConfig from '../config/index';
import Shop from '../models/Shop';
import BaseHTTPService from './BaseHTTPService';
import {Logger} from 'nofshonit-base-web-client';
import * as _ from 'lodash';

class ShopsService extends BaseHTTPService {
	constructor() {
		super(ClientConfig.apiBaseHost);
	}

	public async getShops(id: number): Promise<any> {
		// Get shops list from server
		return this.httpGet(`/cards/GetWalletChain?walletId=${id}`)
			.then((res: any) => {
				// TODO - remove this condition after adding resolver function to ajax
				return res && res.data && res.data.data ? res.data.data : [];
			})
			.then((shops: any) => {
				return shops;
			})
			.catch((error) => {
				Logger.debug(error);
			});
	}

	public async getShopsNearMe(id: number , lat : number , lon : number): Promise<any> {
	return this.httpGet(`/cards/GetWalletChainNearMe?walletId=${id}&lat=${lat}&lon=${lon}`)
		.then((res: any) => {
			return res && res.data && res.data.data ? res.data.data : [];
		})
		.then((shops: any) => {
			return shops;
		})
		.catch((error) => {
			Logger.debug(error);
		});
	}
}

export default new ShopsService();
