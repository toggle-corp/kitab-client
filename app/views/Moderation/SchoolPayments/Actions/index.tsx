import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
} from '@the-deep/deep-ui';

import { Payment } from '../index';

export interface Props {
    className?: string;
    onEditClick: (data: string) => void;
    data: Payment;
}

function Actions(props: Props) {
    const {
        className,
        onEditClick,
        data,
    } = props;

    const handleEditClick = useCallback(() => {
        onEditClick(data.id);
    }, [onEditClick, data]);

    return (
        <div className={_cs(className)}>
            <QuickActionButton
                name={undefined}
                title="Edit payment"
                onClick={handleEditClick}
            >
                <FiEdit2 />
            </QuickActionButton>
        </div>
    );
}

export default Actions;
