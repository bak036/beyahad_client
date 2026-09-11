import { History } from 'history';
import * as React from 'react';
import { Logger, CustomSpan } from 'nofshonit-base-web-client';
import AuthStore from '../../stores/AuthStore';
import rootStores from '../../stores';
import {AUTH_STORE} from '../../consts/stores';
import { RoutesPath } from 'src/consts/RoutesPath';

interface IState {}

interface IProps {
	history: History;
}

const authStore: AuthStore = rootStores[AUTH_STORE];

const NavFooter : React.FC<IProps> = ({
	history,
}) => {
	const onBackPressed = () => {
		try {
			if(authStore.currentUser && authStore.currentUser.token){
				history.goBack();
			}
			else{
				window.location.href = RoutesPath.login.login;
			}

		} catch (err) {
			Logger.error('error in navigating backward', err);
		}
	};

	const onForwardPressed = () => {
		try {
			history.goForward();
		} catch (err) {
			Logger.error('error in navigating forward', err);
		}
	};

	return (
		<div className="nav-footer">
			<div onClick={onBackPressed} className="nav-button back">
				<i onClick={onBackPressed} className="fas fa-chevron-right" />
				<CustomSpan classNameSpan="nav-footer-button" text={`Back`} />
			</div>
			<div onClick={onForwardPressed} className="nav-button forward">
				<i className="fas fa-chevron-left" />
				<CustomSpan classNameSpan="nav-footer-button" text={`Forward`} />
			</div>
		</div>
	);
}
export default NavFooter;
