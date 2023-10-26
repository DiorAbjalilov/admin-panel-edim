import { gql } from '@apollo/client'

export const FIND_MANY_RESTAURANT = gql`
	query(
		$where: RestaurantWhereInput
		$orderBy: [RestaurantOrderByWithRelationInput]
		$cursor: RestaurantWhereUniqueInput
		$take: Int
		$skip: Int
		$distinct: [RestaurantScalarFieldEnum]
	){
		findManyRestaurant(
			where: $where
			orderBy: $orderBy
			cursor: $cursor
			take: $take
			skip: $skip
			distinct: $distinct
		){
            id
            name
            logo
            image
            description
            minimumOrderAmount
            deliveryCondition
            legalInformation
            publish
            categories
            payoff
            paymentId
            productsCategoriers
            city
		}
	}
`

export const FIND_UNIQUE_RESTAURANT = gql`
    query(
        $where: RestaurantWhereUniqueInput!
    ){
        findUniqueRestaurant(where: $where){
            id
            name
            logo
            image
            description
            minimumOrderAmount
            deliveryCondition
            legalInformation
            publish
            categories
            payoff
            paymentId
            productsCategoriers
            availablePaymentMethods
            city
        }
    }
`

export const CREATE_ONE_RESTAURANT = gql`
    mutation ($data: RestaurantCreateInput!){
        createOneRestaurant(data: $data){
            id
            name
            logo
            image
            description
            minimumOrderAmount
            deliveryCondition
            legalInformation
            publish
            categories
            payoff
            paymentId
            productsCategoriers
            city
        }
    }
`

export const UPDATE_ONE_RESTAURANT = gql`
    mutation($where: RestaurantWhereUniqueInput! $data: RestaurantUpdateInput!) {
        updateOneRestaurant(where: $where data: $data){
            id
            name
            logo
            image
            description
            minimumOrderAmount
            deliveryCondition
            legalInformation
            publish
            categories
            payoff
            paymentId
            productsCategoriers
            availablePaymentMethods
            city
        }
    }
`