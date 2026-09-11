import ClientConfig from '../config/index';
import BaseHTTPService from './BaseHTTPService';
import {Logger} from 'nofshonit-base-web-client';
import * as _ from 'lodash';

class BranchesService extends BaseHTTPService {
	constructor() {
		super(ClientConfig.apiBaseHost);
	}

	public async getBranches(walletId: number, chainId: number): Promise<any> {
		// Get shops list from server
		return this.httpGet(`/cards/GetWalletChainBranches?walletId=${walletId}&chainId=${chainId}`)
			.then((res: any) => {
				// TODO - remove this condition after adding resolver function to ajax
				return res && res.data && res.data.data ? res.data.data : [];
			})
			.then((branches: any) => {
				return branches;
			})
			.catch((error) => {
				Logger.debug(error);
			});
	}

	public async getBranchesNearMe(walletId: number, chainId: number, lat: number, lon: number): Promise<any> {
		return this.httpGet(`/cards/GetWalletChainBranchesNearMe?walletId=${walletId}&chainId=${chainId}&lat=${lat}&lon=${lon}`)
			.then((res: any) => {
				return res && res.data && res.data.data ? res.data.data : [];
			})
			.then((branches: any) => {
				return branches;
			})
			.catch((error) => {
				Logger.debug(error);
			});
	}
}

export default new BranchesService();
