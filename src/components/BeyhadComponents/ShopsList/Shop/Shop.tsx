import * as React from 'react';
import { isNullOrUndefined } from 'util';

interface Props {
	shop: any;
}

interface IState {}
const Shop : React.FC<Props> = ({
	shop
}) => {

const addDefaultSrc = (ev) => {
	ev.target.parentNode.style.display = "none!important";
	ev.target.src = 'https://sanitationsolutions.net/wp-content/uploads/2015/05/empty-image.png';
	}

	const {logoURL, chainName} = shop;

	const nullImage = 'https://sanitationsolutions.net/wp-content/uploads/2015/05/empty-image.png';
	return <img src={logoURL ? logoURL : nullImage} onError={addDefaultSrc} className={'shop-logo'} alt={chainName ? chainName : ''} />;
}
export default Shop;
