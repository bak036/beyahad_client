import { Logger } from 'nofshonit-base-web-client';
import NofhonitStorage from 'src/utils/NofhonitStorage';
import { AUTH_STORE, CONFIGURATION_STORE, MESSAGES_STORE } from '../consts/stores';
import rootStores from '../stores';
import { AxiosHttp, IHttp } from './HttpClient';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import MessagesStore from 'src/stores/MessagesStore';
import AuthStore from 'src/stores/AuthStore';

const OrganizationId = '48';

/**
 * Base class for HTTP handling
 * All service classes should be derived from this class
 */

class BaseHTTPService {
	authStore: AuthStore | null = rootStores ? rootStores[AUTH_STORE] : null;
	messageStore: MessagesStore | null = rootStores ? rootStores[MESSAGES_STORE] : null;
	configurationStore: ConfigurationStore | null = rootStores ? rootStores[CONFIGURATION_STORE] : null;
	http: IHttp;
	baseUrl: string;

	constructor(baseUrl: string, http?: IHttp) {
		if (!baseUrl) {
			throw new Error(`Erorr in creating Http service with baseUrl: ${baseUrl}`);
		}

		// Init baseUrl & http
		this.baseUrl = baseUrl;

		// Init IHttp
		if (http) {
			this.http = http;
		} else {
			this.http = new AxiosHttp();
		}
	}

	async httpGet(relativeUrl: string, headers?: any) {
		this.authStore = this.authStore ? this.authStore : rootStores ? rootStores[AUTH_STORE] : null;
		this.messageStore = this.messageStore ? this.messageStore : rootStores ? rootStores[MESSAGES_STORE] : null;
		this.messageStore && this.messageStore.setSessionTimeout();
		const url = this.baseUrl + relativeUrl;
		try {
			headers = {
				OrganizationId,
				...headers
			};
			return this.http.get(url, headers)
				.catch(res => this.checkFailHttpRequest(res));
		} catch (err) {
			Logger.error(`http get failed`, url);
			throw err;
		}
	}

	async httpPost(relativeUrl: string, body?: object, headers?: any) {
		this.authStore = this.authStore ? this.authStore : rootStores ? rootStores[AUTH_STORE] : null;
		this.messageStore = this.messageStore ? this.messageStore : rootStores ? rootStores[MESSAGES_STORE] : null;
		this.messageStore && this.messageStore.setSessionTimeout();
		const url = this.baseUrl + relativeUrl;
		try {
			headers = {
				OrganizationId,
				...headers
			};
			return this.http.post(url, body, headers)
				.catch(res => this.checkFailHttpRequest(res));
		} catch (err) {
			Logger.error(`http post failed`, url);
			throw err;
		}
	}

	async httpPut(relativeUrl: string, body?: object, headers?: any) {
		this.authStore = this.authStore ? this.authStore : rootStores ? rootStores[AUTH_STORE] : null;
		this.messageStore = this.messageStore ? this.messageStore : rootStores ? rootStores[MESSAGES_STORE] : null;
		this.messageStore && this.messageStore.setSessionTimeout();
		const url = this.baseUrl + relativeUrl;
		try {
			headers = {
				...headers,
				OrganizationId
			};
			return this.http.put(url, body, headers)
				.catch(res => this.checkFailHttpRequest(res));
		} catch (err) {
			Logger.error(`http put failed`, url);
			throw err;
		}
	}

	async httpDelete(relativeUrl: string, body?: object, headers?: any) {
		this.authStore = this.authStore ? this.authStore : rootStores ? rootStores[AUTH_STORE] : null;
		this.messageStore = this.messageStore ? this.messageStore : rootStores ? rootStores[MESSAGES_STORE] : null;
		this.messageStore && this.messageStore.setSessionTimeout();
		const url = this.baseUrl + relativeUrl;
		try {
			headers = {
				...headers,
				OrganizationId
			};
			return this.http.del(url, body, headers)
				.catch(res => this.checkFailHttpRequest(res));
		} catch (err) {
			Logger.error(`http delete failed`, url);
			throw err;
		}
	}

	checkFailHttpRequest(res: any) {
		if (res && res.response && res.response.status == 401) {
			this.authStore!.logout();
		}
	}
}

export default BaseHTTPService;
