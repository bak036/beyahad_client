import {CustomButton, CustomHeader} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import {useState} from 'react';
import {CardTypes} from '../../../../models/enums';

const AlertPickCards = (props) => {
	const [enableButton, setEnableButton] = useState(true);
	const [cardType, setCardType] = useState(CardTypes.NoCard);

	const pickRadioButton = (type: CardTypes) => {
		setCardType(type);
		setEnableButton(false);
	};

	return (
		<div className='pick-card-container'>
				<div className='img-first-modal'>
					<img src={require('../../../../assets/card-block-icon.png')} />
				</div>
				<CustomHeader containerClassName="center" text={Lang.format('BlockCard')} />

			<div className='pick-card-radio-button margin-top'>
				<input type='radio' name='cardType' onClick={() => pickRadioButton(CardTypes.DigitalCard)} />
				<label>{Lang.format('OrderDigitalCard')}</label>
			</div>
			<div className='pick-card-radio-button'>
				<input type='radio' name='cardType' onClick={() => pickRadioButton(CardTypes.PlasticCard)} />
				<label>{Lang.format('OrderCardAtTheCostOf25')}</label>
			</div>
			<div className='buttons-container' >
				<div onClick={() => props.onPickCard(cardType)} className={`blue-button ${!enableButton ? 'blue-button-hover' : 'blue-button-disabled'}`}>
						{'חסימת כרטיס'}
				</div>
				<div onClick={props.cancelSecondModal} className={'blue-button blue-button-hover'}>
					{`ביטול חסימה`}
				</div>
			</div>
			{/* <CustomButton
				text={'המשך'}
				buttonClassName='secondry-design center smallHeight'
				onClick={() => props.onPickCard(cardType)}
				disabled={enableButton}
			/>
			<CustomButton
				text={`בטל חסימה`}
				buttonClassName='primary-design center smallHeight'
				onClick={props.cancelSecondModal}
			/> */}
		</div>
	);
};

export default AlertPickCards;
