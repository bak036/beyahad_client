import * as React from 'react';
import {CustomHeader, HeaderType, CustomSpan, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import {ActionType} from '../../../../containers/ProfileCardContainer/ProfileCardContainer';
import MessagesStore from '../../../../stores/MessagesStore';
import rootStores from '../../../../stores';
import {MESSAGES_STORE} from '../../../../consts/stores';
import {observer} from 'mobx-react';
import { kebabCase } from 'lodash';
import { useState } from 'react';
interface Props {
	onBlock: () => void;
	onRetuern: () => void;
	actionType: ActionType;
}
interface IState {
	block: boolean;
}

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const AlertBeforeBlock : React.FC<Props> = ({
	onBlock,
	onRetuern,
	actionType
}) => {

	const [block, setBlock] = useState<boolean>(false);
	const onCheckBoxChanged = (e) => {
		const val = e.target.checked;
		setBlock(val);
	};
	const onBlockClicked = () => {
		if (block) {
			onBlock();
		}
	};

	const onCancelClicked = () => {
		onRetuern();
	};
	return (
		<div className='second-modal-container'>
			<div className='headers-container'>
			<div className='img-first-modal'>
				<img src={require('../../../../assets/card-block-icon.png')} />
			</div>
			<CustomHeader containerClassName="center" text={Lang.format('BlockCard')} />
			<div className='text-container'>
				<p className='first-text'>{Lang.format('BlockCardText')}</p>
			</div>
			<div className='text-container'>
				<p className='second-text'>{`לתשומת ליבך!`}</p>
			</div>
			<div className='text-container'>
				<p className='third-text'>{messagesStore.blockCard}</p>
			</div>
			</div>
			<div className='agreement-container'>
				<div className='agree-checkbox'>
					<input
						style={{cursor: 'pointer'}}
						type='checkbox'
						checked={block}
						onChange={onCheckBoxChanged}
					/>
				</div>
				<div className='agree-text'>
				<div className='text-container'>
					<p className='first-text'>{Lang.format('ConfirmBlock')}</p>
				</div>	
				</div>
			</div>
			<div className='buttons-container' >
				<div onClick={() => onBlockClicked()} className={`blue-button ${block ? 'blue-button-hover' : 'blue-button-disabled'}`}>
					{Lang.format('Block')}
				</div>
				{/* <div className='block-btn'>
					<CustomButton
						text={Lang.format('Block')}
						buttonClassName='secondry-design center smallHeight'
						onClick={this.onBlockClicked}
						disabled={this.state.block ? false : true}
					/>
				</div> */}
				<div onClick={() => onCancelClicked()} className={'blue-button blue-button-hover'}>
					{'ביטול'}
				</div>
				{/* <div className='cancel-btn'>
					<CustomButton
						text={`בטל חסימה והמשך`}
						buttonClassName='primary-design center smallHeight'
						onClick={this.onCancelClicked}
					/>
				</div> */}
			</div>
		</div>
	);
}
export default observer(AlertBeforeBlock)
