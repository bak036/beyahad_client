import * as React from 'react';
import {CustomHeader, CustomSpan, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';
import rootStores from '../../../../../stores';
import MessagesStore from '../../../../../stores/MessagesStore';
import { MESSAGES_STORE} from '../../../../../consts/stores';
import { useState } from 'react';

interface Props {
	onCancel: () => void;
	onCancelOrderClicked: () => void;
	requriedAproove?:boolean ;
	agreeCheckBox: boolean;
}
interface IState {
	agreeCheckBox: boolean;

}
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const CancelatioLevelTwoModal : React.FC<Props> = ({
	onCancel,
	onCancelOrderClicked,
	requriedAproove,
	agreeCheckBox
}) => {

	const [agreeCheckBoxVar, setAgreeCheckBoxVar] = useState<boolean>(false);
  
	const checkBoxClicked = ( ) => { 
		setAgreeCheckBoxVar(!agreeCheckBoxVar)
	};

	const getDefaultModel =()=>{
		return(	<div className='sub-text-container'>
					<CustomSpan text={`האם אתם בטוחים שברצונכם לבטל את ההזמנה?`} />
				</div>);
		}

		const 	btnCancelClick = () =>{
			if(requriedAproove&&!agreeCheckBoxVar)
				return;
			setAgreeCheckBoxVar(false)
			onCancelOrderClicked();
		}
		const btnExsitClick = () =>{
			setAgreeCheckBoxVar(false)
			onCancel();
		}

		const getExternalCouponModel =()=> {
			return(	<div className='sub-text-container coupon'  >
						<div  
							dangerouslySetInnerHTML={{
							__html: messagesStore.MessageForCancelExternalCoupon,
						}}
							/>
							<br/>
						<div className={'new-user-agreement'}>
						<div className='agreement-container hilight'>
							<span className='check-box' onClick={checkBoxClicked}>
								{agreeCheckBoxVar && <img src={require('../../../../../assets/checks.png')} alt="" />}
							</span>
							<span className='agreement-text'>אני מאשר/ת</span>
						</div>
						</div>
					</div>
		);}

		return (
			<div className='cancel-modal-level2'>
				<div className='icon-x'>
					<div><p>x</p></div>
				</div>
				<div className='header-container'>
					<CustomHeader containerClassName={'center'} text={'ביטול הזמנה'} />
				</div>
				{requriedAproove?getExternalCouponModel():getDefaultModel()}
				{/* <div className='btn-group'>
					<div className='cancel-btn'>
						<CustomButton
							buttonClassName={'primary-design center'}
							text={Lang.format('CloseWithoutCancel')}
							onClick={() => this.btnExsitClick()}
						/>
					</div>
					<div className='cancel-order-btn'>
						<CustomButton
							buttonClassName={`red center`}
							disabled={this.props.requriedAproove&&!this.state.agreeCheckBox}
							text={'אישור ביטול'}
							onClick={() => this.btnCancelClick()}
						/>
					</div>
				</div> */}
				<div className='buttons-container' >
					<div onClick={() => btnCancelClick()} className={`white-button blue-button ${requriedAproove&&!agreeCheckBoxVar ? 'disabled' : 'blue-button-hover'}`}>
						{requriedAproove ? 'אישור ביטול' : 'ביטול הזמנה'}
					</div>
					<div onClick={() => btnExsitClick()} className={`white-button blue-button-hover`}>
						{Lang.format('CloseWithoutCancel')}
					</div>
				</div>
			</div>
		);
	}
export default CancelatioLevelTwoModal;
