import * as React from 'react';


interface Props{
    children:any;  
}

const StickyBar : React.FC<Props> = ({
    children
}) => {
    return (
        <div className='sticky-bar-container'>
            {children}
        </div>
    );
}
export default StickyBar;