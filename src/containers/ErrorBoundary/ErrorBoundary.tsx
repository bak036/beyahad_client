import * as React from 'react';

interface IState {}

interface IProps {
}

export default class ErrorBoundary extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = ({ hatError: false });
    }

    componentDidCatch(error, errorInfo) {
        //logErrorToMyService(error, errorInfo);
    }

    render() {
        return this.props.children;
    }
}