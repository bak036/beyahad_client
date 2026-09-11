import * as React from 'react';
import {BrowserRouter, Route, Switch, Router} from 'react-router-dom';
import CustomLink from '../../../components/CustomComponents/CustomLink/CustomLink';
import GalLink1Component from './GalLink1Component';
import GalLink2Component from './GalLink2Component';

const MenuAndContentComponent : React.FC = ({}) => {
	return (
		<div className='menu-and-content-container'>
			<div className='menu'>{renderMenu()}</div>
			<div className='content'>{renderContent()}</div>
		</div>
	);
}

const renderMenu = () => {
	return (
		<div className='menu'>
			<CustomLink text='link1' route='/howToUse/link1' />
			<CustomLink text='link2' route='/howToUse/link2' />
		</div>
	);
};

const renderContent = () => {
	return (
		<div className='content'>
			this is content
			<Route exact component={GalLink1Component} path={'/howToUse/link1'} />
			<Route exact component={GalLink2Component} path={'/howToUse/link2'} />
		</div>
	);
};
export default MenuAndContentComponent;
