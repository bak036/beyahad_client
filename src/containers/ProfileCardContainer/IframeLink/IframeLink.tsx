import { observer } from 'mobx-react';
import {MESSAGES_STORE, AUTH_STORE, FOOTERVIEWSTORE, MENU_STORE, BIOMETRICS_STORE, CONFIGURATION_STORE} from '../../../consts/stores';
import rootStores from '../../../stores';
import FooterViewStore from '../../../stores/FooterViewStore';
import MenuStore from '../../../stores/MenuStore';
import * as React from 'react';
import BiometricsStore from 'src/stores/BiometricsStore';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import { useEffect, useState } from 'react';


const footerViewStore: FooterViewStore = rootStores[FOOTERVIEWSTORE];
const menuStore: MenuStore = rootStores[MENU_STORE];
interface IState {
    link: string,
    key: number
}

interface Props {
}
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
let containerHeight : string = '';
const accessibilityBtnId ="INDmenu-btn";
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const IframeLink : React.FC<Props> = ({
}) => {
    const [link, setLink] = useState<string>('');
    const [key, setKey] = useState<number>(Math.floor(Math.random() * 100000));

    // componentDidMount(): void {
    //     const urlParams = new URLSearchParams(window.location.search);       
    //     this.setState({ link: urlParams.get('link') || '' });
    // }
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const iframeLink = new URL(urlParams.get('link')!);
        if (!configurationStore.config.ExternalLinksPermittedDomains.some(x => iframeLink.host.includes(x))) {
            return;
        }
        setLink(iframeLink.href || '')
	    const accessibilityBtn=	document.getElementById(accessibilityBtnId);
		if(accessibilityBtn !==null){
			accessibilityBtn.style.visibility='hidden';
		}
       
        biometricsStore.postMessageToNativeApp('showBackBtn=true');

        return () => {
            const accessibilityBtn=	document.getElementById(accessibilityBtnId);
            if(accessibilityBtn !==null){
                accessibilityBtn.style.visibility='visible';
            }
        }
    },[])
    
    return (
        <iframe key={key} className='iframe-link' src={link} />
    );
}
export default observer(IframeLink)
