import * as React from 'react';
import ContactMain from '../../components/BeyhadComponents/Contact/ContactMain/ContactMain';

interface Props {
	history?: any;
}

interface IState {}

const ContactContainer : React.FC<Props> = ({
	history
}) => {

	return (
		<div>
			<div>
				<ContactMain history={history} />
			</div>
		</div>
	);
}
export default ContactContainer
