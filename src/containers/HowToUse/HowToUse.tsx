import {observer} from 'mobx-react';
import * as React from 'react';
import BreadCrumbs, {Crumbs} from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import {CustomMediaQuery} from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import {RoutesPath} from '../../consts/RoutesPath';
import {AUTH_STORE} from '../../consts/stores';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import MenuAndContentComponent from './MenuAndContentComponent/MenuAndContentComponent';
import { useEffect, useState } from 'react';

interface IState {
	token: string;
	identity: string;
	pass: string;
	mediaQueryStr: string;
}

const authStore: AuthStore = rootStores[AUTH_STORE];

const HowToUse : React.FC = ({}) => {
	const [token, setToken] = useState<string>('');
	const [identity, setIdentity] = useState<string>('');
	const [pass, setPass] = useState<string>('');
	const [mediaQueryStr, setMediaQueryStr] = useState<string>('aaaaaa');

	useEffect(() => {
		setTimeout(() => {
			setMediaQueryStr('ablbalbal')
		}, 2000);
	},[])

	return (
		<div className='how-to-use-container'>
			<BreadCrumbs crumbs={[new Crumbs('gal', RoutesPath.howToUse), new Crumbs('eliran', RoutesPath.howToUse)]} />
			<div>
				<CustomMediaQuery.Desktop>
					<div>
						{`this is desktop component`}
						{mediaQueryStr}
					</div>
				</CustomMediaQuery.Desktop>
				<CustomMediaQuery.Mobile>
					<div>
						{`this is mobileiiele component`}
						{mediaQueryStr}
					</div>
				</CustomMediaQuery.Mobile>
			</div>
			<MenuAndContentComponent />
		</div >
	);
}
const renderDesktopIs = (isDesktop: any) => {
	return `isDesktop is: ${isDesktop ? 'true' : "FALSE"}`
}
export default observer(HowToUse)
