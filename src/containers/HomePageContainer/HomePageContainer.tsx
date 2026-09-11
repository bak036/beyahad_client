import * as React from 'react';
import HomePage from '../../components/BeyhadComponents/HomePage/HomePage';
import {Route} from 'react-router';
import Footer from '../../containers/Footer/Footer';
import MenuNavigation from '../MenuNavigation/MenuNavigation';
import {observer} from 'mobx-react';

interface Props {}
interface IState {}

const HomePageContainer : React.FC<Props> = ({}) => {
	return (
		<div>
			{/* <MenuNavigation /> */}
			<Route path={`/`} exact component={HomePage} />
			<Footer />
		</div>
	);
}
export default HomePageContainer;
