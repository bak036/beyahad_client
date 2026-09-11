import * as React from 'react';
import SideMenuTabs from './SideMenuTabs';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { useState } from 'react';

interface Props {
	components: any[];
	isConsumer?: boolean;
}

interface IState {
	selected: number;
}

const ProductPageTabsDesktop : React.FC<Props> = ({
	components,
	isConsumer,
}) => {

	const [selected, setSelected] = useState<number>(0);


	const renderContent = (index) => {
		return (
			<div className='content-text'>
				<div className='text'>
					{!components[index].isHtml && components[index].content}
					{getTabContent()}
				</div>
			</div>
		);
	};

	const getTabContent = () => {
		if (components[selected]) {
			const selectedVar = components[selected];

			if (selectedVar.isHtml && selectedVar.content) {
				const isArray = Array.isArray(selectedVar.content);
				if (isArray && selectedVar.content.length > 0) {
					let getContent = '';
					selectedVar.content.map((content, index) => {
						getContent += `<div key='${index}'>${content}</div>`;
					});
					return <EditorMessage doNotCheckLink={false} message={getContent} />;
				} else {
					return <EditorMessage doNotCheckLink={false} message={selectedVar.content} />;
				}
			}
			else if(selectedVar.content && React.isValidElement(selectedVar.content))
			{
				return selectedVar.content;
			}
		}
		return '';
	}

	const onTabClicked = (selected: number) => {
		
		setSelected(selected);
	};
	return (
		<React.Fragment>
			<div className='side-tabs-menu-container'>
				<SideMenuTabs
					components={components}
					isConsumer={isConsumer}
					onTabClicked={onTabClicked}
				/>
			</div>
			<div className='content-container'>{renderContent(selected)}</div>
		</React.Fragment>
	);
}

export default ProductPageTabsDesktop;
