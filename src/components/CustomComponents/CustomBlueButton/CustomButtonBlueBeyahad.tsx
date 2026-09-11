import * as React from 'react';
import Lang from '../../../config/Language';


interface IProps {
    isBackgroundColor?: boolean;
    customClass?: string;
    onClick?: any;
    isCurserPointer?: boolean;
    buttonText: string;
    disabled?: boolean;
    isOneButton?: boolean;
}

interface Icon {
    src: string;
    alt: string;
}

const CustomButtonBlueBeyahad : React.FC<IProps> = ({
    onClick,
    buttonText,
    isOneButton,
}) => {
    return (
        <div className={`blue-button ${isOneButton ? 'blue-one-button' : ''}`} onClick={onClick}>
            {buttonText}
        </div>
    );
}
export default CustomButtonBlueBeyahad;