import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { BIOMETRICS_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import BiometricsStore from 'src/stores/BiometricsStore';

interface Props {
	text: string;
	route?: string;
	containerClassName?: string;
	iconClassName?: string;
	textClassName?: string;
	iconElement?: any;
	iconPosition?: IconPosition;
	exact?: boolean;
	newTab?: boolean;
	isExternalPage?: boolean; // Indicates use navlink/a href
	onClick?: any;
}

interface IState { }

export enum IconPosition {
	Top = 'icon-top',
	Right = 'icon-right',
	Bottom = 'icon-bottom',
	Left = 'icon-left'
}

const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

const CustomLink : React.FC<Props> = ({
	text,
	route,
	containerClassName,
	iconClassName,
	textClassName,
	iconElement,
	iconPosition,
	exact,
	newTab,
	isExternalPage,
	onClick
}) => {

	const onClickFunc = (e) => {
		biometricsStore.postMessageToNativeApp('showBackBtn=true');
		// Code Section
		if (onClick) {
			e.preventDefault();
			onClick(e); // Execute the parent method
		}
	};

	return (
		<>
			{isExternalPage ? (
				<a
					target={newTab ? '_blank' : '_self'}
					onClick={onClickFunc}
					href={route}
					className={`custom-link-container  ${containerClassName} ${iconPosition}`}>
					{iconElement && <div className={`icon-container ${iconClassName}`}>{iconElement}</div>}
					<div className={`text-container ${textClassName}`}>{text}</div>
				</a>
			) : (
				<NavLink
					target={newTab ? '_blank' : ''}
					exact={exact}
					to={route ? route : ''}
					onClick={onClickFunc}
					className={`custom-link-container  ${containerClassName} ${iconPosition}`}
					activeClassName={'selected'}
				>
					{iconElement && <div className={`icon-container ${iconClassName}`}>{iconElement}</div>}
					<div className={`text-container ${textClassName}`}>{text}</div>
				</NavLink>
			)}
		</>
	);
}

var defaultProps = {
	route: '',
	containerClassName: '',
	textClassName: '',
	iconClassName: '',
	iconPosition: IconPosition.Top,
	exact: true,
	newTab: false
};
export default CustomLink;
