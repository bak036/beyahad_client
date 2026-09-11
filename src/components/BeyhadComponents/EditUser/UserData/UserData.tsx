import {observer} from 'mobx-react';
import * as React from 'react';
import User from '../../../../models/User';

interface Props {
	user: User;
}

interface IState {}

const UserData : React.FC<Props> = ({
	user
}) => {
	return <div className={'user-data-container'}>hi</div>;
}
export default UserData;
