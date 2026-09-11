import { observer } from 'mobx-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';

interface IState {
	urlLink: any;
}

interface Props {
	message: string;
	textClassName?: string;
	newlineToBr?: boolean;
	doNotCheckLink?: boolean;
}

const EditorMessage : React.FC<Props> = ({
	message,
	textClassName,
	newlineToBr,
	doNotCheckLink
}) => {

	const [urlLink,setUrlLink] = useState<any>(null);

	useEffect(() => {
		extractUrlFromMessage();
	},[])

	const extractUrlFromMessage = () => {

		if (!doNotCheckLink && message && message.includes('<a ') && !message.includes('.dts.') && !message.includes('.hist.') && !message.includes('externalLink')) {

			let link = message.substring(message.indexOf('href'), message.indexOf('>'));
			const isBlank = link.includes('_blank')
			const matches = link.match(/\bhttps?:\/\/\S+/gi);
			if (matches && matches[0]) {
				setUrlLink({ url: matches[0].slice(0, -1), blank: isBlank })
			}
		}
	}
	const formattedMessage = () => {
		let messageToDisplay;
		if (newlineToBr) {
			messageToDisplay = message ? message.replace(/\r\n/g, '<br />') : '';
		} else {
			messageToDisplay = message;
		}
		return messageToDisplay;
	};

	const clickHandler = (e) => {
		const el = e.target.closest("a");
		if (!doNotCheckLink && el && e.currentTarget.contains(el) &&
			!el.href.includes('.dts.') && !el.href.includes('.hist.') && !el.href.includes('externalLink')) {
			e.preventDefault();
			ExternalLinkConfirm.OpenLinkExternal(el.href, el.getAttribute('target'));
		}
	}

	return (
		<div
			className={`editor-message ${textClassName ? textClassName : ''}`}
			onClick={clickHandler}
			dangerouslySetInnerHTML={{
				__html: formattedMessage(),
			}}
		/>
	);
}
export default EditorMessage;



