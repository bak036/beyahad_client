import { observable, action, makeAutoObservable } from 'mobx';

export default class ViewStore {
	@observable loadingView: boolean = false;

	constructor(){
		makeAutoObservable(this)
	}
	@action
	init = () => {
		this.setLoadingView(false);
	};

	@action
	setLoadingView = (view: boolean) => {
		this.loadingView = view;
	};
}
