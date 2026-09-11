import { CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CustomHeader, HeaderType } from 'nofshonit-base-web-client';
import Lang from 'src/config/Language';
import { useEffect, useRef, useState } from 'react';
import { CustomMediaQuery } from '../CustomMediaQuery/CustomMediaQuery';

export class Crumbs {
	routeDisplayName: string;
	route: string;
	constructor(routeDisplayName: string, route: string) {
		this.routeDisplayName = routeDisplayName;
		this.route = route;
	}
}

interface IProps {
	crumbs: Crumbs[];
}

interface IState {
	titlePage: string;
}

const BreadCrumbs: React.FC<IProps> = ({
	crumbs
}) => {
	const [titlePage, setTitlePage] = useState<string>('');
	const ref = useRef('');

	useEffect(() => {
		initTitle();
	}, [])

	useEffect(() => {
		if (ref.current != titlePage) {
			initTitle();
			ref.current = titlePage;
		}
	}, [titlePage])

	const initTitle = () => {
		if (window.location.pathname.includes('/card/chargingCard') && window.location.pathname != '/card/chargingCard') {
			setTitlePage('טעינת כרטיס');
		} else if (crumbs && crumbs[crumbs.length - 1].routeDisplayName == 'כלל התנועות') {
			setTitlePage('כלל התנועות');
		} else if (crumbs && crumbs[crumbs.length - 1].routeDisplayName == 'שירות לקוחות') {
			setTitlePage('צור קשר');
		} else if (crumbs && crumbs[crumbs.length - 1].routeDisplayName == Lang.format('PaymentAtCheckout')) {
			setTitlePage('תשלום בקופה');
		} else {
			setTitlePage('');
		}
	};

	const crumbsVar = crumbs || [];
	const crumbsLength = crumbs.length;

	return (
		<div>
			<div className={`bread-crumbs-container`}>
				{crumbsVar.map((crumb, index) => {
					const isLastCrumb = index + 1 === crumbsLength;
					return renderCrumb(crumb.routeDisplayName, crumb.route, isLastCrumb, index);
				})}
			</div>
 				{titlePage != "" &&
					<CustomHeader headerClassName='title-header' type={HeaderType.Title} text={titlePage} />
				}
 
		</div>
	);
}

const renderCrumb = (crumbDisplayName: string, crumbRoute: string, isLast: boolean, index: number) => {
	return (
		<React.Fragment key={index}>
			<div className={`single-crumb-container cursor-pointer`} key={index}>
				<Link to={crumbRoute}>
					<CustomSpan text={crumbDisplayName} />
				</Link>
			</div>
			{!isLast && <CustomSpan text={`\u00A0>\u00A0`} />}
		</React.Fragment>
	);
}
export default BreadCrumbs;
