import { observable } from "mobx";

export default class BarcodePopupDetails {
	@observable categoryName?: string;
    @observable shortNameVar?:string;
    @observable digitalCodeType:number;
    @observable cardNumber?:string;
    @observable lastImplementationDate?:Date;
}