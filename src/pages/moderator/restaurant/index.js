import { useMemo } from "react";
import styled from "styled-components";
import { Button as AntButton, Spin, Empty, Image } from "antd";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import Top from "../../../components/Top";
import LabelComponent from "../../../components/Label";
import { FIND_UNIQUE_RESTAURANT } from "../../../gqls/restaurant";
import { useUser } from "../../../utils/hooks";
import { COLORS, RESTAURANT_PAYMENT_METHODS } from "../../../utils/const";
import { URI_Assets } from "../../../utils/apollo";

const Label = styled(LabelComponent)`
  margin-bottom: 15px;
`;

const LoadingView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyContainer = styled(Empty)`
  display: flex;
  flex-direction: column;
  min-height: 500px;
  align-items: center;
  justify-content: center;
`;

const Button = styled(AntButton)``;

const Restaurant = () => {
  const { type } = useParams();
  const { user } = useUser(type);

  const variables = useMemo(
    () => ({
      where: {
        id: user && user.restaurantId ? user.restaurantId : "",
      },
    }),
    [user],
  );

  const { data, loading } = useQuery(FIND_UNIQUE_RESTAURANT, {
    variables,
    fetchPolicy: "network-only",
  });

  const restaurant =
    data && data.findUniqueRestaurant ? data.findUniqueRestaurant : null;
  if (loading) {
    return (
      <LoadingView>
        <Spin />
      </LoadingView>
    );
  }

  return (
    <>
      <Top title="Ваше ресторан" />
      {restaurant ? (
        <>
          <Label
            label="Логотип"
            value={<Image src={`${URI_Assets}/${restaurant.logo}`} />}
            column
          />
          <Label
            label="Изображение"
            value={<Image src={`${URI_Assets}/${restaurant.image}`} />}
            column
          />
          <Label label="Название ресторана" value={restaurant.name} />
          <Label label="Описание" value={restaurant.description} />
          <Label
            label="Условия доставки"
            value={restaurant.deliveryCondition}
          />
          <Label
            label="Минимальная стоимость заказа"
            value={restaurant.minimumOrderAmount + " рб."}
          />
          <Label
            label="Юридическая информация"
            value={restaurant.legalInformation}
          />
          <Label label="Идентификатор магазина" value={restaurant.paymentId} />
          <Label
            label="Населенный пункт или город"
            value={restaurant.city ? restaurant.city : "-"}
          />
          <Label
            label="Статус"
            value={restaurant.publish ? "Опубликован" : "Не опубликован"}
            valueStyle={{
              color: restaurant.publish
                ? COLORS.primary.green
                : COLORS.secondary.red,
              fontWeight: "bold",
            }}
          />
          <Label label="Категории" value={restaurant.categories.join(", ")} />
          <Label
            label="Доступные способы оплаты"
            value={restaurant.availablePaymentMethods
              .map((item) => {
                return RESTAURANT_PAYMENT_METHODS[item];
              })
              .join(", ")}
          />
          <Link to={"/moderator/restaurant/edit"}>
            <Button type="primary">Изменить</Button>
          </Link>
        </>
      ) : (
        <EmptyContainer
          description={"У вас еще нет зарегитрированного ресторана."}
        >
          <Link to={"/moderator/restaurant/add"}>
            <Button type="primary">Создать</Button>
          </Link>
        </EmptyContainer>
      )}
    </>
  );
};

export default Restaurant;
