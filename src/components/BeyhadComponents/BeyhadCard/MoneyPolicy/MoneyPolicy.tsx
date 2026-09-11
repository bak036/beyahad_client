import { observer } from 'mobx-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';
import AuthService from '../../../../services/AuthService';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ViewStore from '../../../../stores/ViewStore';
import { AUTH_STORE, VIEW_STORE } from '../../../../consts/stores';
import { RoutesPath } from '../../../../consts/RoutesPath';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';

interface Props {
    history?: any;
}

const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const DOCUMENT_VERSION_EVENT = 'DOCUMENT_VERSION';
const SCROLL_STATUS_EVENT = 'SCROLL_STATUS';

const MoneyPolicy: React.FC<Props> = ({ history }) => {
    const [iframeKey] = useState<number>(Math.floor(Math.random() * 100000));
    const [approvedVersion, setApprovedVersion] = useState<string | null>(null);
    const [canApprove, setCanApprove] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const versionReceivedRef = useRef<boolean>(false);

    const consentUrl = authStore.currentUser && authStore.currentUser.moneyTermsURL;

    // Listen to messages from the iframe (DOCUMENT_VERSION - once, SCROLL_STATUS - every change).
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data: any = event.data;
            if (!data || typeof data !== 'object') return;
            const type = data.type || data.command;

            if (type === DOCUMENT_VERSION_EVENT && !versionReceivedRef.current) {
                versionReceivedRef.current = true;
                const version = data.payload !== undefined && data.payload !== null
                    ? String(data.payload)
                    : null;
                setApprovedVersion(version);
            } else if (type === SCROLL_STATUS_EVENT) {
                setCanApprove(!!data.payload);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Toggle body class while the money-terms modal is open so we can scope
    // extra overrides (e.g. mask offset) to this specific modal.
    useEffect(() => {
        const cls = 'has-money-policy-modal';
        document.body.classList.add(cls);
        return () => document.body.classList.remove(cls);
    }, []);

    const extractHtmlCodeIdentity = (url: string): string => {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            const segments = parsed.pathname.split('/').filter(Boolean);
            return segments.length > 0 ? segments[segments.length - 1] : '';
        } catch {
            const trimmed = url.split('?')[0].replace(/\/$/, '');
            const segments = trimmed.split('/');
            return segments[segments.length - 1] || '';
        }
    };

    const onApproveClicked = async () => {
        if (!canApprove || submitting || !consentUrl) return;

        setSubmitting(true);
        viewStore.setLoadingView(true);

        try {
            const htmlCodeIdentity = extractHtmlCodeIdentity(consentUrl);
            const body = {
                LinkUrl: document.referrer || window.location.href,
                ConsentUrl: consentUrl,
                HTMLCodeIdentity: htmlCodeIdentity,
                ApprovedVersion: approvedVersion || '',
            };

            await AuthService.userConsentAudit(body);

            // Refresh the current user so needToApproveMoneyTerms is now false.
            try {
                const refreshedUser = await AuthService.loginWithToken();
                authStore.currentUser = refreshedUser;
            } catch (refreshErr) {
                // Silent - even if refresh fails, redirect and let normal guard re-run.
                console.error('MoneyPolicy: loginWithToken refresh failed', refreshErr);
            }

            history.replace(RoutesPath.card.cardCharging);
        } catch (err) {
            ErrorUtils.checkErrorAndShowPopUp(err, '', '');
        } finally {
            viewStore.setLoadingView(false);
            setSubmitting(false);
        }
    };

    if (!consentUrl) {
        return null;
    }

    const modalContent = (
        <div className='money-policy-modal'>
            <div className='money-policy-modal__iframe-wrapper'>
                <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    className='money-policy-modal__iframe'
                    src={consentUrl}
                    title='תנאי שימוש'
                />
            </div>
            <div className='money-policy-modal__actions'>
                {!canApprove && (
                    <span className='money-policy-modal__scroll-hint'>
                        <span>גלול למטה</span>
                        <svg
                            className='money-policy-modal__scroll-arrow'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            aria-hidden='true'
                        >
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M11.4699 20.5299C11.6105 20.6704 11.8012 20.7493 11.9999 20.7493C12.1987 20.7493 12.3893 20.6704 12.5299 20.5299L18.5299 14.5299C18.6036 14.4613 18.6627 14.3785 18.7037 14.2865C18.7447 14.1945 18.7667 14.0952 18.7685 13.9944C18.7703 13.8937 18.7518 13.7937 18.714 13.7003C18.6763 13.6069 18.6202 13.5221 18.5489 13.4509C18.4777 13.3797 18.3929 13.3235 18.2995 13.2858C18.2061 13.2481 18.1061 13.2296 18.0054 13.2313C17.9047 13.2331 17.8054 13.2552 17.7134 13.2961C17.6214 13.3371 17.5386 13.3962 17.4699 13.4699L12.7499 18.1899V3.99993C12.7499 3.80102 12.6709 3.61025 12.5302 3.4696C12.3896 3.32895 12.1988 3.24993 11.9999 3.24993C11.801 3.24993 11.6102 3.32895 11.4696 3.4696C11.3289 3.61025 11.2499 3.80102 11.2499 3.99993V18.1899L6.52991 13.4699C6.46125 13.3962 6.37845 13.3371 6.28645 13.2961C6.19445 13.2552 6.09513 13.2331 5.99443 13.2313C5.89373 13.2296 5.7937 13.2481 5.70031 13.2858C5.60692 13.3235 5.52209 13.3797 5.45087 13.4509C5.37965 13.5221 5.32351 13.6069 5.28579 13.7003C5.24807 13.7937 5.22954 13.8937 5.23132 13.9944C5.23309 14.0952 5.25514 14.1945 5.29613 14.2865C5.33712 14.3785 5.39622 14.4613 5.46991 14.5299L11.4699 20.5299Z'
                                fill='currentColor'
                            />
                        </svg>
                    </span>
                )}
                <button
                    type='button'
                    className='money-policy-modal__btn money-policy-modal__btn--primary'
                    onClick={onApproveClicked}
                    disabled={!canApprove || submitting}
                >
                    אישור התקנון
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            visible={true}
            closable={false}
            maskClosable={false}
            keyboard={false}
            width='1161px'
            title=''
            footer={null}
            wrapClassName='money-policy-modal-wrap'
            maskStyle={{ top: 150, background: '#000', opacity: 0.8 }}
            style={{ top: 60 }}
        >
            {modalContent}
        </Modal>
    );
};

export default observer(MoneyPolicy);
