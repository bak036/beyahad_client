import * as React from 'react';
import {Route, Router, Switch} from 'react-router-dom';
import UpdatePassword from '../../components/BeyhadComponents/Passwords/UpdatePassword/UpdatePassword';
import PaymentPage from '../../components/BeyhadComponents/PaymentPage/PaymentPage';
import ThanksPaymnet from '../../components/BeyhadComponents/PaymentPage/ThanksPayment/ThanksPaymnet';
import {RoutesPath} from '../../consts/RoutesPath';
import CartContainer from '../CartContainer/CartContainer';
import ProductPage from '../ProductPage/ProductPage';
import RegistrationContainer from '../Registration/RegistrationContainer';
import LoadCard from '../../components/BeyhadComponents/BeyhadCard/ChargingCard/LoadCard';
import OrdersHistoryContainer from '../OrdersHistoryContainer/OrdersHistoryContainer';
import EditUserMain from '../../components/BeyhadComponents/EditUser/EditUserMain/EditUserMain';
import {Logger} from 'nofshonit-base-web-client';
import {getValueFromHistroyQuery, getValueFromHistroyQueryWithLength} from '../../utils/authentication/historyUtils';
import Join from '../../components/BeyhadComponents/LoginAndRegistration/Join/Join';
import MintErrorContainer from '../MintErrorContainer/MintErrorContainer';
import EventimProductPage from '../EventimProductPage/EventimProductPage';
import MintSuccessPageContainer from './MintFinishProcessContainer/MintSuccessPageContainer';
import MintFailurePageContainer from './MintFinishProcessContainer/MintFailurePageContainer';
import { useState } from 'react';

interface IState {
	accessPaymnnent: boolean;
}

interface IProps {
	// Get the history from props in order to pass to <Router...> tag
	history: any;
	accessToken: string;
}

const MintAppRouting : React.FC<IProps> = ({
	history,
	accessToken
}) => {

	const [accessPaymnnent, setAccessPaymnnent] = useState<boolean>(false);


	const setAccessPaymentFunc = (accessPaymnnent) => {
		setAccessPaymnnent(accessPaymnnent)
	};

	const thanksRender = (restProps) => {
		return accessPaymnnent ? (
			<ThanksPaymnet isMint {...restProps} accessToken={accessToken} history={history} />
		) : (
			<PaymentPage
				history={history}
				isMint
				accessToken={accessToken}
				setAccess={setAccessPaymentFunc}
			/>
		);
	};

	const getWalletIdFromUrl = () => {
		return getValueFromHistroyQueryWithLength(history, 'walletId', 4);
	};

	return (
		<Router history={history}>
			<Switch>
				{/* Login & Registration */}
				<Route
					exact
					path={RoutesPath.mint.join}
					component={() => <Join history={history} isMint accessToken={accessToken} />}
				/>
				<Route
					exact
					path={RoutesPath.mint.registration}
					component={() => (
						<RegistrationContainer history={history} isMint accessToken={accessToken} />
					)}
				/>
				<Route
					path={RoutesPath.mint.updatePassword}
					component={() => (
						<UpdatePassword history={history} location={history.location} isMint />
					)}
				/>
				<Route
					path={RoutesPath.mint.updateProfile}
					component={() => <EditUserMain  history={history} isMint accessToken={accessToken} />}
				/>

				{/* Cart */}
				<Route
					exact
					path={RoutesPath.mint.cart}
					component={(restProps) => (
						<CartContainer
							isMint
							accessToken={accessToken}
							{...restProps}
							setAccess={setAccessPaymentFunc}
						/>
					)}
				/>
				<Route exact path={RoutesPath.mint.cartPayment} component={thanksRender} />

				{/* Category */}
				{/* <Route exact path={RoutesPath.mint.productPage} component={ProductPage} isMint/> */}
				<Route
					exact
					path={RoutesPath.mint.productPage}
					component={(restProps) => <ProductPage isMint accessToken={accessToken} {...restProps} />}
				/>
				<Route
					exact
					path={RoutesPath.mint.eventimProductPage}
					component={(restProps) => <EventimProductPage isMint accessToken={accessToken} {...restProps} />}
				/>

				{/* LoadCard */}
				{/*<Route
					path={RoutesPath.mint.loadCard}
					component={({match}) => <LoadCard isMint cardId={match.params.walletId} />}
				/>*/}
				<Route
					path={RoutesPath.mint.loadCard}
					component={() => (
						<LoadCard isMint history={history} accessToken={accessToken} cardId={getWalletIdFromUrl()} />
					)}
				/>

				{/* history */}
				<Route exact path={RoutesPath.mint.history} component={OrdersHistoryContainer} isMint />

				{/* error */}
				<Route exact path={RoutesPath.mint.error} component={MintErrorContainer} />

				{/* FinishProcess */}
				<Route exact path={RoutesPath.mint.successPage} component={MintSuccessPageContainer} />
				<Route exact path={RoutesPath.mint.failurePage} component={MintFailurePageContainer} />
			</Switch>
		</Router>
	);
}
export default MintAppRouting;
