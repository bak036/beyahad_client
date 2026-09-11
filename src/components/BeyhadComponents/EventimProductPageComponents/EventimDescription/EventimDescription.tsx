import * as React from 'react';
import Category from '../../../../models/Category';
import { CustomHeader, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import EventimEvent from '../../../../models/EventimEvent';
import EditorMessage from '../../EditorMessage/EditorMessage';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import * as moment from 'moment';
import { useEffect, useState } from 'react';

interface Props {
	category: Category;
	event?: EventimEvent;
	isUserSelectedEvent?: boolean;
}
interface IState {
	eventVanue: string;
	eventDateAndTime: string;
}

const EventimDescription : React.FC<Props> = ({
	category,
	event
}) => {
	const [eventVanue,setEventVanue] = useState<string>('');
	const [eventDateAndTime,setEventDateAndTime] = useState<string>('');

	useEffect(() => {
		initEventVanueAndDateTime();
	},[]);

	/**
	 * Init the event vanue and date&time
	 */
	const initEventVanueAndDateTime = () => {
		const eventsVanueNames = category.getEventsVanueNames();
		const eventsDates = category.getEventsDates();
		const eventsTimes = category.getEventsTimes();

		let eventVanue = '';
		let eventDateAndTime = '';
		if (eventsVanueNames.length > 1) {
			eventVanue = Lang.format('NumberOfVanues');
		} else if (eventsVanueNames.length === 1) {
			eventVanue = eventsVanueNames[0];
		}
		if (eventsDates.length > 1 || eventsTimes.length > 1) {
			eventDateAndTime = Lang.format('NumberOfDates');
		} else if (eventsDates.length === 1 && eventsTimes.length === 1) {
			eventDateAndTime = `${` ${eventsDates[0]} `}<br>${Lang.format('inHour')}: ${eventsTimes[0]}`;
		}
		else if (eventsDates.length === 1) {
			eventDateAndTime = eventsDates[0];
		} else if (eventsTimes.length === 1) {
			eventDateAndTime = eventsTimes[0];
		}

		setEventVanue(eventVanue)
		setEventDateAndTime(eventDateAndTime)
	}

	const getDescriptionDesignWithMoney = (desc: string) => {
		let newDesc: string[] = [];
		const moneyFromStrRegex = /([0-9]+\s?₪)/g;
		newDesc = desc.split(moneyFromStrRegex);
		return ((newDesc && newDesc.length == 3) ? (
			<div className='description_modified_container'>
				<div className='line_1'>
					<span>{newDesc[0]}</span>
					<span className='amount_description'>{newDesc[1]}</span>
				</div>
				<div className='line_2'>
					<span>{newDesc[2]}</span>
				</div>
			</div>)
			: <span>desc</span>
		);
	}

	const { categoryName, description, shortDescription } = category;
	const eventDateText = event ? event.dateAndHourString : null;
	return (
		<div className='eventim-description-container'> {/* ==== -page-headerprouct-title */}

			<div className='-page-headerprouct-title'>
				<CustomHeader text={categoryName} type={HeaderType.Title} />
			</div>

			{description &&
				<div className='prouct-page-header-info'>
					<TextCustomItemComponent
						html={getDescriptionDesignWithMoney(description)}
						icon={{ src: require('../../../../assets/icons/price_tag.svg'), name: 'price tag' }}
						customClass={'block'}
					/>
				</div>
			}

			{(eventVanue || (!event && eventDateAndTime) || eventDateText) &&
				<div className='prouct-page-header-info' style={{borderBottom:' 1px solid lightgray'}}>
					{eventVanue && (
						<TextCustomItemComponent
							customClass='location-event'
							text={eventVanue}
							icon={{ src: require('../../../../assets/icons/pin.svg'), name: Lang.format('Location') }}
						/>
					)}

					{!event && eventDateAndTime ? (
						// Show Category Date & Time
						<TextCustomItemComponent
							customClass='calendar-event'
							text={eventDateAndTime}
							icon={{ src: require('../../../../assets/icons/calendar.svg'), name: Lang.format('EventDate') }}
						/>
					) : eventDateText ? (
						<TextCustomItemComponent
							customClass='calendar-event'
							text={eventDateText}
							icon={{ src: require('../../../../assets/icons/calendar.svg'), name: Lang.format('EventDate') }}
						/>
					) : null}
				</div>
			}
			            {shortDescription && (
                			<div style={{paddingTop:10}}>
                    			<EditorMessage message={shortDescription} />
                			</div>
           			 )}
		</div>
	);
}
export default EventimDescription;
