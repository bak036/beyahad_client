import { action, makeAutoObservable, observable } from "mobx";
import AuthStore from "./AuthStore";
import Branches from '../models/Branches';
import BranchesService from "../services/BranchesService";


export default class BranchesStore {

    @observable branches: Branches[] = [];
	authStore: AuthStore;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

    @action
	init(walletId: number, chainId: number) {
		return this.getBranches(walletId, chainId);
	}

    @action
	getBranches(walletId: number, chainId: number) {
		return BranchesService.getBranches(walletId, chainId).then((branches: any) => {
			this.branches = branches || [];
		});
	}

	@action
	getBranchesNearMe(walletId: number, chainId: number,lat: number, lon: number) {
		return BranchesService.getBranchesNearMe(walletId, chainId, lat, lon).then((branches: any) => {
			this.branches = branches || [];
		});
	}
}