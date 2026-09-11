import {observer} from 'mobx-react';
import * as React from 'react';
import BiometricsStore from 'src/stores/BiometricsStore';
import {BIOMETRICS_STORE, HOMEPAGE_STORE} from '../../../consts/stores';
import rootStores from '../../../stores';
import HomePageStore from '../../../stores/HomePageStore';
import NofhonitConfigurationLoader from '../../../utils/NofhonitConfigurationLoader';
import CustomAdvertising from '../../CustomComponents/CustomAdvertising';
import TagsAdvertisment from '../CustomService/Advertisement/TagsAdvertisment/TagsAdvertisment';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
}
interface IState {
	tagsNumber?: number;
}

const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

const HomePage : React.FC<Props> = ({
	history,
}) => {

	const [tagsNumber, setTagsNumber] = useState<number>();

	useEffect(() => {
		biometricsStore.postMessageToNativeApp('showHeader=true');
		NofhonitConfigurationLoader.loadConfiguration().then((res) => {
			var tags = res.topTagsNumber || 30;
			setTagsNumber(tags);
		});
	},[])
	return (
		<div className='main-homepage-content'>
			<div style={{padding:'15px'}}>
				<CustomAdvertising history={history} />
			</div>
			
			{tagsNumber && (
				<TagsAdvertisment
					tags={tagsNumber}
					history={history}
					isHomePage={true}
					addCommercialAfterTags={true}
				/>
			)}
		</div>
	);
}
export default observer(HomePage)
