import {makeAutoObservable, observable} from 'mobx';
import Ticket from './Ticket';

class Varient {
	@observable id: string = '';

	@observable name: string = '';

	@observable barCode?: string = '';

	@observable price: number = 0;

	@observable quantity: number = 0;

	@observable discount?: number = 0;

	@observable expireDate: string = '';

	@observable endDate: string = '';

	@observable purchaseDate?: string = '';

	@observable categoryName?: string = '';

	@observable productJsonForGA?: string = '';

	@observable totalPurchase?: number;

	@observable status?: string = '';

	@observable isEmpty?: boolean;

	@observable isSendToFriend?: boolean;

	@observable orderLimit: number = 0;

	@observable benefitTypeId?: number = 0;

	@observable giftCardValue?: number = 0;

	@observable redimTypeId?: number = 0;

	@observable redimTypeName?: string = '';

	@observable stock: number = 0;

	@observable description?: string = '';

	@observable supplierName?: string = '';

	@observable sale?: boolean;

	@observable outofStock?: boolean;

	@observable isCampaign?: boolean;

	@observable tickets?: Ticket[];

	@observable kupaPrice?: number = 0;

	@observable irgunPrice?: number = 0;

	@observable businessSubTypeId?: number = 0;

	@observable monthlyLimit: number = 0;

	@observable generalLimit?: number = 0;

	@observable yearlyLimit?: number = 0;

	@observable isExternalCoupon: boolean;

	constructor(varient?: any, quantity?: number) {
		makeAutoObservable(this);
		if (varient) {
			this.monthlyLimit = varient.monthlyLimit;
			this.generalLimit = varient.generalLimit ? varient.generalLimit : null;
			this.yearlyLimit = varient.yearlyLimit ? varient.yearlyLimit : null;
			this.id = varient.id;
			this.name = varient.name;
			this.barCode = varient.barCode ? varient.barCode : '';
			this.isEmpty = varient.isEmpty ? varient.isEmpty : false;
			this.stock = varient.stock;
			this.name = varient.name;
			this.price = varient.price;
			this.quantity = quantity !== undefined ? quantity : 0;
			this.discount = varient.discount ? varient.discount : null;
			this.orderLimit = varient.orderLimit ? varient.orderLimit : 0;
			this.expireDate = varient.expireDate;
			this.endDate = varient.endDate;
			this.description = varient.description ? varient.description : '';
			this.supplierName = varient.supplierName ? varient.supplierName : '';
			this.sale = varient.sale ? true : false;
			this.outofStock = varient.outofStock ? true : false;
			this.isSendToFriend = varient.isSendToFriend ? varient.isSendToFriend : false;
			this.benefitTypeId = varient.benefitTypeId ? varient.benefitTypeId : 0;
			this.giftCardValue = varient.giftCardValue ? varient.giftCardValue : 0;
			this.redimTypeId = varient.redimTypeId ? varient.redimTypeId : 0;
			this.redimTypeName = varient.redimTypeName ? varient.redimTypeName : '';
			this.tickets = varient.tickets ? varient.tickets : null;
			this.kupaPrice = varient.kupaPrice ? varient.kupaPrice : undefined;
			this.irgunPrice = varient.irgunPrice ? varient.irgunPrice : undefined;
			this.purchaseDate = varient.purchaseDate ? varient.purchaseDate : '';
			this.categoryName = varient.categoryName ? varient.categoryName : '';
			this.totalPurchase = varient.totalPurchase ? varient.totalPurchase : 0;
			this.status = varient.status ? varient.status : '';
			this.businessSubTypeId = varient.businessSubTypeId ? varient.businessSubTypeId : 0;
			this.isCampaign = varient.isCampaign ? varient.isCampaign : false;
			this.productJsonForGA = varient.productJsonForGA ? varient.productJsonForGA : undefined;
			this.isExternalCoupon = varient.isExternalCoupon ? varient.isExternalCoupon : false;
		}
	}
}

export default Varient;
