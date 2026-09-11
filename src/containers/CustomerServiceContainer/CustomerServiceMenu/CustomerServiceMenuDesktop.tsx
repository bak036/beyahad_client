import * as React from 'react';
import CustomerServiceHeader from '../../../components/BeyhadComponents/CustomerService/CustomerServiceHeader';
import {CustomButton} from 'nofshonit-base-web-client';
import {ContentType} from '../CustomerServiceContainer';
import {toJS} from 'mobx';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import Lang from 'src/config/Language';
import { useState } from 'react';
interface Props {
	onMenubuttonClicked: (selected: ContentType) => void;
}
interface IState {
	selected: ContentType;
}
const CustomerServiceMenuDesktop : React.FC<Props> = ({
	onMenubuttonClicked
}) => {

	const [selected, setSelected] = useState<ContentType>(ContentType.Chat);

	const onChatClicked = () => {
		setSelected(ContentType.Chat);
		onMenubuttonClicked(ContentType.Chat);
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}

	const onContactClieked = () => {
		sendGoogleAnalytics('Customer_Service','Customer_Service','click',Lang.format('ToCustomerService'));
		setSelected(ContentType.ContactUs);
		onMenubuttonClicked(ContentType.ContactUs);
	};
	
	const onQuestionCliked = () => {
		setSelected(ContentType.QustionsAndAnsnwers);
		onMenubuttonClicked(ContentType.QustionsAndAnsnwers);
	};
	const onThermsCliked = () => {
		setSelected(ContentType.Regulations);
		onMenubuttonClicked(ContentType.Regulations);
	};

	const onChangeAndNotificationCliked = () => {
		setSelected(ContentType.ChangesAndNotifications);
		onMenubuttonClicked(ContentType.ChangesAndNotifications);
	};
	const onSurveyClicked = () => {
		setSelected(ContentType.Survey);
		onMenubuttonClicked(ContentType.Survey);
	};

	const onYorClicked = () => {
		setSelected(ContentType.Yor);
		onMenubuttonClicked(ContentType.Yor);
	};
	const onAccessbiltyClicked = () => {
		setSelected(ContentType.Regulations);
		onMenubuttonClicked(ContentType.Regulations);
	};
	const onBenefitsCliked = () => {
		setSelected(ContentType.Benefits);
		onMenubuttonClicked(ContentType.Benefits);
	};
	const onCollectStationsClicked = () => {
		setSelected(ContentType.CollectingStations);
		onMenubuttonClicked(ContentType.CollectingStations);
	};

	return (
		<div className='menu-with-header-container'>
			<CustomerServiceHeader />
			<div className='menu-desktop-container'>
				<div className='chat-btn-container'>
					<CustomButton
						text={'שיחה עם נציג בצט'}
						buttonClassName={`secondry-design ${selected === ContentType.Chat ? 'selected' : ''}`}
						onClick={onChatClicked}
					/>
				</div>

				<div className='contact-btn-container'>
					<CustomButton
						onClick={onContactClieked}
						text={'צור קשר'}
						color={`lightblue ${selected === ContentType.ContactUs ? 'selected' : ''}`}
					/>
				</div>
				<div className='question-answer-btn'>
					<CustomButton
						onClick={onQuestionCliked}
						text={'שאלות ותשובות'}
						color={`lightblue ${selected === ContentType.QustionsAndAnsnwers ? 'selected' : ''}`}
					/>
				</div>
				<div className='collect-stations'>
					<CustomButton
						onClick={onCollectStationsClicked}
						text={'תחנות איסוף'}
						color={`lightblue ${selected === ContentType.CollectingStations ? 'selected' : ''}`}
					/>
				</div>

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
				<div className='benfits-btn'>
					<CustomButton
						onClick={onBenefitsCliked}
						text={'הטבות הסתדרות'}
						color={`lightblue ${selected === ContentType.Benefits ? 'selected' : ''}`}
					/>
				</div>
			</div>
		</div>
	);
}

export default CustomerServiceMenuDesktop;
