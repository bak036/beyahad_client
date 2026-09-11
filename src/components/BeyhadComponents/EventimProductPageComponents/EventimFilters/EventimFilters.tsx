import {CustomHeader, HeaderType, CustomSelector} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import Category from '../../../../models/Category';
import EventimEvent from '../../../../models/EventimEvent';
import EventimStore from '../../../../stores/EventimStore';
import rootStores from '../../../../stores';
import {EVENTIM_STORE} from '../../../../consts/stores';
import TextCustomItemComponent from '../../../../components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import { useEffect, useState } from 'react';
import { isNullOrUndefined } from 'util';
import * as moment from 'moment';

enum FilterOptions {
	FilterDateAndTime = 1,
	FilterTime = 2,
	FilterDate = 3,
}
interface Props {
	productPageCategory: Category;
	onVanueSelected: (selectedVanue: string) => void;
	onDateSelected: (selectedDate: string | null) => void;
	onTimeSelected: (selectedTime: string | null) => void;
}
interface IState {
	vanuesOptions: string[];
	selectedVanue?: string | null;
	selectedDate?: string | null;
	selectedTime?: string | null;
	dateOptions: string[];
	timeOptions: string[];
}

const eventimStore: EventimStore = rootStores[EVENTIM_STORE];
const EventimFilters : React.FC<Props> = ({
	productPageCategory,
	onVanueSelected,
	onDateSelected,
	onTimeSelected,
}) => {

	const [vanuesOptions, setVanuesOptions] = useState<string[]>([]);
	const [selectedVanue, setSelectedVanue] = useState<string | null>();
	const [selectedDate, setSelectedDate] = useState<string | null>();
	const [selectedTime, setSelectedTime] = useState<string | null>();
	const [dateOptions, setDateOptions] = useState<string[]>([]);
	const [timeOptions, setTimeOptions] = useState<string[]>([]);

	useEffect(() => {
		const vanuesOptions = productPageCategory.getEventsVanueNames();
		const dateOptions = productPageCategory.getEventsDates();
		const timeOptions = getEventsTimes();

		setVanuesOptions(vanuesOptions)
		setDateOptions(dateOptions)
		setTimeOptions(timeOptions)
	},[])

	const getEventsTimes = () => {
		if (eventimStore.getFilteredEvents && eventimStore.getFilteredEvents.length > 0) {
			const eventsTimes = {};
			const events = eventimStore.getFilteredEvents;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(timeFormattedString(currentEvent.eventTime))) {
					eventsTimes[timeFormattedString(currentEvent.eventTime)] = true;
				}
			}
			return Object.keys(eventsTimes).sort((a, b) => {
				const aMoment = moment(a, 'HH:mm');
				const bMoment = moment(b, 'HH:mm');
				return aMoment.diff(bMoment);
			});
		}

		return [];
	}
	const getEventsVanueNames = () => {
		if (eventimStore.getFilteredEvents && eventimStore.getFilteredEvents.length > 0) {
			const eventsVanueNames = {};
			const events = eventimStore.getFilteredEvents;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(currentEvent.venueName)) {
					eventsVanueNames[currentEvent.venueName] = true;
				}
			}

			return Object.keys(eventsVanueNames);
		}

		return [];
	}
	const getEventsDates = () => {
		if (eventimStore.getFilteredEvents && eventimStore.getFilteredEvents.length > 0) {
			const eventsDates = {};
			const events = eventimStore.getFilteredEvents;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(dateFormattedString(currentEvent.eventDate))) {
					eventsDates[dateFormattedString(currentEvent.eventDate)] = true;
				}
			}

			return Object.keys(eventsDates).sort((a, b) => {
				const aMoment = moment(a, 'DD/MM/YYYY');
				const bMoment = moment(b, 'DD/MM/YYYY');
				return aMoment.diff(bMoment);
			});
		}

		return [];
	}

	const timeFormattedString = (val) => {
		return val ? moment(val, 'HH:mm:ss').format('HH:mm') : '';
	}
	const dateFormattedString = (val) => {
		return val ? moment(val).format('DD/MM/YYYY') : '';
	}
	
	const renderVaneusSelector = () => {
		return (
			<div className='selectors-container vanues'>
				<CustomSelector
					placeholder='כל המיקומים'
					selectClassName='events-select'
					options={vanuesOptions}
					value={selectedVanue}
					isPrimitiveValue
					onSelected={onVanueSelectedFunc}
				/>
			</div>
		);
	};

	const renderDateTimeSelector = () => {
		return (
			<div className='selectors-container date-time'>
				{/* Date selector */}
				<CustomSelector
					containerClassName='date'
					selectClassName='events-select'
					placeholder='כל התאריכים'
					options={dateOptions}
					value={selectedDate}
					isPrimitiveValue
					onSelected={onDateSelectedFunc}
				/>

				{/* Time selector */}
				<CustomSelector
					containerClassName='time'
					selectClassName='events-select'
					placeholder='כל השעות'
					options={timeOptions}
					value={selectedTime}
					isPrimitiveValue
					onSelected={onTimeSelectedFunc}
				/>
			</div>
		);
	};

	// filterOptions decides which options to show at the CustomSelector

	const filterOptions = (filterType: FilterOptions) => {
		if (filterType == FilterOptions.FilterDateAndTime) {
			productPageCategory.events = eventimStore.getFilteredEvents;
			const dateOptions = getEventsDates();
			const timeOptions = getEventsTimes();
			setDateOptions(dateOptions)
			setTimeOptions(timeOptions)
		} else if (filterType == FilterOptions.FilterTime) {
			productPageCategory.events = eventimStore.getFilteredEvents;
			const vanuesOptions = getEventsVanueNames();
			const timeOptions = getEventsTimes();
			setTimeOptions(timeOptions)
			setVanuesOptions(vanuesOptions)
		} else if (filterType == FilterOptions.FilterDate) {
			productPageCategory.events = eventimStore.getFilteredEvents;
			const dateOptions = getEventsDates();
			const vanuesOptions = getEventsVanueNames();
			setDateOptions(dateOptions)
			setVanuesOptions(vanuesOptions)
		}
	};

	const onVanueSelectedFunc = (value) => {
		setSelectedVanue(value)
		if (onVanueSelected) {
			onVanueSelected(value);
			// when selecting venue, first clear time and date and then filter
			setSelectedTime(null)
			setSelectedDate(null)
			filterOptions(FilterOptions.FilterDateAndTime)
		}
	};

	const onDateSelectedFunc = (value) => {
		setSelectedDate(value)
		if (onDateSelected) {
			onDateSelected(value);
			onTimeSelected(null);
			filterOptions(FilterOptions.FilterTime);
		}
	};

	const onTimeSelectedFunc = (value) => {
		setSelectedTime(value)
		if (onTimeSelected) {
			onTimeSelected(value);
			if (!selectedDate) {
				filterOptions(FilterOptions.FilterDate);
			}
		} else {
			onDateSelected(null);
			filterOptions(FilterOptions.FilterDate);
		}
	};
	return (
		<div className='eventim-filters-container'>
			<CustomHeader
				text={Lang.format('Choose_Area_And_Date')}
				headerClassName='bold'
				type={HeaderType.SubTitle} 
				/>

			<div className='filter-container vaneu-selection-container'>
				<TextCustomItemComponent text = {`${Lang.format('Area_Short')}`} />
				{renderVaneusSelector()}
			</div>
			<div className='filter-container date-time-selection-container'>
			<TextCustomItemComponent text = {`${Lang.format('Date_Short')}`} />
				{renderDateTimeSelector()}
			</div>
		</div>
	);
}
export default EventimFilters;
