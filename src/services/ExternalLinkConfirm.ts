import Lang from "src/config/Language";
import { ADVERTING_STORE, AUTH_STORE, BIOMETRICS_STORE, MESSAGES_STORE, VIEW_STORE } from "src/consts/stores";
import rootStores from "src/stores";
import AdvertisingStore from "src/stores/AdvertisingStore";
import BiometricsStore from "src/stores/BiometricsStore";
import MessagesStore from "src/stores/MessagesStore";
import ViewStore from "src/stores/ViewStore";
import AlertUtils from "src/utils/AlertUtils";
import { Linking } from "react-native";
import AuthStore from "src/stores/AuthStore";

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const advertsingStore: AdvertisingStore = rootStores[ADVERTING_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

class ExternalLinkConfirm {
    async addReferralHistory(externalLlink: string, ineerLlink: string) {
        return await advertsingStore.addReferralHistory(externalLlink, ineerLlink);
    }
   async OpenLinkExternal(link, target?) {
    const isWebView = !!window.localStorage.getItem('webview');
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!authStore.isUserLoggedIn || link.includes('.dts.') || link.includes('.hist.') || link.includes('externalLink')) {
        window.open(link, target || "_self");
        return;
    }

    viewStore.setLoadingView(true);

    try {
        const result = await AlertUtils.confirmAlertWithHtmlAndWithOutType(
            'שימו לב',
            messagesStore.messageLeavePage,
            Lang.format('IWantToGoToThePage'),
            Lang.format('IDecidedToStay'),
        );

        if (result.value) {
            await this.addReferralHistory(link, window.location.href);
            biometricsStore.postMessageToNativeApp('showBackBtn=true');

            if (isWebView) {
                setTimeout(() => {
                    Linking.openURL(link);
                }, 0);
            } else if (isSafari) {
                // סאפרי - תמיד פותח באותו דף כדי להימנע מהעברת פוקוס
                window.location.href = link;
            } else {
                // כרום ודפדפנים אחרים - פותח לפי target
                const newWindow = window.open(link, target || "_self");
                // fallback אם popup blocker חוסם
                if (!newWindow || newWindow.closed) {
                    window.location.href = link;
                }
            }
        }
    } catch (error) {
        console.error("Link opening failed", error);
    } finally {
        viewStore.setLoadingView(false);
    }
}

}

export default new ExternalLinkConfirm();
