import {CustomHeader, HeaderType} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import CustomLink from '../../../CustomComponents/CustomLink/CustomLink';
import User from '../../../../models/User';

interface Props {
	currentUser: User;
}

interface IState {}

const ProfileGifts : React.FC<Props> = ({
	currentUser
}) => {
	const {firstName, lastName, accsessID, email} = currentUser;
	return (
		<div className={'profile-gifts-container'}>
			<div className={'item'}>
				<CustomHeader text={`${firstName} ${lastName}`} type={HeaderType.Text} />
				<CustomHeader text={',' + Lang.format('ForYou')} type={HeaderType.Text} />
			</div>

			<div className={'item gifts-container'}>
				<span className={'amount-gifts'}>{20}</span>
				<CustomHeader text={Lang.format('Pinukim')} type={HeaderType.Text} />
			</div>

			<CustomLink
				text={Lang.format('PressToActivate')}
				route={'/profile/edit/4'}
				containerClassName={'activate-link'}
				textClassName={'text-container-short-width'}
				iconElement={<span className={'icon-element member-icon'} />}
			/>
		</div>
	);
}
export default ProfileGifts;
