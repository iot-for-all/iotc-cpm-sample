import React, { useContext, memo, useRef } from 'react';
import { Appbar } from 'react-native-paper';
import { Platform } from 'react-native';
import { UIContext } from '../contexts/ui';

export interface IAppBarProps {
    title: string,
    hasPrevious?: boolean,
    goBack: (count?: number) => void
}

const ApplicationBar = memo(function (props: IAppBarProps) {
    const { title, hasPrevious, goBack } = props;
    const { state: uiState } = useContext(UIContext);
    let leftIcon = 'menu';
    let leftAction = uiState.headersActions?.left;
    let rightAction = uiState.headersActions?.right;
    if (hasPrevious) {
        leftIcon = 'arrow-left';
        leftAction = function () {
            goBack();
        };
    }
    const rightIcon = Platform.select({
        android: 'dots-vertical',
        ios: 'dots-horizontal'
    }) as string;

    return (<Appbar.Header>
        <Appbar.Action icon={leftIcon} onPress={leftAction} />
        <Appbar.Content title={title} />
        <Appbar.Action icon={rightIcon} onPress={rightAction} />
    </Appbar.Header>)
});


export default ApplicationBar