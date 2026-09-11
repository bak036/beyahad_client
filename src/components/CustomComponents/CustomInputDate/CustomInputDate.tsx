import {CustomLabel, TextTypes} from 'nofshonit-base-web-client';
import * as React from 'react';

interface Props {
	value: string;
	onChange?: (val: string) => void;
	placeholder?: string;
	color?: string;
	disabled?: boolean;
	icon?: string;
	labelText?: string;
}

interface IState {}

const CustomInputDate : React.FC<Props> = ({
	value,
	onChange,
	placeholder,
	color,
	disabled,
	icon,
	labelText
}) => {

	const onChangeFunc = (e) => {
		// Variable Definition
		const value = e.target.value;
		e.preventDefault();
		// Code Section
		if (onChange) {
			onChange(value);
		}
	};

	return (
		<div className={'input-date-container'}>
			<div className={`custom-input-label-container`}>
				<CustomLabel text={labelText} />
			</div>
			<input
				type={'date'}
				className={'unstyled'}
				placeholder={placeholder}
				onChange={onChangeFunc}
				value={value}
				disabled={disabled}
			/>
		</div>
	);
}
export default CustomInputDate;
