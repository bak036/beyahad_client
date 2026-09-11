import {makeAutoObservable, observable} from 'mobx';
import EventimEventDTO from '../dto/EventimEventDTO';
import * as moment from 'moment';
import {Logger} from 'nofshonit-base-web-client';

export default class EventimEvent {
	@observable
	name: string = '';

	@observable
	venueId: string = '';

	@observable
	venueName: string = '';

	@observable
	eventDate: string = '';

	@observable
	eventTime: string = '';

	@observable
	eventId: string = '';

	@observable
	expireDate: string = '';

	@observable
	orderLimit: string = '';

	@observable
	categoryId: string = '';

	@observable
	isCampaign: string = '';

	@observable
	redeemTypeName: string = '';

	@observable
	isSelfPrint: boolean;

	constructor(){
		makeAutoObservable(this);
	}
	
	get dateFormattedString() {
		return this.eventDate ? moment(this.eventDate).format('DD/MM/YYYY') : '';
	}
	get timeFormattedString() {
		return this.eventTime ? moment(this.eventTime, 'HH:mm:ss').format('HH:mm') : '';
	}

	get dateAndHourString() {
		try {
			const formattedDate = this.dateFormattedString;
			const formattedTime = this.timeFormattedString;
			return `${formattedDate} בשעה ${formattedTime}`;
		} catch (err) {
			Logger.warn('could not get "dateAndHourString"', err);
			return '';
		}
	}

	static convertEventDateAndTimeToMoment(event) {
		let momentDate = moment();
		if (event.eventDate) {
			momentDate = moment(event.eventDate);
			if (event.eventTime) {
				const time = moment(event.eventTime, 'HH:mm:ss');
				momentDate = momentDate.add({hours: time.hours(), minutes: time.minutes(), seconds: time.seconds()});
			}
		}

		return momentDate;
	}

	static convertFromEventimEventDTOArray(eventimEventDTOArray: EventimEventDTO[]) {
		if (eventimEventDTOArray && eventimEventDTOArray.length > 0) {
			return eventimEventDTOArray
				.sort((a, b) => {
					const aDate = EventimEvent.convertEventDateAndTimeToMoment(a);
					const bDate = EventimEvent.convertEventDateAndTimeToMoment(b);
					const diff = aDate.diff(bDate);
					return diff;
				})
				.map((eventimEventItem) => this.convertFromEventimEventDTO(eventimEventItem));
		}

		return [];
	}

	static convertFromEventimEventDTO(eventimEventDTO: EventimEventDTO) {
		const eventimEvent = new EventimEvent();
		eventimEvent.name = eventimEventDTO.name;
		eventimEvent.venueId = eventimEventDTO.venueId;
		eventimEvent.venueName = eventimEventDTO.venueName;
		eventimEvent.eventDate = eventimEventDTO.eventDate;
		eventimEvent.eventTime = eventimEventDTO.eventTime;
		eventimEvent.eventId = eventimEventDTO.eventId;
		eventimEvent.expireDate = eventimEventDTO.expireDate;
		eventimEvent.orderLimit = eventimEventDTO.orderLimit;
		eventimEvent.categoryId = eventimEventDTO.categoryId;
		eventimEvent.isCampaign = eventimEventDTO.isCampaign;
		eventimEvent.isSelfPrint = eventimEventDTO.isSelfPrint;

		return eventimEvent;
	}
}
