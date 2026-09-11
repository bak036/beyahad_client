import rootStores from '../stores';
import { AUTH_STORE, MESSAGES_STORE } from '../consts/stores';
import AuthStore from '../stores/AuthStore';
import MessagesStore from '../stores/MessagesStore';
import AlertUtils from './AlertUtils';
import { RoutesPath } from '../consts/RoutesPath';

const ALLOWED_WALLET_STATUS = 1;
const FROZEN_WALLET_STATUS = 2;
const BLOCKED_TITLE_MESSAGE_KEY = 10012666;
const BLOCKED_CONTENT_MESSAGE_KEY = 10012680;
const FROZEN_TITLE_MESSAGE_KEY = 10012663;
const FROZEN_CONTENT_MESSAGE_KEY = 10012681;
const FREEZE_END_DATE_PLACEHOLDER = '[תאריך סיום ההקפאה]';

function formatDateIsrael(date: Date): string {
	const d = String(date.getDate()).padStart(2, '0');
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const y = date.getFullYear();
	return `${d}/${m}/${y}`;
}

/**
 * Attempts to navigate to the digital-wallet page. If the current user's
 * walletStatus is known (not null/undefined) and is anything other than
 * ALLOWED_WALLET_STATUS (1), shows a popup instead of navigating:
 *  - If walletFreezeEndDate is set, uses title 10012663 + content 10012681 (frozen)
 *    and substitutes [תאריך סיום ההקפאה] with the release date (dd/MM/yyyy).
 *  - Otherwise falls back to title 10012666 + content 10012680 (generic blocked).
 *
 * Use this from every entry point that opens the wallet (NavBar, SideBar,
 * ProfileMenu Actions, Footer wallet icons).
 */
export function tryNavigateToLoadCard(history: any): boolean {
	const authStore: AuthStore = rootStores[AUTH_STORE];
	const currentUser = authStore && authStore.currentUser;

	if (currentUser && currentUser.walletStatus != null && currentUser.walletStatus !== ALLOWED_WALLET_STATUS) {
		const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

		if (currentUser.walletStatus === FROZEN_WALLET_STATUS) {
    		const formattedDate = currentUser.walletFreezeEndDate ? formatDateIsrael(currentUser.walletFreezeEndDate) : '';
			Promise.all([
				messagesStore.getSingleMessageFromService(FROZEN_TITLE_MESSAGE_KEY),
				messagesStore.getSingleMessageFromService(FROZEN_CONTENT_MESSAGE_KEY),
			]).then(([title, content]) => {
				const finalTitle = (title || '').split(FREEZE_END_DATE_PLACEHOLDER).join(formattedDate);
				const finalContent = (content || '').split(FREEZE_END_DATE_PLACEHOLDER).join(formattedDate);
				AlertUtils.basicAlert(finalTitle, finalContent);
			});
		} else {
			Promise.all([
				messagesStore.getSingleMessageFromService(BLOCKED_TITLE_MESSAGE_KEY),
				messagesStore.getSingleMessageFromService(BLOCKED_CONTENT_MESSAGE_KEY),
			]).then(([title, content]) => {
				AlertUtils.basicAlert(title || '', content || '');
			});
		}
		return false;
	}

	history.push(RoutesPath.card.cardCharging);
	return true;
}
