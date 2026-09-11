import Pagination from 'antd/lib/pagination';
import {observer} from 'mobx-react';
import * as moment from 'moment';
import {CustomHeader, CustomSpan, HeaderType, CustomButton} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import EventimEvent from '../../../../models/EventimEvent';
import CustomEmptyState from '../../../CustomComponents/CustomEmptyState/CustomEmptyState';
import CustomButtonBeyahad from '../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import { useState } from 'react';

interface Props {
	events: EventimEvent[];
	onEventimEventSelected: (event: EventimEvent) => void;
}

interface IState {
	page: number;
}

const pageSize = 5;

const EventsList : React.FC<Props> = ({
	events,
	onEventimEventSelected
}) => {
	const [page,setPage] = useState<number>(1);

	const onPagingChanged = (page: number) => {
		setPage(page)
	};

	const onTicketsClicked = (event: EventimEvent) => {
		if (event && onEventimEventSelected) {
			onEventimEventSelected(event);
		}
	}

	const renderEvent = (event: EventimEvent, uniqeKey) => {
		// Parse date & time
		const ticketsButton = (
			<div className='event-tickets-button-container'>
				<CustomButtonBeyahad
					customClass = {''}
					onClick={() => {onTicketsClicked(event)}}
					isCurserPointer={true}
					buttonText = {Lang.format('Tickets')}
				/>
			</div>
		);
		return (
			<div className='event-row' key={uniqeKey}>
				{/* Details of event */}
				<div className='event-details-container'>
					<div className='event-name-container'>
						<CustomHeader type={HeaderType.Text} text={event.name} />
					</div>

					<TextCustomItemComponent 
						text={event.venueName}
						icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
					/>

					<TextCustomItemComponent 
						text={`${moment(`${event.eventDate}`).format('DD/MM/YY')} ${Lang.format('inHour')}: ${event.eventTime}`} 
						icon = {{src:require('../../../../assets/icons/calendar.svg'), name:''}}
					/>
					
					{/* Choose tickets button (or "not in stock") */}
					<div className='hide-on-mobile'>{ticketsButton}</div>
				</div>
				{/* Choose tickets button (or "not in stock") */}
				<div className='hide-on-desktop'>{ticketsButton}</div>
			</div>
		);
	};

	const renderCurrentPageEvents = () => {
		const startIndex = (page - 1) * pageSize;
		const endIndex = page * pageSize;
		const eventsToShow = events.slice(startIndex, endIndex);

		return (
			<div className='events-list-rows'>
				{eventsToShow.map((event: EventimEvent, index) => renderEvent(event, index))}
			</div>
		);
	};

	if (events && events.length > 0) {
		return (
			<div className='events-list-container'>
				{/* Title */}
				<div className='title-container'>
					<CustomHeader
						type={HeaderType.SubTitle}
						text={`${Lang.format('ChooseEvent')}:`}
						headerClassName='bold'
					/>					
				</div>
				<div className='hide-on-mobile'>
					<div className={`events-header-varient-titles`}>
						<div className={'events-header-name'}>{Lang.format('Item')}</div>
						<div className={'events-header-location'}>{Lang.format('location')}</div>
						<div className={'events-header-date'}>{Lang.format('eventimDate')}</div>
						<div className={'events-header-choose-ticket'}></div>
					</div>
				</div>
				<div className='hide-on-desktop'>
					<div className={`events-header-varient-titles`}>
						<div className={'events-header-name'}>{Lang.format('Item')}</div>
						<div className={'events-header-choose-ticket'}></div>
					</div>
				</div>
				{/* all shows - with pagination */}
				{renderCurrentPageEvents()}

				<div className='pagination-container-desktop'>
					<Pagination
						defaultCurrent={1}
						current={page}
						total={events.length}
						pageSize={5}
						onChange={onPagingChanged}
					/>
				</div>
			</div>
		);
	} 
	else {
		return (
			<></>
		);
	}
}
export default observer(EventsList)
