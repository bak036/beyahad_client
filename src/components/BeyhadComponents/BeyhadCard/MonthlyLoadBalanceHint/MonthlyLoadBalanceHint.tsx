import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import Popover from 'antd/lib/popover';
import 'antd/lib/popover/style/css';

import rootStores from '../../../../stores';
import { MESSAGES_STORE, AUTH_STORE } from '../../../../consts/stores';
import MessagesStore from '../../../../stores/MessagesStore';
import AuthStore from '../../../../stores/AuthStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { RoutesPath } from '../../../../consts/RoutesPath';

import './MonthlyLoadBalanceHint.scss';

interface Props {
    amount: number;
    history?: any;
}

const HINT_MESSAGE_KEY = 10012648;
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

// Simple module-level cache so we only hit the API once across all instances/renders.
let cachedHintText: string | null = null;
let inflightHintRequest: Promise<string> | null = null;

const loadHintText = (): Promise<string> => {
    if (cachedHintText !== null) {
        return Promise.resolve(cachedHintText);
    }
    if (inflightHintRequest) {
        return inflightHintRequest;
    }
    inflightHintRequest = messagesStore
        .getSingleMessageFromService(HINT_MESSAGE_KEY)
        .then((res) => {
            cachedHintText = (res as string) || '';
            return cachedHintText;
        })
        .catch(() => {
            cachedHintText = '';
            return '';
        })
        .then((val) => {
            inflightHintRequest = null;
            return val;
        });
    return inflightHintRequest;
};

const MonthlyLoadBalanceHint: React.FC<Props> = ({ amount }) => {
    const [hintText, setHintText] = useState<string>(cachedHintText || '');
    const [visible, setVisible] = useState<boolean>(false);
    const closeTimerRef = useRef<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!cachedHintText) {
            loadHintText().then((text) => {
                if (!cancelled) {
                    setHintText(text);
                }
            });
        }
        return () => {
            cancelled = true;
            if (closeTimerRef.current !== null) {
                window.clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    const cancelPendingClose = () => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const openHint = () => {
        cancelPendingClose();
        setVisible(true);
    };

    const scheduleCloseHint = () => {
        cancelPendingClose();
        // Small delay lets the user move the cursor from the icon into the popover body without it closing.
        closeTimerRef.current = window.setTimeout(() => {
            setVisible(false);
            closeTimerRef.current = null;
        }, 120);
    };

    const toggleHint = () => {
        cancelPendingClose();
        setVisible((prev) => !prev);
    };

    const hasHint = !!hintText && hintText.length > 0;
    const moneyTermsURL = authStore.currentUser && authStore.currentUser.moneyTermsURL;

    const content = hasHint ? (
        <div
            className='monthly-load-balance-hint__popover-body'
            onMouseEnter={openHint}
            onMouseLeave={scheduleCloseHint}
        >
            <EditorMessage message={hintText} />
            {moneyTermsURL && (
                <>
                    {' '}
                    <Link
                        className='monthly-load-balance-hint__terms-link'
                        to={`${RoutesPath.card.iframe}?link=${moneyTermsURL}`}
                    >
                        בתקנון הארנק הדיגיטלי
                    </Link>
                </>
            )}
        </div>
    ) : null;

    return (
        <p className='monthly-load-balance-hint'>
            <span className='monthly-load-balance-hint__label'>
                {`יתרה לטעינה החודש: `}
            </span>
            <span className='monthly-load-balance-hint__amount'>
                {`${amount.toFixed(2)} ₪`}
            </span>
            {hasHint && (
                <Popover
                    content={content}
                    trigger='click'
                    placement='top'
                    overlayClassName='monthly-load-balance-hint__popover'
                    visible={visible}
                    onVisibleChange={(next) => {
                        // Fires when antd wants to change visibility (e.g. click outside).
                        cancelPendingClose();
                        setVisible(next);
                    }}
                >
                    <span
                        className='monthly-load-balance-hint__icon'
                        role='button'
                        tabIndex={0}
                        aria-label='מידע נוסף על יתרה לטעינה חודשית'
                        onMouseEnter={openHint}
                        onMouseLeave={scheduleCloseHint}
                        onClick={toggleHint}
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 330 330'
                            aria-hidden='true'
                            focusable='false'
                        >
                            <path
                                fill='currentColor'
                                d='M165 0C74.019 0 0 74.02 0 165.001 0 255.982 74.019 330 165 330s165-74.018 165-164.999S255.981 0 165 0zm0 300c-74.44 0-135-60.56-135-134.999S90.56 30 165 30s135 60.562 135 135.001C300 239.44 239.439 300 165 300z'
                            />
                            <path
                                fill='currentColor'
                                d='M164.998 70c-11.026 0-19.996 8.976-19.996 20.009 0 11.023 8.97 19.991 19.996 19.991 11.026 0 19.996-8.968 19.996-19.991 0-11.033-8.97-20.009-19.996-20.009zM165 140c-8.284 0-15 6.716-15 15v90c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15v-90c0-8.284-6.716-15-15-15z'
                            />
                        </svg>
                    </span>
                </Popover>
            )}
        </p>
    );
};

export default observer(MonthlyLoadBalanceHint);
