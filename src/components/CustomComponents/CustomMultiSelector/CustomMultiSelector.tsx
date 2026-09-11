import * as React from 'react';
import Select from 'antd/lib/select';
import 'antd/lib/select/style/css';
import { useEffect, useState } from 'react';

interface Props {
	options: any[];
	placeholder?: string;
	onChange?: (value) => void;
	isPrimitiveValue?: boolean;
	keyAttribute?: string;
	valueAttribute?: string;
	onSelected?: (value) => void;
	error?: string;
	text?: string;
}
interface IState {
	values: string[];
}

const Option = Select.Option;

const DEFAULT_KEY_ATTR = '_id';
const DEFAULT_VALUE_ATTR = 'name';
const CustomMultiSelector : React.FC<Props> = ({
	options,
	placeholder,
	onChange,
	isPrimitiveValue,
	keyAttribute,
	valueAttribute,
	onSelected,
	error,
	text,
}) => {	/**
	 * This method is used to get the keyAttribute from the props
	 * this is static method because it is used in getDerivedStateFromProps and in the render methods
	 * @param props props from (this.props) or from (props - in getDerivedStateFromProps)
	 */
	const getKeyAttribute = (props) => {
		const keyAttribute: string = props.keyAttribute ? props.keyAttribute : DEFAULT_KEY_ATTR;
		return keyAttribute;
	}

	/**
	 * This method is used to get the valueAttribute from the props
	 * this is static method because it is used in getDerivedStateFromProps and in the render methods
	 * @param props props from (this.props) or from (props - in getDerivedStateFromProps)
	 */
	const getValueAttribute = (props) => {
		const valueAttribute: string = props.valueAttribute ? props.valueAttribute : DEFAULT_VALUE_ATTR;
		return valueAttribute;
	}
	const [values,setValues] = useState<string[]>([]);

	useEffect(() => {
		renderAllOptions();
	},[])
	const onChangeFunc = (key) => {
		setValues([...values,key])
	};
	const onDeslected = (key) => {
		const filltered = values.filter((value) => value !== key);
		setValues(filltered)
	};

	const renderAllOptions = () => {
		const optionsToRend: any[] = [];
		if (isPrimitiveValue) {
			return options.map((option, index) => {
				return <Option key={index}>{option}</Option>;
				// optionsToRend.push(element);
			});
		} else {
			const keyAttributeVar = getKeyAttribute(keyAttribute);
			const valueAttributeVar = getValueAttribute(valueAttribute);
			return options.map((option) => {
				return <Option key={option[keyAttributeVar]}>{option[valueAttributeVar]}</Option>;
			});
		}
	};

	const placeholderVar = placeholder ? placeholder : '';

	return (
		<Select
			showArrow
			mode='multiple'
			style={{width: '100%'}}
			placeholder={placeholder}
			onSelect={onChange}
			onDeselect={onDeslected}>
			{renderAllOptions()}
		</Select>
	);
}
export default CustomMultiSelector;

