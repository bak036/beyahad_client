import {observable, action, computed, makeAutoObservable} from 'mobx';


export default class MintStore {
	@observable ActivateMintButtons: boolean;
	@observable token: string = '';

	constructor() {
		this.setMintButtonActivation(true);
		makeAutoObservable(this)
	}

	@action
	setMintButtonActivation = (action: boolean) => {
		this.ActivateMintButtons = action;
	};

	@computed
	get isButtonsActive() {
		return this.ActivateMintButtons;
	}
}
