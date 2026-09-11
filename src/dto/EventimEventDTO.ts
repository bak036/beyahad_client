import EventimEvent from '../models/EventimEvent';

export default class EventimEventDTO {
	name: string;
	venueId: string;
	venueName: string;
	eventDate: string;
	eventTime: string;
	eventId: string;
	expireDate: string;
	orderLimit: string;
	categoryId: string;
	isCampaign: string;
	isSelfPrint: boolean;
}
