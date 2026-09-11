import * as React from 'react';
import {observer} from 'mobx-react';
import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
import rootStores from '../../../../../stores';
import {ORDERS_HISTORY_STORE, VIEW_STORE} from '../../../../../consts/stores';
import ErrorUtils from '../../../../../utils/errorHandling/ErrorUtils';
import ViewStore from '../../../../../stores/ViewStore';
import {CustomHeader} from 'nofshonit-base-web-client';
import EditorMessage from '../../../EditorMessage/EditorMessage';
import BreadCrumbs, { Crumbs } from '../../../../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import Category from '../../../../../models/Category';
import Lang from '../../../../../config/Language';
import { RoutesPath } from '../../../../../consts/RoutesPath';
import CustomButtonBeyahad from '../../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import {CustomMediaQuery} from '../../../../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';

import {
	AUTH_STORE,
} from '../../../../../consts/stores';
import AuthStore from '../../../../../stores/AuthStore';
import AppLoading from '../../../../../containers/AppLoading/AppLoading'
import { Media } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
interface Props {
	match: any;
	history: any;
}
interface IState {
	text: any;
	loading: boolean;
	printMode: boolean;
}

const orderHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const ConfirmOrderComponent : React.FC<Props> = ({
	match,
	history
}) => {

	const [text, setText] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const [printMode, setPrintMode] = useState<boolean>(false);

	let mounted = useRef(false);
	let prevText = useRef('');

	const printContainer = React.createRef<HTMLDivElement>();

	useEffect(()=>{
		if(!mounted.current){
			mounted.current = true;
			authStore.tryLogin();
			try {
				viewStore.setLoadingView(true);
				const orderGuid = match.params.orderGuid;
				orderHistoryStore.getConfirm(orderGuid).then((res) => {
					setText(res);
					viewStore.setLoadingView(false);
					setLoading(false);
					prevText = text;
				});
			} catch (err) {
				viewStore.setLoadingView(false);
	
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
				setLoading(false);
			}
		} else {
			if (text != prevText && !!text) {
				const parser = new DOMParser();
				const doc = parser.parseFromString(text, 'text/html');
	
				// Step 2: Select all script elements
				const scriptElements = doc.querySelectorAll('script');
	
				scriptElements.forEach((scriptElement: any) => {
					const script = document.createElement('script');
					script.text = scriptElement.textContent.trim();
					document.head.appendChild(script);
				});
				prevText = text;
			}
		}},[])

	const printScreenClicked = () => {
		setPrintMode(true);
			setTimeout(() => {
				let html = printContainer.current ? printContainer.current.innerHTML : '';
				let printWin = window.open('', '', 'height=600, width=750')
				if(printWin){
					printWin.document.write(`<html><body>${html}</body></html>`);
					printWin.document.close();
					printWin.print();
				}
			},
		1000);
	};

	const closePrintWindow = () => {
		setPrintMode(false);
	};

	const renderConfirm = () => {
		return <EditorMessage doNotCheckLink={false} textClassName={'contact-message confirm-order'} message={text ? text : <div />} />;

	};
	const renderEmptyState = () => {
		return (
			<div style={{ paddingTop: 15 }}>
				<CustomHeader text={'לא נמצא אישור הזמנה עבור הזמנה זו'} containerClassName={'center'} />
			</div>
		);
	};


	const renderBreadCrumbs = () => {
		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		crumbsRoute.push(new Crumbs(Lang.format('HomePage'), RoutesPath.root));
		crumbsRoute.push(new Crumbs(Lang.format('Profile'), RoutesPath.profile.root));

		// Get Url Path from props location
		let { pathname } = history.location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;
		crumbsRoute.push(new Crumbs(Lang.format('OrdersHistory'), RoutesPath.profile.history));
		crumbsRoute.push(new Crumbs(Lang.format('OrderSummary'), pathname));

		return <BreadCrumbs crumbs={crumbsRoute} />;
	};

	if (loading) {
		return <AppLoading />;
	} else {
		return (
			<div className='order-confirmation-container'>
				<CustomMediaQuery.Desktop>
					{renderBreadCrumbs()}
				</CustomMediaQuery.Desktop>
				<div className='order-confirmation-header'>
					<CustomHeader text={Lang.format('OrderSummary')} />

					<CustomButtonBeyahad
						customClass={'white narrow'}
						onClick={printScreenClicked}
						isCurserPointer={true}
						buttonText={Lang.format('Print')} />

				</div>
				<div className='order-confirmation-content' ref={printContainer}>
					{text.length === 0 ? renderEmptyState() : renderConfirm()}
				</div>
			</div>
		);
	}
}
export default observer(ConfirmOrderComponent);
