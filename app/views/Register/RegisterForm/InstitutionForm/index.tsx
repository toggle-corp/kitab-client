import React from 'react';
import {
    TextInput,
    NumberInput,
} from '@the-deep/deep-ui';
import {
    getErrorObject,
    useFormObject,
    PartialForm,
    Error,
    SetValueArg,
} from '@togglecorp/toggle-form';

import {
    InstitutionType,
} from '../common';

// import styles from './styles.css';

type InstitutionInputValue = PartialForm<InstitutionType> | undefined;
const defaultInstitutionValue: NonNullable<InstitutionInputValue> = {};

interface Props<K extends string> {
    name: K;
    value: InstitutionInputValue;
    error: Error<InstitutionType>;
    onChange: (value: SetValueArg<InstitutionInputValue> | undefined, name: K) => void;
}

function InstitutionForm<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        error: formError,
        onChange,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultInstitutionValue);
    const error = getErrorObject(formError);

    return (
        <>
            <TextInput
                name="name"
                label="Name of the Institution"
                value={value?.name}
                error={error?.name}
                onChange={setFieldValue}
                placeholder="Togglecorp"
            />
            <NumberInput
                name="wardNumber"
                label="Ward Number"
                value={value?.wardNumber}
                error={error?.wardNumber}
                onChange={setFieldValue}
            />
            <TextInput
                name="localAddress"
                label="Local Address"
                value={value?.localAddress}
                error={error?.localAddress}
                onChange={setFieldValue}
            />
            <TextInput
                name="panNumber"
                label="PAN"
                value={value?.panNumber}
                error={error?.panNumber}
                onChange={setFieldValue}
            />
            <TextInput
                name="vatNumber"
                label="VAT Number"
                value={value?.vatNumber}
                error={error?.vatNumber}
                onChange={setFieldValue}
            />
        </>
    );
}

export default InstitutionForm;
