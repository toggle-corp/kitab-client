import React, { useCallback, useMemo, useState } from 'react';
import {
    IoPencil,
    IoArrowForward,
    IoHeart,
    IoPerson,
    IoList,
} from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';
import {
    Button,
    Container,
    ListView,
    TextOutput,
    useModalState,
    Pager,
} from '@the-deep/deep-ui';
import { removeNull } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import routes from '#base/configs/routes';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import {
    SchoolProfileQuery,
    SchoolProfileQueryVariables,
    OrderListSchoolQuery,
    OrderListSchoolQueryVariables,
} from '#generated/types';

import OrderItem, { Props as OrderItemProps, Order } from '#components/OrderItem';

import { school } from '#base/configs/lang';
import useTranslation from '#base/hooks/useTranslation';

import EditSchoolProfileModal from './EditSchoolProfileModal';
import styles from './styles.css';

const SCHOOL_PROFILE = gql`
    query SchoolProfile {
        me {
            id
            email
            fullName
            firstName
            lastName
            phoneNumber
            image {
              name
              url
            }
            school {
                id
                name
                localAddress
                panNumber
                vatNumber
                wardNumber
                municipality {
                    id
                    name
                    district {
                        id
                        name
                    }
                    province {
                        id
                        name
                    }
                }
            }
        }
    }
`;

const ORDER_LIST_SCHOOL = gql`
    query OrderListSchool(
        $pageSize: Int,
        $page: Int,
    ) {
        orders(pageSize: $pageSize, page: $page) {
            page
            pageSize
            totalCount
            results {
                id
                orderCode
                status
                totalPrice
                bookOrders {
                    totalCount
                    results {
                        id
                        isbn
                        title
                        edition
                        price
                        quantity
                        image {
                            name
                            url
                        }
                    }
                }
            }

        }
    }
`;

const orderListKeySelector = (o: Order) => o.id;

const MAX_ITEMS_PER_PAGE = 4;

interface Props {
    className?: string;
}

function SchoolProfile(props: Props) {
    const { className } = props;
    const strings = useTranslation(school);

    const [
        editSchoolProfileModalShown,
        showEditSchoolProfileModal,
        hideEditSchoolProfileModal,
    ] = useModalState(false);

    const {
        data,
        refetch: refetchProfileDetails,
    } = useQuery<SchoolProfileQuery, SchoolProfileQueryVariables>(
        SCHOOL_PROFILE,
    );

    const profileDetails = removeNull(data);

    const [page, setPage] = useState<number>(1);

    const orderVariables = useMemo(() => ({
        pageSize: MAX_ITEMS_PER_PAGE,
        page,
    }), [page]);

    const {
        data: orderList,
        loading,
        error,
    } = useQuery<OrderListSchoolQuery, OrderListSchoolQueryVariables>(
        ORDER_LIST_SCHOOL,
        { variables: orderVariables },
    );

    const orderListRendererParams = useCallback((_, order: Order): OrderItemProps => ({
        order,
    }), []);

    const schoolDetails = {
        ...profileDetails?.me?.school,
        municipality: profileDetails?.me?.school?.municipality?.id,
    };

    return (
        <div
            className={_cs(
                styles.schoolProfile,
                className,
            )}
        >
            <div className={styles.pageContainer}>
                <Container
                    className={styles.profileDetails}
                    contentClassName={styles.profileDetailsContent}
                    heading={strings.profileDetailsHeading}
                    spacing="comfortable"
                    headerActions={(
                        <Button
                            name={undefined}
                            variant="general"
                            onClick={showEditSchoolProfileModal}
                            icons={<IoPencil />}
                        >
                            {strings.editSchoolProfileButtonContent}
                        </Button>
                    )}
                >
                    <div className={styles.schoolDetails}>
                        <div className={styles.displayPicture}>
                            {profileDetails?.me?.image?.url ? (
                                <img
                                    className={styles.image}
                                    src={profileDetails.me.image.url}
                                    alt={profileDetails.me.image.name}
                                />
                            ) : (
                                <IoPerson className={styles.fallbackIcon} />
                            )}
                        </div>
                        <div className={styles.attributes}>
                            <TextOutput
                                spacing="none"
                                block
                                valueContainerClassName={styles.value}
                                label={strings.schoolNameLabel}
                                value={profileDetails?.me?.school?.name}
                            />
                            <TextOutput
                                spacing="none"
                                block
                                valueContainerClassName={styles.value}
                                label={strings.emailLabel}
                                value={profileDetails?.me?.email}
                            />
                            <TextOutput
                                spacing="none"
                                block
                                valueContainerClassName={styles.value}
                                label={strings.phoneNumberLabel}
                                value={profileDetails?.me?.phoneNumber ?? 'Not available'}
                            />
                            <TextOutput
                                label={strings.addressLabel}
                                value={`${
                                    profileDetails
                                        ?.me
                                        ?.school
                                        ?.localAddress
                                }, ${
                                    profileDetails
                                        ?.me
                                        ?.school
                                        ?.municipality
                                        ?.district
                                        ?.name
                                }`}
                            />
                            <TextOutput
                                label={strings.wardNumberLabel}
                                value={profileDetails?.me?.school?.wardNumber}
                            />
                            <TextOutput
                                label={strings.panNumberLabel}
                                value={profileDetails?.me?.school?.panNumber}
                            />
                            <TextOutput
                                label={strings.vatNumberLabel}
                                value={profileDetails?.me?.school?.vatNumber}
                            />
                        </div>
                    </div>
                    <div className={styles.usefulLinks}>
                        <SmartButtonLikeLink
                            route={routes.wishList}
                            variant="general"
                            actions={<IoHeart />}
                        >
                            {strings.myWishlistLabel}
                        </SmartButtonLikeLink>
                    </div>
                    <Container
                        className={styles.orderDetails}
                        withoutExternalPadding
                        heading={strings.orderDetailsHeading}
                        headingSize="small"
                    >
                        <TextOutput
                            label={strings.totalOrdersLabel}
                            value={orderList?.orders?.totalCount}
                        />
                    </Container>
                </Container>
                <Container
                    className={styles.orderDetails}
                    headingSize="small"
                    heading={strings.orderDetailsHeading}
                    spacing="comfortable"
                    headerActions={(
                        <SmartButtonLikeLink
                            route={routes.orderList}
                            actions={<IoArrowForward />}
                            variant="tertiary"
                        >
                            {strings.viewMoreButtonContent}
                        </SmartButtonLikeLink>
                    )}
                    footerContent={(
                        <Pager
                            activePage={page}
                            maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                            itemsCount={orderList?.orders?.totalCount ?? 0}
                            onActivePageChange={setPage}
                            itemsPerPageControlHidden
                        />
                    )}
                >
                    <ListView
                        className={styles.orderList}
                        data={orderList?.orders?.results ?? undefined}
                        keySelector={orderListKeySelector}
                        renderer={OrderItem}
                        rendererParams={orderListRendererParams}
                        messageShown
                        // FIXME: use common component
                        emptyMessage={(
                            <div className={styles.emptyMessage}>
                                <IoList className={styles.icon} />
                                <div className={styles.text}>
                                    <div className={styles.primary}>
                                        {strings.recentOrderEmptyMessage}
                                    </div>
                                    <div className={styles.suggestion}>
                                        {strings.recentOrderEmptySuggestion}
                                    </div>
                                </div>
                            </div>
                        )}
                        errored={!!error}
                        filtered={false}
                        pending={loading}
                    />
                </Container>
                {editSchoolProfileModalShown && (
                    <EditSchoolProfileModal
                        onModalClose={hideEditSchoolProfileModal}
                        onEditSuccess={refetchProfileDetails}
                        profileDetails={schoolDetails}
                    />
                )}
            </div>
        </div>
    );
}

export default SchoolProfile;
