import React, { useEffect } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ListView,
    TextOutput,
    ConfirmButton,
    Tag,
    RadioInput,
    TextInput,
    Pager,
    useAlert,
} from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import {
    removeNull,
    internal,
} from '@togglecorp/toggle-form';
import {
    IoSearch,
    IoCheckmark,
} from 'react-icons/io5';

import EmptyMessage from '#components/EmptyMessage';
import ErrorMessage from '#components/ErrorMessage';
import useStateWithCallback from '#hooks/useStateWithCallback';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    ModerationSchoolListQuery,
    ModerationSchoolListQueryVariables,
    UpdateUserVerificationStatusMutation,
    UpdateUserVerificationStatusMutationVariables,
} from '#generated/types';

import styles from './styles.css';

type VerificationStatusOptionKey = 'all' | 'verified' | 'unverified';
interface VerificationStatusOption {
    key: VerificationStatusOptionKey,
    label: string;
}

const verificationStatusOptions: VerificationStatusOption[] = [
    { key: 'all', label: 'All' },
    { key: 'verified', label: 'Verified' },
    { key: 'unverified', label: 'Unverified' },
];

const verificationStatusKeySelector = (d: VerificationStatusOption) => d.key;
const verificationStatusLabelSelector = (d: VerificationStatusOption) => d.label;

// TODO: Filter by user type school

const MODERATION_SCHOOL_LIST = gql`
query ModerationSchoolList(
    $pageSize: Int,
    $page: Int,
    $search: String,
    $isVerified: Boolean,
) {
    moderatorQuery {
        users(
            pageSize: $pageSize,
            page: $page,
            search: $search,
            userType: SCHOOL_ADMIN,
            isVerified: $isVerified,
        ) {
            totalCount
            results {
                id
                userType
                canonicalName
                email
                phoneNumber
                isVerified
                school {
                    id
                    name
                    localAddress
                    vatNumber
                    panNumber
                    schoolId
                    wardNumber
                    municipality {
                        id
                        name
                        district {
                            id
                            name
                        }
                    }
                }
            }
        }
    }
}
`;

const UPDATE_USER_VERIFICATION_STATUS = gql`
mutation UpdateUserVerificationStatus(
    $userId: ID!,
) {
    moderatorMutation {
        userVerify(id: $userId) {
            ok
            errors
            result {
                id
                isVerified
            }
        }
    }
}
`;

type SchoolItemType = NonNullable<NonNullable<NonNullable<ModerationSchoolListQuery['moderatorQuery']>['users']>['results']>[number];
const schoolItemKeySelector = (d: SchoolItemType) => d.id;

interface SchoolItemProps {
    user: SchoolItemType;
}

function SchoolItem(props: SchoolItemProps) {
    const { user } = props;

    const school = user?.school;
    const alert = useAlert();

    const [
        updateUserVerificationStatus,
        { loading: userVerificationLoading },
    ] = useMutation<
        UpdateUserVerificationStatusMutation,
        UpdateUserVerificationStatusMutationVariables
    >(
        UPDATE_USER_VERIFICATION_STATUS,
        {
            onCompleted: (response) => {
                const userVerify = response?.moderatorMutation?.userVerify;
                if (!userVerify) {
                    return;
                }

                const {
                    errors,
                    ok,
                } = userVerify;

                if (ok) {
                    alert.show(
                        'User verification successful',
                        { variant: 'success' },
                    );
                } else if (errors) {
                    const transformedError = transformToFormError(
                        removeNull(errors) as ObjectError[],
                    );
                    alert.show(
                        <ErrorMessage
                            header="User Verification Successful"
                            description={
                                isDefined(transformedError)
                                    ? transformedError[internal]
                                    : undefined
                            }
                        />,
                        { variant: 'error' },
                    );
                }
            },
            onError: (errors) => {
                alert.show(
                    <ErrorMessage
                        header=" Failed to verify user."
                        description={errors.message}
                    />,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleVerifyButtonClick = React.useCallback(() => {
        updateUserVerificationStatus({
            variables: {
                userId: user.id,
            },
        });
    }, [user, updateUserVerificationStatus]);

    if (!school) {
        return null;
    }

    return (
        <div className={styles.schoolItem}>
            <div className={styles.details}>
                <div className={styles.nameAndAddress}>
                    <div className={styles.name}>
                        {school.name}
                    </div>
                    <div className={styles.address}>
                        {school.localAddress && (
                            <div>
                                {school.localAddress}
                            </div>
                        )}
                        {`
                            ${school.municipality.name}-${school.wardNumber},
                            ${school.municipality.district.name}
                        `}
                    </div>
                </div>
                <TextOutput
                    block
                    label="Phone No."
                    labelContainerClassName={styles.label}
                    value={(
                        <a
                            className={styles.phoneLink}
                            href={`tel:${user.phoneNumber}`}
                        >
                            {user.phoneNumber}
                        </a>
                    )}
                    hideLabelColon
                />
                <TextOutput
                    block
                    label="Email"
                    labelContainerClassName={styles.label}
                    value={(
                        <a
                            className={styles.emailLink}
                            href={`mailto:${user.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {user.email}
                        </a>
                    )}
                    hideLabelColon
                />
                <TextOutput
                    block
                    className={styles.panNumber}
                    label="PAN"
                    value={school.panNumber}
                    hideLabelColon
                    labelContainerClassName={styles.label}
                />
                <TextOutput
                    block
                    className={styles.schoolId}
                    label="School ID"
                    value={school.schoolId}
                    hideLabelColon
                    labelContainerClassName={styles.label}
                />
            </div>
            <div className={styles.actions}>
                {user.isVerified ? (
                    <Tag
                        icons={<IoCheckmark />}
                    >
                        Verified
                    </Tag>
                ) : (
                    <ConfirmButton
                        name={undefined}
                        variant="tertiary"
                        onConfirm={handleVerifyButtonClick}
                        disabled={userVerificationLoading}
                        message={(
                            <>
                                <div>
                                    Are you sure to mark following school as verified?
                                </div>
                                <strong>
                                    {user.canonicalName}
                                </strong>
                            </>
                        )}
                    >
                        Verify
                    </ConfirmButton>
                )}
            </div>
        </div>
    );
}

const MAX_ITEMS_PER_PAGE = 10;

interface Props {
    className?: string;
}

function Schools(props: Props) {
    const { className } = props;

    const [activePage, setActivePage] = React.useState<number>(1);
    const [verified, setVerified] = useStateWithCallback<VerificationStatusOption['key']>(
        'all',
        setActivePage,
    );
    const [search, setSearch] = useStateWithCallback<string | undefined>(undefined, setActivePage);
    const [maxItemsPerPage, setMaxItemsPerPage] = useStateWithCallback<number>(10, setActivePage);

    const isVerifiedFilter = React.useMemo(() => {
        if (verified === 'verified') {
            return true;
        }

        if (verified === 'unverified') {
            return false;
        }

        return undefined;
    }, [verified]);

    useEffect(() => {
        setActivePage(1);
    }, [
        isVerifiedFilter,
        maxItemsPerPage,
        search,
    ]);

    const {
        previousData,
        data = previousData,
        loading,
        error,
    } = useQuery<ModerationSchoolListQuery, ModerationSchoolListQueryVariables>(
        MODERATION_SCHOOL_LIST,
        {
            variables: {
                pageSize: MAX_ITEMS_PER_PAGE,
                page: activePage,
                search,
                isVerified: isVerifiedFilter,
            },
        },
    );

    const schoolItemRendererParams = React.useCallback(
        (_: string, user: SchoolItemType): SchoolItemProps => ({
            user,
        }),
        [],
    );

    return (
        <div
            className={_cs(styles.schools, className)}
        >
            <div className={styles.filters}>
                <TextInput
                    name={undefined}
                    icons={<IoSearch />}
                    value={search}
                    onChange={setSearch}
                    variant="general"
                    label="Search by School Name"
                    type="search"
                />
                <RadioInput
                    label="Verification Status"
                    name={undefined}
                    options={verificationStatusOptions}
                    keySelector={verificationStatusKeySelector}
                    labelSelector={verificationStatusLabelSelector}
                    value={verified}
                    onChange={setVerified}
                />
            </div>
            <ListView
                className={styles.schoolItemList}
                data={data?.moderatorQuery?.users?.results ?? undefined}
                pending={loading}
                rendererParams={schoolItemRendererParams}
                renderer={SchoolItem}
                keySelector={schoolItemKeySelector}
                errored={!!error}
                filtered={false}
                messageShown
                emptyMessage={(
                    <EmptyMessage
                        message="Couldn't find any user"
                        suggestion="There aren't any user at the moment"
                    />
                )}
            />
            <Pager
                className={styles.pager}
                activePage={activePage}
                maxItemsPerPage={maxItemsPerPage}
                itemsCount={data?.moderatorQuery?.users?.totalCount ?? 0}
                onActivePageChange={setActivePage}
                onItemsPerPageChange={setMaxItemsPerPage}
            />
        </div>
    );
}

export default Schools;
