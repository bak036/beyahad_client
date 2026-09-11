import { observer } from 'mobx-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, Route } from 'react-router-dom';
import { RoutesPath } from 'src/consts/RoutesPath';
import { MESSAGES_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import MessagesStore from 'src/stores/MessagesStore';

interface Props {

}
interface IState {
    backgroundImg: string;
    stopInterval: any;
}

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const HeaderLoginMobile : React.FC<Props> = ({
}) => {

    const [backgroundImg, setBackgroundImg] = useState<string>('');
    const [stopInterval, setStopInterval] = useState<any>(1);

    useEffect(() => {
        if (!messagesStore.imgBackgroundLoginDesktop)
        messagesStore.getSingleMessageFromService(1024).then(res => {
            const backImg = initBackgroundImg(res);
            messagesStore.imgBackgroundLoginDesktop = backImg.replace(/ /g, '%20');
        });
    },[])

    const initBackgroundImg = (message: string) => {
        let tagImgFromMsg = message;

        let myRegexHttps = /<img[^>]+src="(https:\/\/[^">]+)"/g;
        let myRegexHttp = /<img[^>]+src="(http:\/\/[^">]+)"/g;

        let backImgHttps = myRegexHttps.exec(tagImgFromMsg);
        let backImgHttp = myRegexHttp.exec(tagImgFromMsg);

        let backImg = '';

        if (backImgHttps)
            backImg = backImgHttps[1];
        if (backImgHttp)
            backImg = backImgHttp[1];

        return backImg;
    }
    return (
        <Route>
            <div className='header-mobile-container' style={{ backgroundImage: `url(${messagesStore.imgBackgroundLoginDesktop})` }}>
                <span>
                    <p className='title-mobile-header'>ברוכים הבאים</p>
                </span>
                <span className='title-img-header-mobile'>
                    <p className='second-title-mobile-header'>למועדון ההטבות</p>
                    <Link to={RoutesPath.root}>
                        <img src={require('../../../assets/logo-1-copy.png')} alt="logo" />
                    </Link>
                </span>
            </div>
        </Route>
    );
}
export default observer(HeaderLoginMobile)
