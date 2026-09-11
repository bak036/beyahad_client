import { action, computed, IObservableArray, makeAutoObservable, observable, toJS } from 'mobx';
import Card from '../models/Card';
import Transaction from '../models/Transaction';
import User from '../models/User';
import Wallet from '../models/Wallet';
import WalletService from '../services/WalletService';
import AuthStore from './AuthStore';
import CreditCard from '../models/CreditCard';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';

export default class WalletStore {
	authStore: AuthStore;

	@observable currentWallet: Wallet = new Wallet();
	@observable transactions: IObservableArray<Transaction> = observable([]);
	@observable card: Card = new Card();
	@observable totalYearlyDeposit: number = 0;
	@observable maxDepositYearly: number | null = null;

	/**
	 * indicate if the requests of "getWallet" and "getTransactions" are finished
	 * We use it in `init`
	 */
	@observable loadingGetWallets: boolean = false;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this)
	}

	@action
	loadWallet = async (wlletId, amountToCharge, amountToLoad, cardDetails: CreditCard, shortCode, email) => {
		const result = await WalletService.loadWallet(
			wlletId,
			amountToCharge,
			amountToLoad,
			cardDetails,
			shortCode,
			email
		);
		return result;
	};
	@action
	private getWallets = () => {
		return WalletService.getWallets().then((res) => {
			this.setCard(res);
			return true;
		});
	};

	@action
	setCard = (card) => {
		this.card = card;
	};

	@action
	getWalletById = (id) => {
		return WalletService.getWalletById(id).then((res) => {
			this.setCurrentWallet(res);
		});
	};
	@action
	init = async () => {
		this.loadingGetWallets = true;
		try {
			await this.getWallets();
			// Call the service directly (not the store method) to avoid the store's per-call catch
			// which would fire a second popup on top of any error from getWallets.
			const transactions = await WalletService.getTransactions();
			this.setTransactios(transactions.transactions);
			this.totalYearlyDeposit = transactions.totalYearlyDeposit;
			this.maxDepositYearly = transactions.maxDepositYearly;
		} catch (err) {
			// Show a popup only for recognized business errors (e.g. blocked wallet).
			// The backend's generic/unexpected-error marker (errorId 1, generic "שגיאה כללית" text)
			// must stay silent here, same as master's previous behavior.
			if ((ErrorUtils.isHTMLError(err) || ErrorUtils.isStringError(err)) && !ErrorUtils.isGeneralServerError(err)) {
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			}
		} finally {
			this.loadingGetWallets = false;
		}
		return true;
	};
	@action
	getTimeBetweenDischargeAndCharge = () => {
		return WalletService.getTimeBetweenDischargeAndCharge();
	}
	@action
	getTransactions = () => {
		return WalletService.getTransactions()
			.then((res) => {
				this.setTransactios(res.transactions);
				this.totalYearlyDeposit = res.totalYearlyDeposit;
				this.maxDepositYearly = res.maxDepositYearly;
				return true;
			})
			.catch((err) => {
				// Show a popup only for recognized business errors when called directly
				// (e.g. from BalanceAndUses page). The backend's generic/unexpected-error marker
				// (errorId 1) stays silent, same as init() above.
				if ((ErrorUtils.isHTMLError(err) || ErrorUtils.isStringError(err)) && !ErrorUtils.isGeneralServerError(err)) {
					ErrorUtils.checkErrorAndShowPopUp(err, '', '');
				}
				return false;
			});
	};

	@action
	setTransactios(transactions) {
		this.transactions.replace(transactions);
	}

	@action
	setCurrentWallet = (wallet) => {
		this.currentWallet = wallet;
	};

	@computed
	get getWalletsArray() {
		return this.card ? toJS(this.card.wallets) : [];
	}

	@action
	async getBarcode() {
		return await WalletService.getGeneratedBarcode();
	}

	@action
	getAvailableBalanceForDischarge(walletID) {
		return WalletService.balanceForDischarge(walletID);
	}

	@observable globalSelfDischargeLimit: number = 0;

	@action
	getGlobalSelfDischargeLimit = async () => {
		const limit = await WalletService.getGlobalSelfDischargeLimit();
		this.globalSelfDischargeLimit = limit;
		return limit;
	}

	@action
	AllowedToDischarge = async (walletID) => {
		return await WalletService.AllowedToDischarge(walletID);
	}
	@action
	onDischargeClicked(walletID, dischargeAmount, email, creditCardNumber, expiredDate, cvv, phoneNumber) {
		return WalletService.onDischargeClicked(
			walletID,
			dischargeAmount,
			email,
			creditCardNumber,
			expiredDate,
			cvv,
			phoneNumber
		);
	}

	@computed
	get getCurrentWallet() {
		return this.currentWallet;
	}

	@computed
	get getCard() {
		return toJS(this.card) || null;
	}

	@computed
	get getWalletId() {
		return this.currentWallet && this.currentWallet.walletID ? this.currentWallet.walletID : undefined;
	}

	@computed
	get walletName() {
		return this.currentWallet?.walletName || '';
    }
}
