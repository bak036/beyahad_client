import * as React from 'react';
import CustomerServiceHeader from '../../../components/BeyhadComponents/CustomerService/CustomerServiceHeader';
import {CustomButton} from 'nofshonit-base-web-client';
import {ContentType} from '../CustomerServiceContainer';
import CustomLink from '../../../components/CustomComponents/CustomLink/CustomLink';
import Lang from '../../../config/Language';
import {RoutesPath} from '../../../consts/RoutesPath';
import { useState } from 'react';

interface Props {
	onMenubuttonClicked: (selected: ContentType) => void;
}
interface IState {
	selected: ContentType;
}

const CustomerServiceMenuMobile : React.FC<Props> = ({
	onMenubuttonClicked
}) => {
	const [selected, setSelected] = useState<ContentType>(ContentType.Chat);

	const onChatClicked = () => {
		setSelected(ContentType.Chat)
		onMenubuttonClicked(ContentType.Chat);
	};
	const onContactClieked = () => {
		setSelected(ContentType.ContactUs)
		onMenubuttonClicked(ContentType.ContactUs);
	};
	const onQuestionCliked = () => {
		setSelected(ContentType.QustionsAndAnsnwers)
		onMenubuttonClicked(ContentType.QustionsAndAnsnwers);
	};
	const onThermsCliked = () => {
		setSelected(ContentType.Regulations)
		onMenubuttonClicked(ContentType.Regulations);
	};

	const onChangeAndNotificationCliked = () => {
		setSelected(ContentType.ChangesAndNotifications)
		onMenubuttonClicked(ContentType.ChangesAndNotifications);
	};
	const onSurveyClicked = () => {
		setSelected(ContentType.Survey)
		onMenubuttonClicked(ContentType.Survey);
	};

	const onYorClicked = () => {
		setSelected(ContentType.Yor)
		onMenubuttonClicked(ContentType.Yor);
	};
	const onAccessbiltyClicked = () => {
		setSelected(ContentType.Accessbilty)
		onMenubuttonClicked(ContentType.Regulations);
	};
	const onBenefitsCliked = () => {
		setSelected(ContentType.Benefits)
		onMenubuttonClicked(ContentType.Benefits);
	};
	const onCollectStationsClicked = () => {
		setSelected(ContentType.CollectingStations)
		onMenubuttonClicked(ContentType.CollectingStations);
	};

	return (
		<React.Fragment>
			<CustomerServiceHeader />
			<div className='menu-mobile-container'>
				<div className='chat-btn-container'>
					{/* <NavLink linkTo={RoutesPath.customerService.root} selected='eliran'/. */}

					<CustomButton
						text={'שיחה עם נציג בצט'}
						buttonClassName={`secondry-design ${selected === ContentType.Chat ? 'selected' : ''}`}
						onClick={onChatClicked}
					/>
				</div>
				<div className='two-btn'>
					<div className='contact-btn-container'>
						<CustomLink text={Lang.format('PersonalInfo')} route={RoutesPath.profile.root} />
					</div>
					<div className='question-answer-btn'>
						<CustomButton
							onClick={onQuestionCliked}
							text={'שאלות ותשובות'}
							color={`lightblue ${selected === ContentType.QustionsAndAnsnwers ? 'selected' : ''}`}
						/>
					</div>
				</div>
				<div className='three-btn'>
					<div className='taknon-btn'>
						<CustomButton
							onClick={onThermsCliked}
							text={'תקנון הכרטיס'}
							color={`lightblue ${selected === ContentType.Regulations ? 'selected' : ''}`}
						/>
					</div>
					<div className='changes-notification-btn'>
						<CustomButton
							onClick={onChangeAndNotificationCliked}
							text={'שינויים ועדכונים'}
							color={`lightblue ${selected === ContentType.ChangesAndNotifications ? 'selected' : ''}`}
						/>
					</div>
					<div className='survey-btn'>
						<CustomButton
							onClick={onSurveyClicked}
							text={'סקר שביעות רצון'}
							color={`lightblue ${selected === ContentType.Survey ? 'selected' : ''}`}
						/>
					</div>
				</div>
				<div className='three-btn'>
					<div className='yor-btn'>
						<CustomButton
							onClick={onYorClicked}
							text={'דבר היור'}
							color={`lightblue ${selected === ContentType.Yor ? 'selected' : ''}`}
						/>
					</div>
					<div className='negishot-btn'>
						<CustomButton
							onClick={onAccessbiltyClicked}
							text={'הצהרת נגישות'}
							color={`lightblue ${selected === ContentType.Accessbilty ? 'selected' : ''}`}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
export default CustomerServiceMenuMobile;
