import * as React from 'react';
import User from '../../../../models/User';
import {CustomHeader, HeaderType, CustomSpan} from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import Card from '../../../../models/Card';

interface Props {
	currentUser: User;
	onLogOutClicked;
}

interface IState {}

const ProfileDetails : React.FC<Props> = ({
	currentUser,
	onLogOutClicked
}) => {

	const {firstName, lastName, cardNumber} = currentUser;
	return (
		<div className={'profile-details-container'}>
			<CustomHeader
				containerClassName={'user-name'}
				headerClassName={'user-name-text'}
				text={`${Lang.format('Hello')}, ${firstName} ${lastName}`}
				type={HeaderType.SubTitle}
			/>
			<div className={'profile-member'}>
				<CustomSpan text={`מספר כרטיס המועדון:`} />
				&nbsp;
				<CustomSpan
					classNameSpan={'card-number'}
					text={`${cardNumber ? cardNumber : Lang.format('CardIsNotConnected')}`}
				/>
				<img className='copy-icon' style={{cursor:'pointer'}} onClick={()=>{window.navigator['clipboard'].writeText(cardNumber);}} src={require('../../../../assets/copy.png')}></img>
			</div>
			<div className={'profile-email'}>{`${currentUser.email}`}</div>
			<CustomSpan
				onClick={onLogOutClicked}
				text={Lang.format('Logout')}
				classNameSpan={'underline cursor-pointer blue-normal logOutText'}
			/>
		</div>
	);
}
export default ProfileDetails;
