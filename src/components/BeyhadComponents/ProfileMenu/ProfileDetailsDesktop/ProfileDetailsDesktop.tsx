import * as React from 'react';
import User from '../../../../models/User';
import { CustomHeader, HeaderType, CustomSpan } from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import Card from '../../../../models/Card';

interface Props {
	currentUser: User;
	onLogOutClicked;
}

interface IState { }

export default class ProfileDetailsDesktop extends React.Component<Props, IState> {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { currentUser } = this.props;
		const { firstName, lastName, cardNumber } = currentUser;
		return (
			<div className={'profile-details-container-desktop'}>
				<div className={'profile-member'}>
					<CustomSpan text={`מספר כרטיס המועדון:`} />
					<div>
						<CustomSpan
							classNameSpan={'card-number'}
							text={`${cardNumber ? cardNumber : Lang.format('CardIsNotConnected')}`}
						/>
						<img className='copy-icon' style={{cursor:'pointer'}} onClick={()=>{window.navigator['clipboard'].writeText(cardNumber);}} src={require('../../../../assets/copy.png')}></img>
					</div>
				</div>
				<div className={'profile-email'}>{`${currentUser.email}`}</div>
				<CustomSpan
					onClick={this.props.onLogOutClicked}
					text={Lang.format('Logout')}
					classNameSpan={'underline cursor-pointer blue-normal logOutText'}
				/>
			</div>
		);
	}
}
