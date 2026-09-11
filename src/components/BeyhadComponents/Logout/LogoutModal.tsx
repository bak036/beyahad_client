import * as React from 'react';
import { CustomSpan, CustomButton } from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';

interface Props {
	onCancel: () => void;
	onLogoutButtonClicked: () => void;
}
interface IState {}
const LogoutModal = 
({ 
	onCancel,
	onLogoutButtonClicked
 }) => {
	return (
		<div className="logout-container">
			<div className="header-container">
				<CustomSpan text={'האם אתה בטוח שברצונך להתנתק?'} classNameSpan={`center`} />
			</div>
			<div className="buttons-group">
				<div className="stay-button">
					<CustomButtonBlueBeyahad
						buttonText={Lang.format('Stay')}
						onClick={() => onCancel()}
					/>
				</div>
				<div className={'logout-btn'}>
					<CustomButtonBlueBeyahad
						buttonText={Lang.format('Logout')}
						onClick={() => onLogoutButtonClicked()}
					/>
				</div>
			</div>
		</div>
	);
}
export default LogoutModal;
