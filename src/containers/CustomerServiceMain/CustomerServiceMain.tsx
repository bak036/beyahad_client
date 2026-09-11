import * as React from 'react';
import {BrowserRouter, Route, Switch, Router} from 'react-router-dom';
import {RoutesPath} from '../../consts/RoutesPath';
import ContactContainer from '../ContactContainer/ContactContainer';
import CustomerServiceMenu from './CustomServiceMenu/CustomServiceMenu';
import BreadCrumbs, {Crumbs} from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import Lang from '../../config/Language';
import Yor from '../../components/BeyhadComponents/CustomerService/Contents/Yor/Yor';

interface IProps {
	location: any;
	history?: any;
}

interface IState {}

const CustomerServiceRoutes : React.FC<IProps> = ({
	location,
	history
}) => {

	const renderContent = () => {
		return (
			<div className='content'>
				<Route exact path={RoutesPath.customerService.root} component={ContactContainer} />
				<Route exact path={RoutesPath.customerService.chairmanSpeak} component={Yor} />
			</div>
		);
	};

	const renderBreadCrumbs = () => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs(Lang.format('HomePage'), RoutesPath.root));

		// Get Url Path from props location
		let {pathname} = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		switch (pathname) {
			case RoutesPath.customerService.root:
				crumbsRoute.push(new Crumbs(Lang.format('CustomerService'), RoutesPath.customerService.root));
				break;
			case RoutesPath.customerService.chairmanSpeak:
				crumbsRoute.push(new Crumbs(Lang.format('CustomerService'), RoutesPath.customerService.chairmanSpeak));
				break;
		}
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	return (
		<div className='customer-service-main'>
			{renderBreadCrumbs()}
			<div className='customer-menu-and-content-container'>
				<div className='menu'>
					<CustomerServiceMenu />
				</div>
				<div className='content'>{renderContent()}</div>
			</div>
		</div>
	);
}
export default CustomerServiceRoutes;
