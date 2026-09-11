import { observable, action, computed, makeAutoObservable } from 'mobx';
import NofhonitConfigurationLoader, { SiteConfiguration } from '../utils/NofhonitConfigurationLoader';

export default class ConfigurationStore {
	@observable
	config: any = {};

	constructor() {
		makeAutoObservable(this);
	}

	@action
	init = async () => {
		const config = await NofhonitConfigurationLoader.loadConfiguration();
		this.config = config;

		if (config && (config.externalLinksInWebView || []).length > 0) {
			if (window.ReactNativeWebView) {
				const message = { action: 'setExternalLinks', obj: { links: config.externalLinksInWebView } };
				window.ReactNativeWebView.postMessage(JSON.stringify(message));
			}
		}
	};

	postExternalLinksToNativeApp = () => {
		const externalLinks = this.config.externalLinksInWebView || [];
		if (externalLinks.length > 0 && window.ReactNativeWebView) {
			const message = { action: 'setExternalLinks', obj: { links: externalLinks } };
			window.ReactNativeWebView.postMessage(JSON.stringify(message));
		}
	};

	@computed
	get getConfiguration() {
		return this.config || {};
	}
}
