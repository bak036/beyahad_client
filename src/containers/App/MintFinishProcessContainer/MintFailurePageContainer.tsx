import {observer} from 'mobx-react';
import * as React from 'react';
import {CustomHeader} from 'nofshonit-base-web-client';
import MintStore from '../../../stores/MintStore';
import rootStores from '../../../stores';
import {MINT_STORE} from '../../../consts/stores';
import Lang from '../../../config/Language';
import { useEffect } from 'react';

interface Props {}

interface IState {}

const mintStore: MintStore = rootStores[MINT_STORE];


const MintFailurePageContainer : React.FC<Props> = ({
}) => {
	
	useEffect(() => {
		mintStore.setMintButtonActivation(false);
	},[])

	return (
		<div className='mint-error-container'>
			<div className='message'>{<CustomHeader text={Lang.format('MintFailurePage')} />}</div>
			<div className='message'>{<CustomHeader text={Lang.format('MintText')} />}</div>
		</div>
	);
}
export default observer(MintFailurePageContainer)
