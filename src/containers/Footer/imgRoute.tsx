import { observer } from 'mobx-react';
import * as React from 'react';
import Lang from '../../config/Language';
import { AUTH_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import { CustomSpan } from 'nofshonit-base-web-client';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';

interface IState { }

interface Props {
    link: string;
    text: string;
    src: string;
    history?: any;
    className?: string;
    onClickOverride?: () => void;
}

const authStore: AuthStore = rootStores[AUTH_STORE];

const ImgRoute : React.FC<Props> = ({
    link,
    text,
    src,
    history,
    className,
    onClickOverride,
}) => {

    const sendGoogleAnalytics = (event: any, event_category: any, event_action: any, event_label: any) => {
        GoogleAnalyticsUtils.clickButtonAnalytics(event, event_category, event_action, event_label);
    }
    const openLinkRoute = (url: string) => {
        if (text == 'Contact')
            sendGoogleAnalytics('Customer_Service', 'Customer_Service', 'click', 'לשירות לקוחות');
        window.scrollTo(0, 0);
        // if(url.indexOf('externalLink') > -1)
        //     window.location.replace(url);
        // else
        //     this.props.history.push(url);
        history.push(url);
    }

    const iconPath = `${src}`;
    return (
        <div className={`${className}`} onClick={() => {
            if(!authStore.canActivateAction) return;
            if (onClickOverride) {
                onClickOverride();
                return;
            }
            openLinkRoute(link);
        }}>
            <img className='logo-item' src={require('../../assets/' + iconPath)} />
            <CustomSpan text={Lang.format(text)} />
        </div>
    )
}
export default observer(ImgRoute)
