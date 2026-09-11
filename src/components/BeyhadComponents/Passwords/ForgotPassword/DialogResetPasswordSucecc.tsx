import * as React from 'react';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';

interface Props {
	phonNumber: any;
    email: any;
    onClick : any;
    message1: any;
    message2: any;
}


const  DialogResetPasswordSucecc = ({
    phonNumber,
    email,
    onClick,
    message1,
    message2
}) => {
    return (
        <div className='reset-password-container'>
            <div className='logo'>
                <img src={require('../../../../assets/email2.png')} alt="" />
            </div>
            <div className='title'>
                קישור לאיפוס סיסמה נשלח בהצלחה
            </div>
            <div className='body1'>
                {message1}
            </div>
            <div className='body2'>
                <div>{phonNumber}</div>
                <div>{email}</div>
            </div>
            <div className='body3'>
            {message2}
            </div>
            <CustomButtonBlueBeyahad 
                buttonText='אישור'
                onClick={onClick}
            />
        </div>
    );
    }
export default DialogResetPasswordSucecc;
