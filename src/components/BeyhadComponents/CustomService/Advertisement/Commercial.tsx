import {observer} from 'mobx-react';
import * as React from 'react';
import {ADVERTING_STORE} from '../../../../consts/stores';
import Comercial from '../../../../models/Comercial';
import rootStores from '../../../../stores';
import AdvertisingStore from '../../../../stores/AdvertisingStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import {throttle} from 'lodash';
import { useEffect } from 'react';
interface Props {
	index: number;
}
interface IState {}

const advertisingStore: AdvertisingStore = rootStores[ADVERTING_STORE];

const Commercial : React.FC<Props> = ({
	index
}) => {

	let ref: any = React.createRef<HTMLDivElement>();
	let inView: boolean = false;
	let scrollListener;

	useEffect(() => {
		const throttleIsInView = throttle(isInView, 300);
		// When the commercial is visible send an impression to google analytics
		scrollListener = window.addEventListener('scroll', throttleIsInView);

		return () => {
			window.removeEventListener('scroll', scrollListener);
		}
	},[])
	

	const isInView = () => {
		try {
			if (!ref) {
				return;
			}

			if (!inView) {
				const windowScrollY = window.scrollY;
				const elementOffsetY = ref && ref.offsetTop;
				if (windowScrollY > elementOffsetY - window.innerHeight) {
					const len = advertisingStore.getCommercialArray.length;
					const advertisement: Comercial | any = advertisingStore.getCommercialArray[index % len];
					inView = true;
					window.removeEventListener('scroll', scrollListener);
					const position = (index % len) + 1 + '';
					//GoogleAnalyticsUtils.onPromoView(advertisement, position);
				}
			}
		} catch (error) {
			// Silent Error
			console.log('Commercial is in view failed.');
		}
	};


	const len = advertisingStore.getCommercialArray.length;
	const position = (index % len) + 1 + '';
	const advertisement: Comercial | any = advertisingStore.getCommercialArray[index % len];
	return (
		<div
			ref={(i) => (ref = i)}
			className='advertisement-main-container'
			onClick={() => GoogleAnalyticsUtils.onPromoClick(advertisement, position)}>
			{advertisement && <EditorMessage textClassName={'advertisement-item'} message={advertisement.messageText} />}
		</div>
	);
}
export default observer(Commercial)
