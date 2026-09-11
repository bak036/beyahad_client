import * as React from 'react';
import {CustomSpan, CustomSeperator} from 'nofshonit-base-web-client';
import { useState } from 'react';

interface Props {
	onTabClicked: (index) => void;
	components: any[];
	isConsumer?: boolean;
}
interface IState {
	selected: number;
}

const SideMenuTabs : React.FC<Props> = ({
	onTabClicked,
	components,
	isConsumer
}) => {

	const [selected, setSelected] = useState<number>(0);

	const renderTabs = () => {
		return components.map((comp, index) => (
			<React.Fragment key={index}>
				<div
					className={`menu-side-item`}
					onClick={() => {
						setSelected(index)
						onTabClicked(index);
					}}>
					<div className='logo-container'>
						<img className='icon-item' src={comp.icon} />
					</div>
					<div className='title-container'>
						<CustomSpan
							text={comp.title}
							classNameSpan={`title-item ${selected === index ? 'selected' : ''}`}
						/>
					</div>
				</div>
				<CustomSeperator />
			</React.Fragment>
		));
	};

	return <React.Fragment>{renderTabs()}</React.Fragment>;
}

export default SideMenuTabs;
