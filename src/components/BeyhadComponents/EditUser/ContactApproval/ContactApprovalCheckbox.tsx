import * as React from 'react';
import { observer } from 'mobx-react';
import Lang from '../../../../config/Language';
import rootStores from '../../../../stores';
import UserDetailsStore from '../../../../stores/UserDetailsStore';
import { USER_DETAILS_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import MessagesStore from '../../../../stores/MessagesStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { renderToString } from 'react-dom/server';
import { RoutesPath } from 'src/consts/RoutesPath';

const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const ContactApprovalCheckbox: React.FC = () => {
    const formattedText = messagesStore.ContactApprovalText
        .split('.')
        .map(sentence => sentence.trim())
        .filter(Boolean)
        .map(sentence => `${sentence}.<br />`)
        .join('');

    const hasErrorInStore = !!userDetailsStore.isUpdateDetailsApprovedError;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        userDetailsStore.setIsUpdateDetailsApproved(e.target.checked);
    };

    return (
        <div className="contact-approval-container">
            {hasErrorInStore && (
                <div className="contact-approval-error">
                    {userDetailsStore.isUpdateDetailsApprovedError}
                </div>
            )}
            <div className="contact-approval-checkbox-line">
                <label className={`control control--checkbox ${hasErrorInStore ? 'checkbox-error' : ''}`}>
                    <input
                        type="checkbox"
                        id="isUpdateDetailsApproved"
                        style={{ cursor: 'pointer' }}
                        checked={userDetailsStore.isUpdateDetailsApproved}
                        onChange={handleChange}
                    />
                </label>
                <div className="agreement-text">
                    <span className="agree-item-text">
                        {window.location.pathname.includes(RoutesPath.login.registration) && <div
                            dangerouslySetInnerHTML={{
                                __html: messagesStore.privacyPolicyRegistration + '<br/>'
                            }}
                        />}
                        <div
                            dangerouslySetInnerHTML={{
                                __html: formattedText
                            }}
                        />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default observer(ContactApprovalCheckbox);
