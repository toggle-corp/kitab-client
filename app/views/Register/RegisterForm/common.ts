import {
    ObjectSchema,
    PartialForm,
    emailCondition,
    requiredCondition,
    requiredStringCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
} from '@togglecorp/toggle-form';

import { UserUserType } from '#generated/types';

interface BaseExtraFields {
    name: string;
    municipality: string;
    wardNumber: number;
    localAddress: string;
    panNumber: string;
    vatNumber: string;
}

interface InstitutionFields extends BaseExtraFields {
}

interface PublisherFields extends BaseExtraFields {
}

interface SchoolFields extends BaseExtraFields {
}

// FIXME: use generated typing
export interface RegistrationFields {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    userType: UserUserType;
    phoneNumber: string;
    institution?: InstitutionFields;
    publisher?: PublisherFields;
    school?: SchoolFields;
}

export type RegisterFormType = PartialForm<RegistrationFields>;

export type RegisterFormSchema = ObjectSchema<RegisterFormType, RegisterFormType>;
export type RegisterFormSchemaFields = ReturnType<RegisterFormSchema['fields']>;

export type InstitutionType = NonNullable<RegisterFormType['institution']>;
export type InstitutionSchema = ObjectSchema<PartialForm<InstitutionType>, RegisterFormType>;
export type InstitutionSchemaFields = ReturnType<InstitutionSchema['fields']>;

export type PublisherType = NonNullable<RegisterFormType['publisher']>;
export type PublisherSchema = ObjectSchema<PartialForm<PublisherType>, RegisterFormType>;
export type PublisherSchemaFields = ReturnType<PublisherSchema['fields']>;

export type SchoolType = NonNullable<RegisterFormType['school']>;
export type SchoolSchema = ObjectSchema<PartialForm<SchoolType>, RegisterFormType>;
export type SchoolSchemaFields = ReturnType<SchoolSchema['fields']>;

export const schema: RegisterFormSchema = {
    fields: (currentFormValue): RegisterFormSchemaFields => {
        const baseSchema: RegisterFormSchemaFields = {
            email: [emailCondition, requiredStringCondition],
            userType: [requiredCondition],
            password: [
                requiredStringCondition,
                lengthGreaterThanCondition(4),
                lengthSmallerThanCondition(129),
            ],
            phoneNumber: [
                requiredStringCondition,
                lengthGreaterThanCondition(9),
                lengthSmallerThanCondition(15),
            ],
        };

        const extraSchema = {
            name: [],
            municipality: [requiredStringCondition],
            wardNumber: [requiredCondition],
            localAddress: [],
            panNumber: [requiredCondition],
            vatNumber: [requiredCondition],
        };

        switch (currentFormValue?.userType) {
            case 'INDIVIDUAL_USER':
                return {
                    ...baseSchema,
                    firstName: [requiredCondition],
                    lastName: [requiredCondition],
                };
            case 'INSTITUTIONAL_USER':
                return {
                    ...baseSchema,
                    institution: {
                        fields: () => extraSchema,
                    },
                };
            case 'PUBLISHER':
                return {
                    ...baseSchema,
                    publisher: {
                        fields: () => extraSchema,
                    },
                };
            case 'SCHOOL_ADMIN':
                return {
                    ...baseSchema,
                    school: {
                        fields: () => extraSchema,
                    },
                };
            default:
                return baseSchema;
        }
    },
};