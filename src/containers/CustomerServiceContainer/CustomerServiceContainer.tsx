import * as React from 'react';
import Accessibilty from '../../components/BeyhadComponents/CustomerService/Contents/Accessibility/Accessibilty';
import Benefits from '../../components/BeyhadComponents/CustomerService/Contents/Bentefits/Benefits';
import ChangesAndNotification from '../../components/BeyhadComponents/CustomerService/Contents/ChangesAndNotifications/ChangesAndNotification';
import CollectStation from '../../components/BeyhadComponents/CustomerService/Contents/CollectStations/CollectStation';
import QuestionsAndAnswer from '../../components/BeyhadComponents/CustomerService/Contents/QuestionsAndAnswers/QuestionsAndAnswer';
import Survey from '../../components/BeyhadComponents/CustomerService/Contents/Survey/Survey';
import '../../components/BeyhadComponents/CustomerService/Contents/Yor/Yor';
import Yor from '../../components/BeyhadComponents/CustomerService/Contents/Yor/Yor';
import Footer from '../../containers/Footer/Footer';
import Contact from '../../components/BeyhadComponents/Contact/ContactMain/ContactMain';
import CustomerServiceMenu from './CustomerServiceMenu/CustomerServiceMenu';
import { useState } from 'react';

interface Props {}
interface IState {
	selected: ContentType;
}

export enum ContentType {
	ContactUs = 'contactUs',
	QustionsAndAnsnwers = 'questionsAndAnswers',
	CollectingStations = 'CollectingStations',
	Survey = 'survey',
	ChangesAndNotifications = 'changesAndNotifications',
	Yor = 'yor',
	Benefits = 'benefits',
	Regulations = 'regulations',
	Chat = 'chat',
	Accessbilty = 'accessbilty',
}

const CustomerServiceContainer : React.FC<Props> = ({
}) => {

	const [selected, setSelected] = useState<ContentType>(ContentType.ContactUs);


	const onMenubuttonClicked = (selected: ContentType) => {
		setSelected(selected)	
	};

	const renderContent = () => {
		switch (selected) {
			case ContentType.ContactUs: {
				return <Contact />;
			}
			case ContentType.Accessbilty: {
				return <Accessibilty />;
			}
			case ContentType.Benefits: {
				return <Benefits />;
			}
			case ContentType.CollectingStations: {
				return <CollectStation />;
			}
			case ContentType.QustionsAndAnsnwers: {
				return <QuestionsAndAnswer />;
			}
			case ContentType.Regulations: {
				return <Accessibilty />;
			}
			case ContentType.Survey: {
				return <Survey />;
			}
			case ContentType.Yor: {
				return <Yor />;
			}
			case ContentType.ChangesAndNotifications: {
				return <ChangesAndNotification />;
			}
			case ContentType.Chat: {
				return <div>chat</div>;
			}
			default: {
				return <Contact />;
			}
		}
	};

	return (
		<React.Fragment>
			<div className='menu-with-content'>
				<div className='menu-main-container'>
					<CustomerServiceMenu onMenubuttonClicked={onMenubuttonClicked} />
				</div>
				<div className='content-container'>{renderContent()}</div>
			</div>
			<Footer />
		</React.Fragment>
	);
}


export default CustomerServiceContainer;
