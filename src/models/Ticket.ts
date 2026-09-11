import {makeAutoObservable, observable} from 'mobx';
import EventCatalogDTO from '../dto/EventCatalogDTO';

export default class Ticket {
	@observable
	row: string = '';

	@observable
	seat: string = '';

	@observable
	orderGuid: string = '';

	@observable
	orderTicketId: number = 0;

	@observable
	price: number = 0;

	@observable
	priceID: number = 0;

	@observable
	priceLevelId: number = 0;

	@observable
	priceLevelName: string = '';

	@observable
	ticketTypeId: number = 0;

	@observable
	ticketTypeName: string = '';

	@observable
	variantFullBarcode: string = '';

	@observable
	quantity: number = 0;

	@observable
	productJsonForGA: string = '';

	@observable
	kupaPrice: number = 0;

	@observable
	area: string = '';
	@observable
	orderLimit: number = 0;
	@observable
	eventimTicketTypeName: string = '';
	@observable
	venuName: string = '';
	@observable
	eventTime: string = '';
	@observable
	isCampagin: boolean;
	constructor(ticket?: any, quantity?: number) {
		makeAutoObservable(this);
		// Code Section
		if (ticket) {
			this.eventTime = ticket.eventTime;
			this.venuName = ticket.venuName;
			this.eventimTicketTypeName = ticket.eventimTicketTypeName;
			this.area = ticket.area;
			this.row = ticket.row;
			this.seat = ticket.seat;
			this.orderGuid = ticket.orderGuid;
			this.orderTicketId = ticket.orderTicketId;
			this.price = ticket.price;
			this.priceID = ticket.priceID;
			this.priceLevelId = ticket.priceLevelId;
			this.priceLevelName = ticket.priceLevelName;
			this.ticketTypeName = ticket.ticketTypeName;
			this.variantFullBarcode = ticket.variantFullBarcode;
			this.quantity = quantity ? quantity : 0;
			this.orderLimit = ticket.orderLimit;
			this.isCampagin = ticket.isCampagin;
			this.productJsonForGA = ticket.productJsonForGA;
		}
	}

	static convertFromEventCatalogDTOArray(eventCatalogDTO: EventCatalogDTO[]) {
		if (eventCatalogDTO && eventCatalogDTO.length > 0) {
			return eventCatalogDTO.map((eventCatalogItem) => Ticket.convertFromEventCatalogDTO(eventCatalogItem));
		}

		return [];
	}

	static convertFromEventCatalogDTO(eventCatalogDTO: EventCatalogDTO) {
		const converted = new Ticket();

		// TODO: Gal - check if this is like the ID of the ticket
		converted.variantFullBarcode = eventCatalogDTO.fullBarCode;
		converted.priceLevelName = eventCatalogDTO.eventimPriceLevelName;
		converted.ticketTypeName = eventCatalogDTO.eventimTicketTypeName;
		converted.ticketTypeId = eventCatalogDTO.ticketTypeId;
		converted.priceLevelId = eventCatalogDTO.priceLevelId;
		converted.priceID = eventCatalogDTO.eventimPriceId;
		converted.orderLimit = eventCatalogDTO.orderLimit;
		// TODO: Gal - should i use it?
		converted.price = eventCatalogDTO.finalPrice ? eventCatalogDTO.finalPrice : 0;
		converted.isCampagin = eventCatalogDTO.isCampagin;
		converted.kupaPrice = eventCatalogDTO.cupaPrice; // notice its called cupaPrice with 'c'

		// This is the quantity that the user choose
		converted.quantity = 0;

		return converted;
	}
}
