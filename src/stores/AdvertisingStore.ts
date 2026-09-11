import { observable, action, computed, toJS, makeAutoObservable } from 'mobx';
import AuthStore from './AuthStore';
import Advertisement from '../models/Advertisement';
import AdvertisingService from '../services/AdvertisingService';
import { Logger } from 'nofshonit-base-web-client';
import Comercial from '../models/Comercial';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';

export default class AdvertisingStore {
	authStore: AuthStore;

	@observable imagesSlider: Advertisement[] = [];

	@observable commercial: Comercial[] = [];

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	getAdvertisement = async () => {
		await AdvertisingService.getImagesSlider()
			.then((res) => {
				this.imagesSlider = res;
			})
			.catch((err) => {
				Logger.debug(err);
			});
	};

	@action
	getCommercial = async () => {
		await AdvertisingService.getCommercial()
			.then((res) => {
				if (res) {
					this.commercial = res.map((c) => new Comercial(c));
				}
			})
			.catch((err) => {
				Logger.debug(err);
			});
	};
	@action
	addReferralHistory =async (externalLlink: string, ineerLlink: string) => {
		await AdvertisingService.addReferralHistory(externalLlink, ineerLlink)
			.catch((err) => {
				Logger.debug(err);
			});
	};
	@computed
	get getCommercialArray() {
		return toJS(this.commercial) || [];
	}

	@computed
	get getImagesSlider() {
		const sortedimagesSlider = this.imagesSlider
			? this.imagesSlider.slice().sort((a, b) => a.sortOrder! - b.sortOrder!)
			: undefined;
		return toJS(sortedimagesSlider);
	}

	@computed
	get getcommercialVarible() {
		if (this.commercial && this.commercial[0]) {
			return toJS(this.commercial[0]);
		} else return undefined;
	}
}
