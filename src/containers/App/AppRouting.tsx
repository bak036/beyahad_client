import * as React from 'react';
import {Route, Router, Switch} from 'react-router-dom';
import HomePage from '../../components/BeyhadComponents/HomePage/HomePage';
import Join from '../../components/BeyhadComponents/LoginAndRegistration/Join/Join';
import Login from '../../components/BeyhadComponents/LoginAndRegistration/Login/Login';
import ConfirmOrderComponent from '../../components/BeyhadComponents/OrdersHistory/ShowsHistory/ShowVarient/ConfirmOrderComponent';
import PageNotFound from '../../components/BeyhadComponents/PageNotFound/PageNotFound';
import ForgotPassword from '../../components/BeyhadComponents/Passwords/ForgotPassword/ForgotPassword';
import UpdatePassword from '../../components/BeyhadComponents/Passwords/UpdatePassword/UpdatePassword';
import PaymentPage from '../../components/BeyhadComponents/PaymentPage/PaymentPage';
import ThanksPaymnet from '../../components/BeyhadComponents/PaymentPage/ThanksPayment/ThanksPaymnet';
import {env} from '../../config';
import {RoutesPath} from '../../consts/RoutesPath';
import CartContainer from '../CartContainer/CartContainer';
import CategoryContainer from '../Category/CategoriesContainer/CategoriesContainer';
import showAllCategoriesPage from '../Category/CategoriesContainer/CategoriesPage/showAllCategoriesPage';
import CategoryLobby from '../Category/CategoryLobby/CategoryLobby';
import CustomerServiceMain from '../CustomerServiceMain/CustomerServiceMain';
import EventimProductPage from '../EventimProductPage/EventimProductPage';
import HowToUse from '../HowToUse/HowToUse';
import BarSearch from '../MenuNavigation/BarSearch/BarSearch';
import ProductPage from '../ProductPage/ProductPage';
import ProfileCardContainer from '../ProfileCardContainer/ProfileCardContainer';
import ProfileRoutes from '../ProfileMain/ProfileRoutes/ProfileRoutes';
import RegistrationContainer from '../Registration/RegistrationContainer';
import LoginWithShortCode from '../../components/BeyhadComponents/Passwords/LoginWithShortCode/LoginWithShortCode';
import * as _ from 'lodash';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import IframeLink from '../ProfileCardContainer/IframeLink/IframeLink';
import BiometricsSettings  from 'src/components/BeyhadComponents/LoginAndRegistration/BiometricsSettings/BiometricsSettings';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { useEffect, useState } from 'react';
interface IState {
	accessPaymnnent: boolean;
}

interface IProps {
	// Get the history from props in order to pass to <Router...> tag
	history: any;
}

const AppRouting : React.FC<IProps> = ({
	history
}) => {

	const [accessPaymnnent, setAccessPayment] = useState<boolean>(false);
	let unlisten: any = null;
	let previousLocation: string = '';

	useEffect(() => {
		unlisten = history.listen((location, action) => {
			const currentLocation = _.get(location, 'pathname', '');

			// when location changes fire - handleRouteChange
			if (previousLocation !== _.get(location, 'pathname', '')) {
				previousLocation = currentLocation;
				handleRouteChange(location);
			}
		});

		handleRouteChange(history.location);

		return () => {
			unlisten();
		}
	},[])
	

	const handleRouteChange = (location: any) => {
		if (location) {
			const path = _.get(location, 'pathname', '');
			// GoogleAnalyticsUtils.onLocationChange(path);
		}
	};

	const setAccessPaymentFunc = (accessPaymnnent) => {
		setAccessPayment(accessPaymnnent);
	};

	const thanksRender = (restProps) => {
		return accessPaymnnent ? (
			<ThanksPaymnet {...restProps} history={history} setAccess={setAccessPaymentFunc}/>
		) : (
			<PaymentPage history={history} setAccess={setAccessPaymentFunc} />
		);
	};

	window.scrollTo(0, 0);
	return (
		<Router history={history}>
			<Switch>
				{/* Home */}
				<Route exact path='/' component={HomePage} />

				{/* Login & Registration */}
				<Route exact path={RoutesPath.login.login} component={Login} />
				<Route exact path={RoutesPath.login.join} component={Join} />
				<Route exact path={RoutesPath.login.registration} component={RegistrationContainer} />
				<Route
					path={RoutesPath.login.updatePasswordFromForgotPassword}
					render={() => <UpdatePassword history={history} fromForgotPasswordProp />}
				/>
				<Route
					path={RoutesPath.login.updatePasswordFromRegistration}
					render={() => <UpdatePassword history={history} fromRegistration />}
				/>
				<Route exact path={RoutesPath.login.forgotPassword} component={ForgotPassword} />
				<Route
					path={RoutesPath.login.withShortCode}
					render={() => <LoginWithShortCode history={history} />}
				/>

				<Route
					path={RoutesPath.login.initialBiometrics}
					render={() => <BiometricsSettings history={history} />}
				/>

				{/* Profile */}
				<Route path={RoutesPath.profile.root} component={ProfileRoutes} />
				<Route path={`${RoutesPath.profile.confirmOrder}/:orderGuid`} component={ConfirmOrderComponent} />

				{/* Profile & Profile/Card */}
				<Route exact path={RoutesPath.card.iframe} component={IframeLink} />
				<Route path={RoutesPath.card.root} component={ProfileCardContainer} />

				{/* Cart */}
				<Route
					exact
					path={RoutesPath.cart.root}
					render={(restProps) => <CartContainer {...restProps} setAccess={setAccessPayment} />}
				/>
				<Route exact path={RoutesPath.cart.payment} render={thanksRender} />

				{/* Category */}
				<Route exact path={RoutesPath.category.productPage} component={ProductPage} />
				<Route exact path={RoutesPath.category.lobby} component={CategoryLobby} />
				<Route exact path={RoutesPath.category.products} component={CategoryContainer} />
				<Route exact path={`${RoutesPath.category.searchCategory}/:search`} component={BarSearch} />
				<Route exact path={`${RoutesPath.category.searchCategory}/`} component={BarSearch} />
				<Route exact path={RoutesPath.category.showAllCategories} component={showAllCategoriesPage} />
				<Route exact path={RoutesPath.category.eventimProductPage} component={EventimProductPage} />
				<Route exact path={`${RoutesPath.iframe}`} component={IframeLink}/>

				{/* Customer Service */}
				<Route path={RoutesPath.customerService.root} component={CustomerServiceMain} />


				{/* How To Use - Gal component */}
				{env !== 'prod' && <Route path={RoutesPath.howToUse} component={HowToUse} />}

				{/* Page Not Found */}
				<Route component={PageNotFound} />
			</Switch>
		</Router>
	);
}
export default AppRouting;
