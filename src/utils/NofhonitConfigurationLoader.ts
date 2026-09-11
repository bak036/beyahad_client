import ClientConfig from '../config';
import BaseHTTPService from '../services/BaseHTTPService';
import {Logger} from 'nofshonit-base-web-client';
import CartItem from '../models/CartItem';

const CONFIGURATION_FILE_NAME = '/configuration.json';
const CONFIGURATION_ORIGIN = window.location.origin;

export interface SiteConfiguration {
	messagesKeys: number[];
	prefixCellPhoneNumbers: string[];
	prefixPhoneNumbers: string[];
	numberofselectTop: number;
	selectTopMaxNumber: number;
	amountPerPage: number;
	topTagsNumber: number;
	cardVariant: CartItem;
	digitalCardVariant: CartItem;
	oldHistWebsite: string;
	slidersToShow: {
		mobile: number[];
		desktop: number[];
	};
	ClubCreditCardSubsidizedOnlyForHolders: boolean;
	timeOutSeconds: number;
	MinutesToExpired_RefreshToken: number;
	SecondesToReSendSms: number;
	ExternalLinksPermittedDomains:string[];
	externalLinksInWebView:string[];
	pointsSkyMaxLink:string;
	benefitsMaxLink:string;
	timeBetweenRefreshTokens: number;
}

class NofhonitConfigurationLoader extends BaseHTTPService {
	private cachedConfiguration: SiteConfiguration;

	constructor() {
		super(CONFIGURATION_ORIGIN);
	}

	async loadConfiguration(): Promise<SiteConfiguration> {
		try {
			if (!this.cachedConfiguration) {
				const configuration = await this.httpGet(`${CONFIGURATION_FILE_NAME}`).then((res) => {
					return res.data as SiteConfiguration;
				});
				this.cachedConfiguration = configuration;
			}
		} catch (err) {
			Logger.error(`error in getting configuration file "${CONFIGURATION_FILE_NAME}" from "${CONFIGURATION_ORIGIN}"`);
		}

		return this.cachedConfiguration;
	}
}

export default new NofhonitConfigurationLoader();
