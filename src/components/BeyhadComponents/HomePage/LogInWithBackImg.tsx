import { MESSAGES_STORE } from "src/consts/stores";
import rootStores from "src/stores";
import MessagesStore from "src/stores/MessagesStore";
import * as React from 'react';
import { CustomMediaQuery } from "src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery";
import { useEffect } from "react";
import { observer } from "mobx-react";

interface Props {

}
interface IState {
    backgroundImg: string;
    stopInterval: any;
}

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];


const LogInWithBackImg : React.FC<Props> = ({
    children
}) => {
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
        <>
            <CustomMediaQuery.Desktop>
                <div className='join-page-back-img' style={{ backgroundImage: `url(${messagesStore.imgBackgroundLoginDesktop})` }}>
                    {children}
                </div>
            </CustomMediaQuery.Desktop>
            <CustomMediaQuery.Mobile>
                <div className='join-page-back-img'>
                    {children}
                </div>
            </CustomMediaQuery.Mobile>
        </>

    );
}
export default observer(LogInWithBackImg);
