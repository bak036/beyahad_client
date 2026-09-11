import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config';
import EventCatalogDTO from '../dto/EventCatalogDTO';
import Ticket from '../models/Ticket';
import BaseHTTPService from './BaseHTTPService';
import Category from '../models/Category';
import EventimEvent from '../models/EventimEvent';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import WalletService from './WalletService';
import {categoryEvent} from './CategoriesMock1';
import GoogleAnalyticsUtils from '../utils/analytics/GoogleAnalyticsUtils';
class EventService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	async getEventCatalog(eventId: string, categoryId: string) {
		try {
			const res = await this.httpGet(`/event/EventCatalog?eventId=${eventId}&categoryId=${categoryId}`);
			// const res = categoryFromMock;

			if (res && res.status && res.data && res.data.data && res.data.data.eventCatalogList) {
				const eventCatalogList: EventCatalogDTO[] = res.data.data.eventCatalogList;
				let getIsSelfPrint = res.data.data.category ? res.data.data.category.isSelfPrint : undefined;
				const dataObj = {
					tickets: Ticket.convertFromEventCatalogDTOArray(eventCatalogList),
					mapHTML: res.data.data.mapHTML ? res.data.data.mapHTML.replace(/\\"|\r|\n|\t"/g, '') : null,
					isSeatMap: res.data.data.eventCatalogList[0].isSeatMap,
					isSelfPrint: getIsSelfPrint,
				};
				return dataObj;
			}
			throw new Error('Error in response from getEventCatalog');
		} catch (err) {
			Logger.error(`error in getCategoryProductsById_WithDTO`, err);
			throw err;
		}
	}

	async addToCart(category: Category, event: EventimEvent, tickets: Ticket[], productJsonForGA? : string,productIndexForGA? : string
		,creativeNameForGA? : string,promotionNameForGA? : string) {
		// Check if the user chose tickets
		if (!tickets || tickets.length <= 0) {
			throw new Error('No tickets to cart');
		}

		const ListOfSeats: any[] = [];
		for (let i = 0; i < tickets.length; i++) {
			const currTicket = tickets[i];
			if (currTicket.quantity > 0) {
				const seat = {
					VariantFullBarcode: currTicket.variantFullBarcode,
					PriceID: currTicket.priceID,
					PriceLevelId: currTicket.priceLevelId,
					PriceLevelName: currTicket.priceLevelName,
					TicketTypeName: currTicket.ticketTypeName,
					TicketTypeId: currTicket.ticketTypeId,
					Price: currTicket.price,
					productJsonForGA : GoogleAnalyticsUtils.convertEventForGA(category,currTicket,productJsonForGA,productIndexForGA,creativeNameForGA,promotionNameForGA)
				};

				// The API is expecting flat json
				// for instnce, if the user chose 3 tickets for Event "123123123"
				// the Json request should be somthing like this:
				//	\a
				// EventId:123123123,
				// ListOfSeats:[
				// { ticketObject... },
				// { ticketObject... },
				// { ticketObject... },
				// ]
				//
				for (let j = 0; j < currTicket.quantity; j++) {
					ListOfSeats.push(seat);
				}
			}
		}

		const body = {
			CategoryNumber: category.categoryId.toString(),
			categoryName: category.categoryName,
			CreateReservation: {
				EventId: event.eventId,
				// TODO: Gal - Tal asked me to talk with him about this
				// JourneyId: 51973,
				ListOfSeats: ListOfSeats,
			},
		};
		return this.httpPost('/shoppingBasket/add', body)
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}

				if (res && res.data && res.data.data) {
					GoogleAnalyticsUtils.addEventToCart(ListOfSeats,false)
					return WalletService.organizeCart(res.data.data);
				} else {
					throw new Error('Response data not found in addToCart ');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to addToCart', err);
				throw err;
			});
	}
	async addToCartWithMap(category: Category, reservationBody) {
		const body = {
			CategoryNumber: category.categoryId.toString(),
			categoryName: category.categoryName,
			CreateReservation: reservationBody, // inside object EventId,MemberId,ListOfSeats
		};
		

		return this.httpPost('/shoppingBasket/add', body)
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}

				if (res && res.data && res.data.data) {
					return WalletService.organizeCart(res.data.data);
				} else {
					throw new Error('Response data not found in addToCart ');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to addToCart', err);
				throw err;
			});
	}
}

export default new EventService(ClientConfig.apiBaseHost);
