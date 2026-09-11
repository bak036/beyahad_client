import * as React from 'react';
import {observer} from 'mobx-react';
import {CustomHeader, HeaderType, CustomInputText, TextTypes, Logger, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';

interface Props {
	coupon?: string;
	setCopun: (code) => void;
	sendCopunRequest: (price, code) => void;
}
interface IState {}
const CouponCode : React.FC<Props> = ({
	coupon,
	setCopun,
	sendCopunRequest
}) => {
	const onCodeDiscountClicked = () => {
		if (coupon) {
			//need to check if the code is valid with the server.

			Logger.debug('check the code');
		} else {
			Logger.debug('the code are not exsist');
		}
	};

	const onDiscountCodeChange = (value) => {
		const code = value;
		setCopun(code);
	};

	const agreeClicked = () => {
		sendCopunRequest('999999999999', 2800);
	};
	return (
		<div className='cart-form' style={{paddingTop: 15}}>
			<CustomHeader containerClassName={`title-form`} type={HeaderType.Title} text={Lang.format('EnterCopun')} />
			<div className='discount-code-container'>
				<div className='input-and-btn'>
					<div className='input-code'>
						<div className='input-code-text'>
							<CustomInputText
								// labelText={Lang.format('PaymentCode')}
								type={TextTypes.Text}
								value={coupon}
								onChange={onDiscountCodeChange}
								placeholder={Lang.format('Typing')}
							/>
						</div>
						<div className='input-code-btn'>
							<CustomButton
								text={Lang.format('Agree')}
								buttonClassName='primary-design center'
								onClick={agreeClicked}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default observer(CouponCode)
