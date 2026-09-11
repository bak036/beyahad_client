import * as React from 'react';
import {CustomHeader, CustomButton, CustomSpan} from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';

interface Props {
	onLoadCard: () => void;
	amount: number;
	onCancel: () => void;
	isDischarge?: boolean;
}
const LoadCardModal : React.FC<Props> = ({
	onLoadCard,
	amount,
	onCancel,
	isDischarge
}) => {

	return (
		<div className='load-card-modal'>
			<CustomHeader
				containerClassName={'center'}
				text={isDischarge ? Lang.format('CancelLoad') : 'טעינת כרטיס'}
			/>
			<div className='content'>
				<div>
					{isDischarge ? (
						<CustomSpan text={`האם את\ה בטוח שאת\ה רוצה לבטל טעינה של ${amount} ₪ לכרטיס?`} />
					) : (
						<CustomSpan text={`האם את/ה בטוח שאת/ה רוצה לטעון ${amount} ₪ לכרטיס?`} />
					)}
				</div>
				<div>
					{isDischarge && (
						<CustomSpan text={'לתשומת ליבך! לא ניתן לבטל את הפעולה לאחר קבלת האישור'} classNameSpan={'bold'} />
					) }
						{/* <CustomSpan text={'לתשומת ליבך! לא ניתן לבטל את הפעולה לאחר טעינת הכרטיס'} classNameSpan={'bold'} /> */}
				</div>
			</div>
			<div className='btn-group'>
				<div className='load-btn'>
					<CustomButtonBlueBeyahad
						// buttonClassName={'center primary-design loed-card-size'}
						buttonText={isDischarge ? 'ביטול טעינה' : 'בצע טעינה'}
						onClick={() => {onLoadCard(),!isDischarge ? GoogleAnalyticsUtils.clickButtonAnalytics('chargeCard','chargeCard','submit_payment_charge_card',Lang.format('CompletePayment'),undefined,undefined,undefined,amount):
						GoogleAnalyticsUtils.clickButtonAnalytics('chargeCancelation','chargeCancelation','submit_unpayment_card',Lang.format('CancelLoad'),undefined,undefined,undefined,amount)}}
					/>
				</div>
				<div className='cancel-btn'>
					<CustomButtonBlueBeyahad
						// buttonClassName={'center secondry-design'}
						buttonText={Lang.format('Cancel')}
						onClick={() => onCancel()}
					/>
				</div>
			</div>
		</div>
	);
}
export default LoadCardModal;
