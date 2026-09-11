import * as React from 'react';
import CustomButtonBeyahad from 'src/components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import Lang from '../../../config/Language';
import {CustomHeader, HeaderType} from 'nofshonit-base-web-client';

interface IProps {
	history?: any;
    text: string;
    isMint?: boolean;
}

const ComponentContentEmpty : React.FC<IProps> = ({
    history,
    text,
    isMint
}) => {

    return (
    <div className="not-found-inner-con">
        <div className="not-found-text">
            <CustomHeader text={text} type={HeaderType.Title} />
            {!isMint && (
                <CustomButtonBeyahad 
                    buttonText={Lang.format('HomePage')}
                    onClick={()=>history.push(`/`)}						
                />
            )}
        </div>
    </div>
    );
}
export default ComponentContentEmpty;
