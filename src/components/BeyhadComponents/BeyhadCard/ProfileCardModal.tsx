import * as React from 'react';
import Card from '../../../models/Card';
import {HeaderType, CustomHeader, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';
import AuthStore from '../../../stores/AuthStore';
import rootStores from '../../../stores';
import {AUTH_STORE} from '../../../consts/stores';

interface Props {
	errorMessage?: string;
	onCancel: () => void;
	sendCardMemberOnSMS: () => void;
	cvv?:number;
	expiredDate?:string;
}
interface IState {}

const authStore: AuthStore = rootStores[AUTH_STORE];

const ProfileCardModal : React.FC<Props> = ({
	errorMessage,
	onCancel,
	sendCardMemberOnSMS,
	cvv,
	expiredDate
}) => {
	const formatPhoneNumber = (phoneNumber: string): string => {
		let part1 = phoneNumber.slice(0, 3);
		let part2 = phoneNumber.slice(3, phoneNumber.length);
		return `${part1}-${part2}`;
	};

	const cardNumberString =
		authStore.currentUser && authStore.currentUser.cardNumber
			? authStore.currentUser.cardNumber
			: Lang.format('CardNumberNotFound');
	return (
		<div className='profile-card-main-modal'>
			{errorMessage ? <div><div className='text-coontainer' dangerouslySetInnerHTML={{ __html: errorMessage }} /><div className='buttons-container' >
				<div onClick={() => {sendCardMemberOnSMS();}} className={`blue-button blue-button-hover`}>
						{Lang.format('SendSMS')}
				</div>
				<div onClick={() => onCancel()} className={'blue-button blue-button-hover'}>
					{Lang.format('Cancel1')}
				</div>
			</div></div>
			:
			<div>
			<div className='text-coontainer'>
			<div className='img-first-modal'>
				<img src={require('../../../assets/send-sms.png')} />
			</div>
				{/* <CustomHeader type={HeaderType.Text} text={Lang.format('NumOfYourCard')} containerClassName={'center'} />
				<div className='skyblue-header'>
					<CustomHeader
						text={cardNumberString}
						containerClassName={'center'}
					/>
				</div> */}
			<p className='first-text'>{Lang.format('NumOfYourCard')}</p>
			<div className='card-number'>
				<p className='second-text'>{cardNumberString}</p>
				<img className='copy-icon' style={{cursor:'pointer'}} onClick={()=>{window.navigator['clipboard'].writeText(cardNumberString);}} src={require('../../../assets/copy.png')}></img>
			</div>
			{expiredDate && <p className='third-text'>תוקף הכרטיס: {expiredDate}</p>}
			<p className='fourth-text'>
				<span className='cvv-text'>CVV:&nbsp;</span>
				<span className='cvv-number'>{cvv}</span>
			</p>
			
			<div className='phone-container'>
				<h3>{Lang.format('CreditCardDetailsWillBeSentToTheUpdatedPhoneNumberAtOurSystem') + ':'}</h3>
				<h3 className='bold'>{
						authStore && authStore.currentUser && authStore.currentUser.phoneNumber
							? formatPhoneNumber(authStore.currentUser.phoneNumber)
							: Lang.format('PhoneNumberNotFound')
					}
				</h3>
			</div>
			</div>
			{/* <div className='btn-group'>
				<div className='btn-item'>
					<CustomButton
						buttonClassName={'primary-design center'}
						text={Lang.format('SendSMS')}
						onClick={() => this.props.sendCardMemberOnSMS()}
					/>
				</div>
				<div className='btn-item'>
					<CustomButton
						buttonClassName={'primary-design center'}
						text={Lang.format('Close')}
						onClick={() => this.props.onCancel()}
					/>
				</div>
			</div> */}
			<div className='buttons-container' >
				<div onClick={() => {sendCardMemberOnSMS(); onCancel();}} className={`blue-button blue-button-hover`}>
						{Lang.format('SendSms')}
				</div>
				<div onClick={() => onCancel()} className={'blue-button blue-button-hover'}>
					{Lang.format('Cancel1')}
				</div>
			</div>
			</div>}
		</div>
	);
}
export default ProfileCardModal;
