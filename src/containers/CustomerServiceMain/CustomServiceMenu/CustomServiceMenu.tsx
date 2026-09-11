import * as React from 'react';
import CustomerServiceHeader from '../../../components/BeyhadComponents/CustomerService/CustomerServiceHeader';
import CustomerServiceRoutes from '../CustomerServiceRoutes/CustomerServiceRoutes';

const CustomerServiceMenu  = ({}) => 
{
	return (
		<div className={'customer-service-menu-container'}>
			<CustomerServiceHeader />
			<CustomerServiceRoutes />
		</div>
	);
}
export default CustomerServiceMenu;
