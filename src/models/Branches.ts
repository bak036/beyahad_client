import {observable} from 'mobx';

export default class Branches {
	@observable WalletID: number;
	@observable WalletName: string;
	@observable ChainID: number;
	@observable ChainName: string;
	@observable BranchId?: number;
	@observable BranchName: string;
	@observable BuisnessID: string;
	@observable StoreAddress: string;
	@observable StorePhone1: string;
	@observable DistanceKm: string;
	@observable WebSite: string;


    
	constructor(branch?: any) {
		// Code Section
		if (branch) {
            this.WalletID = branch.WalletID;
            this.WalletName = branch.WalletName;
            this.ChainID = branch.ChainID;
            this.ChainName = branch.ChainName;
            this.BranchId = branch.BranchId;
            this.BranchName = branch.BranchName;
            this.BuisnessID = branch.BuisnessID;
            this.StoreAddress = branch.StoreAddress;
            this.StorePhone1 = branch.StorePhone1;
			this.DistanceKm = branch.DistanceKm;
			this.WebSite = branch.WebSite;
		}
	}
}
