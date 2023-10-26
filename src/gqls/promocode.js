import { gql } from '@apollo/client'

export const FIND_MANY_PROMOCODE = gql`
    query(
        $where: PromocodeWhereInput
        $orderBy: [PromocodeOrderByWithRelationInput]
        $cursor: PromocodeWhereUniqueInput
        $take: Int
        $skip: Int
        $distinct: [PromocodeScalarFieldEnum]
    ) {
        findManyPromocode (
            where: $where
            orderBy: $orderBy
            cursor: $cursor
            take: $take
            skip: $skip
            distinct: $distinct
        ) {
            id
            code
            discount
            publish
            restaurant {
                id
                name
            }
        }
    }
`

export const FIND_MANY_PROMOCODE_COUNT = gql`
    query(
        $where: PromocodeWhereInput
        $orderBy: [PromocodeOrderByWithRelationInput]
        $cursor: PromocodeWhereUniqueInput
        $take: Int
        $skip: Int
        $distinct: [PromocodeScalarFieldEnum]
    ) {
        findManyPromocodeCount (
            where: $where
            orderBy: $orderBy
            cursor: $cursor
            take: $take
            skip: $skip
            distinct: $distinct
        )
    }
`

export const DELETE_ONE_PROMOCODE = gql`
    mutation(
        $where: PromocodeWhereUniqueInput!
    ){
        deleteOnePromocode(where: $where){
            id
            code
            discount
            publish
            restaurant {
                id
                name
            }
        }
    }
`

export const FIND_UNIQUE_PROMOCODE = gql`
    query(
        $where: PromocodeWhereUniqueInput!
    ){
        findUniquePromocode(
            where: $where
        ){
            id
            code
            discount
            publish
            restaurant {
                id
                name
            }
        }
    }
`

export const CREATE_ONE_PROMOCODE = gql`
    mutation ($data: PromocodeCreateInput!) {
        createOnePromocode (data: $data) {
            id
            publish
            code
            discount
            restaurant {
                id
                name
            }
        }
    }
`

export const UPDATE_ONE_PROMOCODE = gql`
    mutation(
        $data: PromocodeUpdateInput!
        $where: PromocodeWhereUniqueInput!
    ){
        updateOnePromocode(
            data: $data
            where: $where
        ){
            id
            code
            discount
            publish
            restaurant {
                id
                name
            }
        }
    }
`