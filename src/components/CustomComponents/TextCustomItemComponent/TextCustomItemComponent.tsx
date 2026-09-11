import * as React from 'react';
import Lang from '../../../config/Language';
import { Linking } from 'react-native';
import BiometricsStore from 'src/stores/BiometricsStore';
import { BIOMETRICS_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';

interface Icon {
    src: string;
    name: string;
}

interface IProps {
    isBold?: boolean;
    text?: string;
    html?: React.ReactElement;
    icon?: Icon;
    customClass?: string;
    spanClassName?: string
    link?: string;
    isExternalUrl?: boolean;
}
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

const TextCustomItemComponent : React.FC<IProps> = ({
    isBold,
    text,
    html,
    icon,
    customClass,
    spanClassName,
    link,
    isExternalUrl
}) => {

    const cleanTextFromHtmlElements = (text: string) => {
        let regex = /(<([^>]+)>)/ig;
        text = String(text).replace(regex, '');
        text = String(text).replace(/&quot;/g, '"');
        return String(text).replace(/&nbsp;/g, ' ');
    }

    const isEmptyOrSpaces = (str: string) => {
        return String(str) === null || String(str).match(/^ *$/) !== null;
    }

    const trySplitToMultipleRows = (str: string) => {
        const lineBreakRegex = /(<br\/?>)/;
        return String(str).split(lineBreakRegex);
    }
    const openLinkUrl = (url: string) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                if (url.includes('tel') && window.localStorage.getItem('webview'))
                    biometricsStore.postMessageToNativeApp(`isLinkToOpenUrl?${url}`);
                else
                    Linking.openURL(url);
            } else {
                ExternalLinkConfirm.OpenLinkExternal(url, '_blank')
            }
        });
    }
    const handleClick = (url) => {
        if (isExternalUrl)
            openLinkUrl(url);
        else
            ExternalLinkConfirm.OpenLinkExternal(url, '_blank')
    }
    const renderTextComponent = () => {
        //const rows = text ? this.trySplitToMultipleRows(text) : text;

        return (
            <React.Fragment>
                {(text || html) && (
                    <div className={`custom-item-wrapper ${customClass ? customClass : ''}`}>
                        {icon &&
                            <span className={'custom-icon'}>
                                <img src={icon.src} title={icon.name} alt={icon.name} />
                            </span>
                        }
                        {text &&
                            (<span className={`custom-text ${isBold ? 'bold' : ''} ${spanClassName ? spanClassName : ''}`}>{cleanTextFromHtmlElements(text)}</span>)
                        }

                        {html && html}
                    </div>
                )}
            </React.Fragment>
        )
    }
    const isLink = !isEmptyOrSpaces(link ? link : '');
    return isLink ? (<span style={{ color: '#0f6bb3' }} onClick={() => handleClick(link)}>{renderTextComponent()}</span>) : renderTextComponent()
}
export default TextCustomItemComponent;