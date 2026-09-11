import * as React from 'react';
import Lang from "../../../../config/Language";
import {CustomButton} from 'nofshonit-base-web-client';

const Chat : React.FC = () => {

    return (
        <div className={'chat-container'}>
            <button className={"start-chat-btn"} >{Lang.format("ContactWithPresenter")}</button>
        </div>
    )
}

export default Chat;