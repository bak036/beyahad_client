import * as React from 'react';
import { CustomSpan, CustomSeperator } from 'nofshonit-base-web-client';
import EditorMessage from '../../BeyhadComponents/EditorMessage/EditorMessage';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useState } from 'react';

// the props coming from the parent
interface IProps {
    tabComponents: any[];
    history?: any;
}

// state property for this module to manage current state values oft the component
interface IState {
    selected: number;
}

const TabsHorizontalComponent : React.FC<IProps> = ({
    tabComponents,
    history
}) => {
	const [selected,setSelected] = useState<number>(0);

    const sendGoogleAnalytics = (title: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics('product_page','product_page','click',title)
	}
    
    const onTabClicked = (selectedTabIndex: number) => {
        
        sendGoogleAnalytics(tabComponents[selectedTabIndex].title);
        setSelected(selectedTabIndex)
        const isLink = tabComponents[selectedTabIndex].isLink;
        if (isLink)
            history.push(tabComponents[selectedTabIndex].routeTo)
    }

    const renderTabs = () => {
        return (
            tabComponents.map((comp, index) => (
                <React.Fragment key={index}>
                    <div className={`horizontal-menu-item ${selected === index ? 'selected' : ''}`}
                        onClick={() => {
                            onTabClicked(index);
                        }}>
                        <div className={`title-container`}>
                            <CustomSpan
                                text={comp.title}
                                classNameSpan={`title-item`}
                            ></CustomSpan>
                        </div>
                    </div>
                </React.Fragment>
            ))
        );
    }

    const getTabContent = () => {
        ;
        if (tabComponents[selected]) {
            const selectedVar = tabComponents[selected];

            if (selectedVar.isHtml && selectedVar.content) {
                const isArray = Array.isArray(selectedVar.content);
                if (isArray && selectedVar.content.length > 0) {
                    let listContent = '';
                    selectedVar.content.map((content, index) => {
                        listContent += `<div key=${index}>${content}</div>`;
                    });
                    return <EditorMessage doNotCheckLink={false} message={listContent} />;
                } else {
                    return <EditorMessage doNotCheckLink={false} message={selectedVar.content} />;
                }
            }
            else if (selectedVar.content && React.isValidElement(selectedVar.content)) {
                return selectedVar.content; // refactor here to include a factory of specific 
                // elements (location content tab, for example)
            }
        }

        return '';
    }

    const renderContent = () => {
        const selectedIndex = selected;
        const isHtml = tabComponents[selectedIndex].isHtml;
        const isLink = tabComponents[selectedIndex].isLink;
        if (isLink)
            return <></>;
        return (
            <div className={`content-text`}>
                <div className={`text`}>
                    {!isHtml && tabComponents[selectedIndex].content}
                    {isHtml && getTabContent()}
                </div>
            </div>
        );
    }

    return (
        <div className='tabs-component-wrapper'>
            <div className='tabs-title-container-wrapper'>
                <div className={`tabs-title-container`} style={{ gridTemplateColumns: `repeat(${tabComponents.length}, auto)` }}>
                    {renderTabs()}
                </div>
            </div>
            <div className={`tabs-content-container`}>
                {renderContent()}
            </div>
        </div>
    );
}
export default TabsHorizontalComponent;




