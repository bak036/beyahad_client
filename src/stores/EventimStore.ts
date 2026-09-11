import {action, computed, IObservableArray, makeAutoObservable, observable, toJS} from 'mobx';
import Category from '../models/Category';
import Ticket from '../models/Ticket';
import EventimEvent from '../models/EventimEvent';
import CatgoryService from '../services/CatgoryService';
import EventService from '../services/EventService';
import AuthStore from './AuthStore';
import ErrorUtils, {ErrorDescription} from '../utils/errorHandling/ErrorUtils';
import Lang from '../config/Language';

export default class EventimStore {
	authStore: AuthStore;

	@observable productPageCategory: Category = new Category();

	@observable productPageCategoryWithFilteredEvents: Category;

	@observable selectedEvent?: EventimEvent = undefined;

	@observable tickets: IObservableArray<Ticket> = observable([]);

	@observable selectedVenue: string | null = '';

	@observable selectedDate: string | null = '';

	@observable selectedTime: string | null = '';

	@observable filteredEvents: EventimEvent[] = [];

	@observable mapHTML: string;

	@observable showMap: boolean = false; // true - show map , false - show tickets

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	getProductPageByCategoryId = (id: string): Promise<Category> => {
		return CatgoryService.getCategoryProductsById_WithDTO(id).then((category) => {
			this.productPageCategory = category;
			return this.productPageCategory;
		});
	};

	@action
	selectEventimEvent(event: EventimEvent) {
		return EventService.getEventCatalog(event.eventId, event.categoryId)
			.then((x) => {
				x.tickets = x.tickets.sort((a, b) => {
					if (a.isCampagin && b.isCampagin) {
						return a.price - b.price; // takes the one with the lowest price if they are both(a and b) with discount
					} else if (a.isCampagin) {
						return -1; // takes the first one(a) if it has a discount and the second one(b) doesnt
					} else if (b.isCampagin) {
						return 1; // takes the second one(b) if it has a discount and the first one(a) doesnt
					} else {
						const textA = `${a.priceLevelName} ${a.ticketTypeName}`;
						const textB = `${b.priceLevelName} ${b.ticketTypeName}`;
						// else sorts by alphabetical order
						if (textA < textB) {
							return -1;
						} else {
							return 1;
						}
					}
				});
				return x;
			})
			.then((obj: any) => {
				this.selectedEvent = event;
				this.selectedEvent.isSelfPrint = obj['isSelfPrint'];
				this.tickets.replace(obj['tickets']);
				this.mapHTML = obj['mapHTML'];
				this.showMap = this.mapHTML && obj['isSeatMap'];
				return obj['mapHTML'];
			});
	}

	@action
	onQuantityIncrease(ticket: Ticket) {
		this.onQuantityChanged(ticket, QuantityAction.Increase);
	}

	@action
	onQuantityDecrease(ticket: Ticket) {
		this.onQuantityChanged(ticket, QuantityAction.Decrease);
	}

	@action
	onPayClick(productJsonForGA,productIndexForGA,creativeNameForGA,promotionNameForGA) {
		if (this.getSelectedEvent) {
			return EventService.addToCart(
				this.getProductPageCategory,
				this.getSelectedEvent,
				this.getTickets,
				productJsonForGA,
				productIndexForGA,
				creativeNameForGA,
				promotionNameForGA
			);
		} else {
			throw new Error('Could not addToCart if no event selected');
		}
	}
	@action
	onPayClickWithMap(reservationBody) {
		if (this.getSelectedEvent) {
			return EventService.addToCartWithMap(this.getProductPageCategory, reservationBody);
		} else {
			throw new Error('Could not addToCartWithMap if no event selected');
		}
	}

	@action
	onBackToEventsListClick() {
		// Remove the selected event in order to "simulate" that the user choose nothing
		this.selectedEvent = undefined;
		this.tickets.clear();
	}

	private onQuantityChanged(ticket: Ticket, quantityAction: QuantityAction) {
		for (let i = 0; i < this.tickets.length; i++) {
			const currentTicket = this.tickets[i];
			if (currentTicket.variantFullBarcode === ticket.variantFullBarcode) {
				switch (quantityAction) {
					case QuantityAction.Increase:
						currentTicket.quantity += 1;
						break;
					case QuantityAction.Decrease:
						currentTicket.quantity = currentTicket.quantity > 0 ? currentTicket.quantity - 1 : currentTicket.quantity;
						break;
				}
			}
		}
	}

	@action
	setSelectedVenue = (name: string | null) => {
		this.selectedVenue = name ? name : null;
		this.filterEvents();
	};
	@action
	setSelectedDate = (date: string | null) => {
		this.selectedDate = date ? date : null;
		this.filterEvents();
	};
	@action
	setSelectedTime = (time: string | null) => {
		this.selectedTime = time ? time : null;
		this.filterEvents();
	};

	@action
	filterEvents() {
		if (this.selectedVenue) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.venueName == this.selectedVenue;
			});
		}
		if (this.selectedDate) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.dateFormattedString == this.selectedDate;
			});
		}
		if (this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.timeFormattedString == this.selectedTime;
			});
		}
		if (this.selectedVenue && this.selectedDate) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.venueName == this.selectedVenue && e.dateFormattedString == this.selectedDate;
			});
		}
		if (this.selectedVenue && this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.venueName == this.selectedVenue && e.timeFormattedString == this.selectedTime;
			});
		}
		if (this.selectedDate && this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.dateFormattedString == this.selectedDate && e.timeFormattedString == this.selectedTime;
			});
			if (this.filteredEvents.length == 0) {
				this.filteredEvents = this.productPageCategory.events.filter((e) => {
					return e.dateFormattedString == this.selectedDate;
				});
			}
		}
		if (this.selectedVenue && this.selectedDate && this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return (
					e.venueName == this.selectedVenue &&
					e.dateFormattedString == this.selectedDate &&
					e.timeFormattedString == this.selectedTime
				);
			});
		}
		if (!this.selectedVenue && this.selectedDate && this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.dateFormattedString == this.selectedDate && e.timeFormattedString == this.selectedTime;
			});
		}
		if (this.selectedVenue && !this.selectedDate && this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.venueName == this.selectedVenue && e.timeFormattedString == this.selectedTime;
			});
		}
		if (this.selectedVenue && this.selectedDate && !this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events.filter((e) => {
				return e.venueName == this.selectedVenue && e.dateFormattedString == this.selectedDate;
			});
		}
		if (!this.selectedVenue && !this.selectedDate && !this.selectedTime) {
			this.filteredEvents = this.productPageCategory.events;
		}
	}
	@action
	ClearFilteredEvents() {
		this.filteredEvents = [];
	}

	@computed
	get getFilteredEvents() {
		return this.filteredEvents && this.filteredEvents.length > 0
			? toJS(this.filteredEvents)
			: toJS(this.getProductPageCategory.events);
	}

	@computed
	get getProductPageCategory() {
		return toJS(this.productPageCategory);
	}

	@computed
	get getProductPageCategoryWithFilteredEvents() {
		return this.productPageCategoryWithFilteredEvents
			? toJS(this.productPageCategoryWithFilteredEvents)
			: toJS(this.productPageCategory);
	}

	@computed
	get getTickets() {
		return toJS(this.tickets);
	}

	@computed
	get getSelectedEvent() {
		return toJS(this.selectedEvent);
	}
}

enum QuantityAction {
	Increase = 'Increase',
	Decrease = 'Decrease',
}
