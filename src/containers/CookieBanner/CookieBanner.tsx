import * as React from 'react';
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import rootStores from 'src/stores';
import { AUTH_STORE, MESSAGES_STORE } from 'src/consts/stores';
import AuthStore from 'src/stores/AuthStore';
import MessagesStore from 'src/stores/MessagesStore';
import EditorMessage from 'src/components/BeyhadComponents/EditorMessage/EditorMessage';
import { RoutesPath } from 'src/consts/RoutesPath';

interface Props {
	history?: any;
}

const authStore: AuthStore = rootStores[AUTH_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const CookieBanner: React.FC<Props> = observer(({ history }) => {
  const [visible, setVisible] = useState(false);

  const [renderFlag, setRenderFlag] = useState(false);

useEffect(() => {
  const unlisten = history.listen(() => {
    setRenderFlag(f => !f);
  });

  const accepted = authStore.currentUser.cookiesAcceptedDate;

  if (
    !accepted &&
    !!authStore.currentUser.identityNumber &&
    !window.location.pathname.includes(RoutesPath.login.registration) &&
    !window.location.pathname.includes(RoutesPath.login.login) &&
    !window.location.pathname.includes(RoutesPath.login.join)
  ) {
    setVisible(true);
  } else {
    setVisible(false);
  }

  return () => unlisten();
}, [
  authStore.currentUser.identityNumber,
  authStore.currentUser.cookiesAcceptedDate,
  renderFlag
]);

  const acceptCookies = () => {
    setVisible(false);
    authStore.updateMemberCookiesAcceptedDate()
  };

  return (
    <div className={`cookie-banner ${visible ? "active" : ""}`}>
      <button className='close' onClick={acceptCookies}>X</button>
      <EditorMessage textClassName={'accept-cookies-message'} message={messagesStore.acceptCookiesText} />
      <button className='accept' onClick={acceptCookies}>הבנתי</button>
    </div>
  );
})

export default CookieBanner;
