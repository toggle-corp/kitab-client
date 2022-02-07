import React, { useCallback, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Pager,
    Container,
    ListView,
} from '@the-deep/deep-ui';

import {
    PublisherBookOrdersQuery,
    PublisherBookOrdersQueryVariables,
} from '#generated/types';

import OrderItem from '#components/OrderItem';
import styles from './styles.css';

const PUBLISHER_BOOK_ORDERS = gql`
    query PublisherBookOrders(
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
                totalQuantity
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

type PublisherOrder = NonNullable<NonNullable<PublisherBookOrdersQuery['orders']>['results']>[number];
const orderKeySelector = (d: PublisherOrder) => d.id;

function Orders() {
    const [pageSize, setPageSize] = useState<number>(25);
    const [page, setPage] = useState<number>(1);

    const {
        data: publisherBookOrdersResult,
        loading,
    } = useQuery<PublisherBookOrdersQuery, PublisherBookOrdersQueryVariables>(
        PUBLISHER_BOOK_ORDERS,
        {
            variables: {
                page,
                pageSize,
            },
        },
    );

    const orders = publisherBookOrdersResult?.orders?.results ?? undefined;
    const orderItemRendererParams = useCallback((_, data) => ({
        className: styles.order,
        order: data,
    }), []);

    return (
        <Container
            className={styles.publisherOrders}
            heading="Orders"
            contentClassName={styles.content}
            footerIcons={(
                <Pager
                    activePage={page}
                    maxItemsPerPage={pageSize}
                    itemsCount={publisherBookOrdersResult?.orders?.totalCount ?? 0}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                />
            )}
        >
            <ListView
                className={styles.orders}
                data={orders}
                keySelector={orderKeySelector}
                renderer={OrderItem}
                rendererParams={orderItemRendererParams}
                errored={false}
                filtered={false}
                pending={loading}
            />
        </Container>
    );
}

export default Orders;
