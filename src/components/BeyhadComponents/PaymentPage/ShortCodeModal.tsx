import * as React from 'react';
import {
	CustomInputText,
	CustomButton,
	CustomSpan,
	CustomHeader,
	HeaderType,
	TextTypes,
} from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';
import { useState } from 'react';

interface Props {
	onCancel: () => void;
	saveShortCode: (shortCode) => void;
	onPay: () => void;
}
interface IState {
	shortCode: string;
	confirmCode: string;
	shortCodeError: string;
	confirmCodeError: string;
}

const ShortCodeModal : React.FC<Props> = ({
	onCancel,
	saveShortCode,
	onPay
}) => {

  const [shortCode,setShortCode] = useState<string>('')
  const [confirmCode,setConfirmCode] = useState<string>('')
  const [shortCodeError,setShortCodeError] = useState<string>('')
  const [confirmCodeError,setConfirmCodeError] = useState<string>('')

  const onShortCodeChanged = (value) => {
		if (value.length> 14) return;
		clearErrors();
		const shortCode = value;
		setShortCode(shortCode)
	};

	const onConfimedShortCodeChanged = (value) => {
		if (value.length> 14) return;
		clearErrors();
		const confirmCode = value;
		setConfirmCode(confirmCode)
	};

	const validate = () => {
		if (shortCode.length !== 5) {
			setShortCodeError(`${Lang.format('ValidateOnCode')}`)
			return false;
		}
		if (confirmCode.length !== 5) {
			setConfirmCodeError(`${Lang.format('ValidateOnCode')}`)
			return false;
		}
		if (shortCode !== confirmCode) {
			setConfirmCodeError(`${Lang.format('CodeNotMatch')}`)
			return false;
		}
		return true;
	};

	const onSaveShortCodeClicked = () => {
		if (validate()) {
			saveShortCode(shortCode);
			onPay();
		}
	};

	const clearErrors = () => {
		setConfirmCodeError('')
		setShortCodeError('')
	};
	return (
		<div className='short-code-modal-container'>
			<div className='header-container'>
				<CustomHeader
					containerClassName={'center header-container'}
					type={HeaderType.SubTitle}
					text={`בחירת קוד מקוצר`}
				/>
				<div className='span-text'>
					<CustomSpan text={Lang.format('ValidateOnCode')} />
				</div>
			</div>
			<div className='inputs-container'>
				<div className='short-code-container'>
					<CustomInputText
						labelText={Lang.format('ShortCode')}
						type={TextTypes.Password}
						error={shortCodeError}
						value={shortCode}
						onChange={onShortCodeChanged}
					/>
				</div>
				<div className='confirmed-short-code-container'>
					<CustomInputText
						type={TextTypes.Password}
						labelText={Lang.format('RepitCode')}
						error={confirmCodeError}
						value={confirmCode}
						onChange={onConfimedShortCodeChanged}
					/>
				</div>
			</div>
			<div className='btn-container'>
				<div className='save-btn'>
					<CustomButton
						buttonClassName={`center primary-design`}
						text={Lang.format('Save')}
						onClick={onSaveShortCodeClicked}
					/>
				</div>
				<CustomButton
					containerClassName={'cancel-btn'}
					buttonClassName={`center primary-design`}
					text={Lang.format('Cancel')}
					onClick={() => onCancel()}
				/>
			</div>
		</div>
	);
}
export default ShortCodeModal;
