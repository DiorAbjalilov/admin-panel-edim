import { gql } from "@apollo/client";

export const FIND_MANY_ORDER = gql`
  query (
    $where: OrderWhereInput
    $orderBy: [OrderOrderByWithRelationInput]
    $cursor: OrderWhereUniqueInput
    $take: Int
    $skip: Int
    $distinct: [OrderScalarFieldEnum]
  ) {
    findManyOrder(
      where: $where
      orderBy: $orderBy
      take: $take
      skip: $skip
      distinct: $distinct
      cursor: $cursor
    ) {
      id
      uuid
      createdAt
      updatedAt
      shipments
      amount
      paymentStatus
      orderStatus
      deliveryMethod
      paymentMethod
      name
      address
      phone
      comment
      restaurant {
        id
        createdAt
        updatedAt
        name
        logo
        image
        description
        categories
        minimumOrderAmount
        deliveryCondition
        legalInformation
        payoff
        publish
        delete
      }
      restaurantId
      promocode {
        id
        code
        discount
      }
    }
  }
`;

export const FIND_MANY_ORDER_COUNT = gql`
  query (
    $where: OrderWhereInput
    $orderBy: [OrderOrderByWithRelationInput]
    $cursor: OrderWhereUniqueInput
    $take: Int
    $skip: Int
    $distinct: [OrderScalarFieldEnum]
  ) {
    findManyOrderCount(
      where: $where
      orderBy: $orderBy
      take: $take
      skip: $skip
      distinct: $distinct
      cursor: $cursor
    )
  }
`;

export const UPDATE_ONE_ORDER = gql`
  mutation ($data: OrderUpdateInput!, $where: OrderWhereUniqueInput!) {
    updateOneOrder(data: $data, where: $where) {
      id
      uuid
      createdAt
      updatedAt
      shipments
      amount
      paymentStatus
      orderStatus
      deliveryMethod
      paymentMethod
      name
      address
      phone
      comment
      restaurant {
        id
        createdAt
        updatedAt
        name
        logo
        image
        description
        categories
        minimumOrderAmount
        deliveryCondition
        legalInformation
        payoff
        publish
        delete
      }
      restaurantId
    }
  }
`;
