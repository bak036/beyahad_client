import { Logger } from "nofshonit-base-web-client";
import ClientConfig from "src/config";
import User from "src/models/User";
import ErrorUtils from "src/utils/errorHandling/ErrorUtils";
import BaseHTTPService from "./BaseHTTPService";


class BiometricsService extends BaseHTTPService {
	constructor() {
		super(ClientConfig.apiBaseHost);
	}

	public async UpdateBiometricToken(memberId: string, publicKey: string | null): Promise<any> {
		// Get shops list from server
		const body = { memberId, publicKey };
		return this.httpPost(`/users/UpdateBiometricToken`, body)
			.then((res: any) => {
				// TODO - remove this condition after adding resolver function to ajax
				return res && res.data && res.data.data ? res.data.data : [];
			})
			.then((status: any) => {
				return status;
			})
			.catch((error) => {
				Logger.debug(error);
			});
	}
}

export default new BiometricsService();