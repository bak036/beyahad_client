import * as React from 'react';
import { CustomSpan, CustomSeperator } from 'nofshonit-base-web-client';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import Lang from 'src/config/Language';
import { useEffect, useRef, useState } from 'react';


// the props coming from the parent
interface IProps {
    tabComponents: any[];
    history?: any;
    changeTub?: any;
    indexActive: number;

}

// state property for this module to manage current state values oft the component
interface IState {
    selected: number;
}

const CustomTubs : React.FC<IProps> = ({
    tabComponents,
    history,
    changeTub,
    indexActive
}) => {


	const [selected, setSelected] = useState<number>(0);
	const ref = useRef(0);

    useEffect(() => {
        if (indexActive < tabComponents.length && indexActive > -1) {
            setSelected(indexActive)
        }
    },[])

    useEffect(() => {
        if(ref.current != indexActive){
            setSelected(indexActive)
            ref.current = indexActive;
        }
    },[indexActive])


    const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}
    const onTabClicked = (index: number) => {
        if(index == 2)
            sendGoogleAnalytics('my_details_sub_menu','my_details_sub_menu','click','איפוס סיסמא');
        if(index == 1)
            sendGoogleAnalytics('profile_menu','profile_menu','',Lang.format('OrdersHistory'));
        if (changeTub)
            changeTub(index);
        setSelected(index)
    }
    const renderTabs = () => {
        return (
            tabComponents.map((item, index) => (
                <div key={index} className='container'>
                    <div  className={`tub-menu-item ${selected === item.index ? 'active' : ''}`}
                        onClick={() => {
                            onTabClicked(item.index);
                        }}>
                        <p>{item.title}</p>
                    </div>
                    {selected === item.index && <div className='triple'></div>}
                </div>
            ))
        );
    }

    return (
        <div className='tabs-wrapper'>
            <div className={`tabs-container`} style={{ gridTemplateColumns: `repeat(${tabComponents.length}, auto)` }}>
                {renderTabs()}
            </div>
        </div>
    );
}
export default CustomTubs;




