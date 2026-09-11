import {makeAutoObservable, observable} from 'mobx';
import CardInfo from './CardInfo';
import Wallet from './Wallet';

export default class Card {
	@observable balance: number;
	@observable cardNumber: string;
	@observable cardInfo: CardInfo;
	@observable errorId: number;
	@observable maxAmountToLoad: number;
	@observable moneyPercentageCancellationCommission : number;
	@observable numberOfDaysAllowingCancellation: number;
	@observable moneyMaxCommissionAmount : number;
	@observable wallets: Wallet[];

	constructor(card?: Card) {
		makeAutoObservable(this);
		if (card) {
			this.balance = card.balance;
			this.cardNumber = card.cardNumber;
			this.cardInfo = new CardInfo(card.cardInfo);
			this.errorId = card.errorId;
			this.maxAmountToLoad = card.maxAmountToLoad;
			this.wallets = card.wallets ? card.wallets.map((w) => new Wallet(w)) : [];
			this.moneyPercentageCancellationCommission = card.moneyPercentageCancellationCommission;
			this.numberOfDaysAllowingCancellation = card.numberOfDaysAllowingCancellation;
			this.moneyMaxCommissionAmount = card.moneyMaxCommissionAmount;
			// this.wallets = card.wallets;
		} else {
			this.balance = 0;
			this.cardInfo = new CardInfo();
			this.errorId = 0;
			this.maxAmountToLoad = 0;
			this.wallets = [];
			this.moneyPercentageCancellationCommission = 0;
			this.numberOfDaysAllowingCancellation = 365;
			this.moneyMaxCommissionAmount = 0;
		}
	}
}
