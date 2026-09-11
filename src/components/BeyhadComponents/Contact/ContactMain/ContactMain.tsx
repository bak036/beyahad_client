import {CustomHeader, HeaderType} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import Chat from '../Chat/Chat';
import CustomerService from '../CustomerService/CustomerService';
import FormInputs from '../FormInputs/FormInputs';

interface Props {
	history?: any;
}

interface IState {}

const ContactMain : React.FC<Props> = ({
	history
}) => {
	return (
		<div className={'contact-container'}>
			<div className={'contact-padding'}>
				{/* <div className={'title-container'}>
					<CustomHeader type={HeaderType.Title} text={Lang.format('ContactTitle')} />
				</div> */}
				<div className={'body-padding'}>
					<div className={'form-container'}>
						<FormInputs history={history} />
					</div>
				</div>
			</div>
		</div>
	);
}
export default ContactMain;
