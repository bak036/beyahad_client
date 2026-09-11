import * as React from 'react';
import Lang from '../../../config/Language';


interface IProps {
    isBackgroundColor?: boolean;
    customClass?: string;
    onClick?: any;
    isCurserPointer?: boolean;
    icon?: Icon;
    buttonText: string;
    disabled?: boolean;
}

interface Icon {
    src: string;
    alt: string;
}

const CustomButtonBeyahad : React.FC<IProps> = ({
    isBackgroundColor,
    customClass,
    onClick,
    isCurserPointer,
    icon,
    buttonText,
    disabled
}) => {
    const iconVar = icon ? icon : { src:'', alt: '' };
    const isBackgroundColorVar = isBackgroundColor === undefined ? true : isBackgroundColor;
    const isCurserPointerVar = isCurserPointer === undefined ? true : isCurserPointer;
    const customClassVar = customClass === undefined ? '' : customClass;
    const disabledVar = disabled === undefined ? false : disabled;

    const handleClick = (event) => {
        if (disabledVar) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (onClick) {
            onClick(event);
        }
    };

    return (
        <div className={`button-wrapper${!(isBackgroundColorVar) ? ' white' : ''} ${customClassVar} ${!(isCurserPointerVar) || disabledVar ? '' : ' cursor-pointer'}`}>
            <div className={`button-con`} 
                onClick={handleClick}>
                <img
                    className='button-icon'
                    src={iconVar.src}
                    alt={iconVar.alt}
                />
                <button 
                className={`button-text`}
                disabled={disabledVar}
                >
                    {Lang.format(buttonText)}
                </button>
            </div>
        </div>
    );
}
export default CustomButtonBeyahad;