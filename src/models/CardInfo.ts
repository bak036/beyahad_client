import { makeAutoObservable, observable } from 'mobx';

export default class CardInfo {
	@observable activationTime: string;
	@observable expiredDate: string;
	@observable cardStatus: number;

	constructor(cardInfo?: CardInfo) {
		makeAutoObservable(this);
		if (cardInfo) {
			this.activationTime = cardInfo.activationTime;
			this.expiredDate = cardInfo.expiredDate;
			this.cardStatus = cardInfo.cardStatus;
		} else {
			this.activationTime = '';
			this.expiredDate = '';
			this.cardStatus = 0;
		}
	}
}
