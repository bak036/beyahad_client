import * as React from 'react';
import {CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';
import Ticket from '../../../../../models/Ticket';

interface Props {
	ticket: Ticket;
	onCancelClick: () => void;
}

interface IState {}
const ShowTicket : React.FC<Props> = ({
	ticket,
	onCancelClick
}) => {
	const {seat, row, orderTicketId} = ticket;
	return (
		<div className={'show-ticket-container'}>
			<div className={'info'}>
				<div className={'info-margin-auto'}>
					<span className={'space'}>{Lang.format('OrdersTicketNumber')}</span>
					<span>{orderTicketId}</span>
				</div>
			</div>

			<div className={'info'}>
				<div className={'info-margin-auto'}>
					<span className={'space'}>{Lang.format('OrdersTicketRow')}</span>
					<span>{row}</span>
				</div>
			</div>

			<div className={'info'}>
				<div className={'info-margin-auto'}>
					<span className={'space'}>{Lang.format('OrdersTicketChairNumber')}</span>
					<span>{seat}</span>
				</div>
			</div>

			<div className={'info button-container'}>
				<CustomButton onClick={onCancelClick} text={Lang.format('CancelOrder')} buttonClassName={'primary-design'} />
			</div>
		</div>
	);
}
export default ShowTicket;
