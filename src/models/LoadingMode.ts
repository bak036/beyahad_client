import { makeAutoObservable, observable } from 'mobx';

export default class LoadingMode {
	@observable isLoadAllowed: number;
	@observable quickLoadMode: number;
	@observable last4Digits: string;

	constructor(loading?: LoadingMode) {
		makeAutoObservable(this);
		if (loading) {
			this.isLoadAllowed = loading.isLoadAllowed;
			this.quickLoadMode = loading.quickLoadMode;
			this.last4Digits = loading.last4Digits;
		} else {
			this.isLoadAllowed = 0;
			this.quickLoadMode = 0;
			this.last4Digits = '0000';
		}
	}
}
