import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import * as React from 'react';

interface Props {
	componentToRender?: any;
	visible: boolean;
	closable?: boolean;
	onCancel?: () => void;
	width? : string;
}
interface IState {}

const CustomModal : React.FC<Props> = ({
	componentToRender,
	visible,
	closable,
	onCancel,
	width
}) => {

	const handleOk = () => {
		// this.setState({loading: true});
		// setTimeout(() => {
		// 	this.setState({loading: false, visible: false});
		// }, 3000);
	};

	const handleCancel = (e) => {
		if (onCancel){
			onCancel();
		}
	};

	return (
		<Modal width={`${width}`} visible={visible} title='' onOk={handleOk} onCancel={handleCancel} footer={null} closable={closable}>
			{componentToRender}
		</Modal>
	);
}
export default CustomModal;
