import React, { useCallback, useState } from 'react';
import { Button, Container, ElementFragments, NumberInput, TextOutput } from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import { AiTwotoneDelete } from 'react-icons/ai';
import { FaRegHeart, FaShoppingCart } from 'react-icons/fa';

import {
    RemoveWishListMutation,
    RemoveWishListMutationVariables,
    WishListQuery,
    WishListQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const WISH_LIST = gql`
    query WishList ($pageSize: Int!, $page: Int!){
        wishList(pageSize: $pageSize, page: $page) {
            results {
                id
                book {
                    id
                    isbn
                    authors {
                        id
                        name
                    }
                    price
                    title
                    language
                    image {
                        url
                    }
                }
            }
        pageSize
        page
        }
    }
`;

const REMOVE_WISH_LIST = gql`
mutation RemoveWishList ($id: ID!) {
    deleteWishlist(id: $id) {
      errors
      ok
    }
  }
`;

interface Author {
    id: number;
    name: string;
}

interface Image {
    url: string;
}

interface Book {
    id: number;
    price: number;
    authors: Author[];
    image: Image;
    title: string;
    removeBookFromWishList: (id: string) => void;
    wishListId: string;
}

function WishListBook(props: Book) {
    const { id, price, authors, image, title, removeBookFromWishList, wishListId } = props;
    const authorsDisplay = React.useMemo(() => (
        authors?.map((d) => d.name).join(', ')
    ), [authors]);

    const removeBook = useCallback(() => {
        removeBookFromWishList(wishListId);
    }, [wishListId]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.metaData}>
                    {image?.url ? (
                        <img
                            className={styles.image}
                            src={image.url}
                            alt={title}
                        />
                    ) : (
                        <div className={styles.noPreview}>
                            Preview not available
                        </div>
                    )}
                    <Container
                        className={styles.details}
                        heading={title}
                    >
                        <div className={styles.headerDescription}>
                            <TextOutput
                                label="Author"
                                value={authorsDisplay}
                            />
                            <TextOutput
                                label="Price (NPR)"
                                valueType="number"
                                value={price}
                            />
                            <div className={styles.quantity}>
                                <TextOutput
                                    label="Quantity"
                                    valueType="number"
                                />
                                <NumberInput
                                    name="quantity"
                                    value={undefined}
                                    onChange={undefined}
                                />
                            </div>
                        </div>
                    </Container>
                    <div className={styles.wishListButton}>
                        <Button
                            name={undefined}
                            onClick={undefined}
                            variant="secondary"
                            icons={<FaShoppingCart />}
                            autoFocus
                        >
                            Add to cart
                        </Button>
                        <Button
                            name={undefined}
                            onClick={removeBook}
                            variant="secondary"
                            icons={<AiTwotoneDelete />}
                            autoFocus
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

function WishList() {
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [deleteWishlist] = useMutation<
        RemoveWishListMutation,
        RemoveWishListMutationVariables
    >(REMOVE_WISH_LIST);

    const { data, refetch, loading } = useQuery<
        WishListQuery,
        WishListQueryVariables
    >(WISH_LIST, {
        variables: { page, pageSize },
        onCompleted: (res: WishListQuery) => {
            setPage(res.wishList?.page ? res.wishList.page : page);
            setPageSize(res.wishList?.pageSize ? res.wishList.pageSize : pageSize);
        },
    });

    const deleteBook = (id: string) => {
        deleteWishlist({ variables: { id } });
        refetch();
    };

    return (
        <div className={styles.wishList}>
            {!loading && data?.wishList?.results
                && (
                    <>
                        {
                            data.wishList.results.map((b: any) => (
                                <WishListBook
                                    id={b.book.id}
                                    title={b.book.title}
                                    image={b.book.image}
                                    price={b.book.price}
                                    authors={b.book.authors}
                                    removeBookFromWishList={deleteBook}
                                    wishListId={b.id}
                                />
                            ))
                        }
                    </>
                )}
        </div>
    );
}

export default WishList;