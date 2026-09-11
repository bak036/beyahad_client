import { makeAutoObservable, observable } from 'mobx';

export default class Comercial {
	@observable adminDescription: string;
	@observable messageContext: string;
	@observable messageId: number;
	@observable messageKey: number;
	@observable messageName: string;
	@observable messageText: string;
	@observable organizationId: number;

	constructor(comercial: Comercial) {
		makeAutoObservable(this);
		if (comercial) {
			this.adminDescription = comercial.adminDescription ? comercial.adminDescription : '';
			this.messageContext = comercial.messageContext ? comercial.messageContext : '';
			this.messageId = comercial.messageId ? comercial.messageId : 0;
			this.messageKey = comercial.messageKey ? comercial.messageKey : 0;
			this.messageName = comercial.messageName ? comercial.messageName : '';
			this.messageText = comercial.messageText ? comercial.messageText : '';
			this.organizationId = comercial.organizationId ? comercial.organizationId : 0;
		}
	}
}
