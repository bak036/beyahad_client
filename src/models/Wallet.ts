import {makeAutoObservable, observable} from 'mobx';
import User from './User';
import Transaction from './Transaction';
import LoadingMode from './LoadingMode';

export enum StatusType {
	Active = 'active',
	Blocked = 'blocked',
	NotActive = 'notActive',
	default = 'default',
}

export default class Wallet {
	@observable walletName: string = '';
	@observable walletID: string = '';
	@observable walletBalance: number;
	@observable discountMode: string = '';
	@observable userDetails: User;
	@observable loadedThisMonth: string= '';
	@observable statusCard: StatusType;
	@observable maxAmountToLoad: number;
	@observable maxBalance: string = '';
	@observable maxDeposit: string = '';
	@observable maxDepositForMonth: number = 0;
	@observable validDate: string = '';
	@observable discountRate: number = 0;
	@observable transactions: Transaction[];
	@observable loadingMode: LoadingMode;
	@observable backgroundImageUrl: string = '';
	// Optional limits returned by sp_GetWalletsData. May be null when unavailable.
	@observable maxBalanceAllWallets: number | null = null;
	@observable maxDepositYearly: number | null = null;
	constructor(wallet?: Wallet) {
		makeAutoObservable(this);
		if (wallet) {
			this.loadedThisMonth = wallet.loadedThisMonth ? wallet.loadedThisMonth : '';
			this.maxAmountToLoad = wallet.maxAmountToLoad ? wallet.maxAmountToLoad : 0;
			this.maxDepositForMonth = wallet.maxDepositForMonth;
			this.maxBalance = wallet.maxBalance ? wallet.maxBalance : '';
			this.maxDeposit = wallet.maxDeposit ? wallet.maxDeposit : '';
			this.walletName = wallet.walletName ? wallet.walletName : '';
			this.walletID = wallet.walletID ? wallet.walletID : '';
			this.walletBalance = wallet.walletBalance ? wallet.walletBalance : 0;
			this.discountMode = wallet.discountMode ? wallet.discountMode : '';
			this.userDetails = wallet.userDetails ? wallet.userDetails : new User();
			this.discountRate = wallet.discountRate ? wallet.discountRate : 0;
			this.statusCard = wallet.statusCard ? wallet.statusCard : StatusType.default;
			this.transactions = wallet.transactions ? wallet.transactions : [];
			this.loadingMode = wallet.loadingMode ? wallet.loadingMode : new LoadingMode();
			this.backgroundImageUrl = wallet.backgroundImageUrl ? wallet.backgroundImageUrl : '';
			this.maxBalanceAllWallets = wallet.maxBalanceAllWallets != null ? Number(wallet.maxBalanceAllWallets) : null;
			this.maxDepositYearly = wallet.maxDepositYearly != null ? Number(wallet.maxDepositYearly) : null;
		} else {
			this.walletName = '';
			this.walletID = '';
			this.walletBalance = 0;
			this.discountMode = '';
			this.userDetails = new User();
			this.discountRate = 0;
			this.statusCard = StatusType.default;
			this.transactions = [];
			this.loadingMode = new LoadingMode();
		}
	}
}
