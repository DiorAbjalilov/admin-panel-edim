import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  message,
  Table,
  Popover,
  Tag,
  Select,
  Form as AntForm,
  Input,
} from "antd";
import { useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import useSound from "use-sound";

import Top from "../../../components/Top";
import Label from "../../../components/Label";

import {
  FIND_MANY_ORDER,
  FIND_MANY_ORDER_COUNT,
  UPDATE_ONE_ORDER,
} from "../../../gqls/order";

import { useUser } from "../../../utils/hooks";
import { COLORS } from "../../../utils/const";
import moment from "moment";
import { URI_Assets } from "../../../utils/apollo";

const limit = 20;

const Form = styled(AntForm)`
  display: flex;
  margin-bottom: 15px;

  .item {
    margin-right: 15px;
    width: 200px;
  }
`;

const Info = styled.div`
  .text {
    margin-top: 5px;
  }
  .text-type {
    margin-top: 5px;
    /* display: flex; */
    /* flex-direction: row; */
  }

  .products-countainer {
    display: flex;
    flex-direction: row;
  }

  .products-countainer-type {
    display: flex;
    flex-direction: row;
  }
  .product-type {
    display: flex;
    /* margin-top: 10px; */
    /* margin-right: 15px; */
    /* width: 100px; */
    /* border: 1px solid black; */
  }

  .product {
    margin-top: 10px;
    margin-right: 15px;
    width: 100px;

    .image {
      width: 100px;
      height: 100px;
      object-fit: contain;
      background-color: ${COLORS.primary.white};
    }
  }
`;

const PopupMenu = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  .item {
    margin-bottom: 5px;
  }

  .cancel {
    background-color: ${COLORS.secondary.red};
    border: none;
    color: ${COLORS.primary.white};
  }

  .done {
    background-color: ${COLORS.primary.green};
    border: none;
    color: ${COLORS.primary.white};
  }
`;

let interval;

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState(undefined);
  const [search, setSearch] = useState("");
  const { user } = useUser("moderator");
  const [play] = useSound("/sounds/new-order.wav");

  const [update, { loading: updateLoading }] = useMutation(UPDATE_ONE_ORDER, {
    onCompleted: () => {
      message.success("Статус обновлён");
    },
    onError: (e) => {
      message.error("Произошла ошибка, повторите попытку");
    },
  });

  const variables = useMemo(
    () => ({
      where: {
        restaurantId: { equals: user ? user.restaurantId : "" },
        orderStatus: status !== "all" ? { equals: status } : undefined,
        AND: [
          {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { phone: { contains: search, mode: "insensitive" } } },
            ],
          },
          {
            OR: [
              {
                paymentMethod: { equals: "offline" },
              },
              {
                paymentMethod: { equals: "online" },
                paymentStatus: {
                  equals: "CONFIRMED",
                },
              },
              {
                paymentMethod: { equals: "card" },
              },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: limit * (currentPage - 1),
    }),
    [user, search, currentPage, status],
  );

  const countVariables = useMemo(
    () => ({
      ...variables,
      take: undefined,
      skip: undefined,
    }),
    [variables],
  );

  const { data, loading } = useQuery(FIND_MANY_ORDER, {
    variables,
    pollInterval: 1000 * 15,
    fetchPolicy: "network-only",
    onCompleted: ({ findManyOrder }) => {
      const hasNew = findManyOrder.find((order) => order.orderStatus === "new");
      if (hasNew) {
        if (!interval) {
          play();
          interval = setInterval(play, 5 * 1000);
        }
      } else {
        if (interval) {
          clearInterval(interval);
          interval = undefined;
        }
      }
    },
    onError: (e) => {
      message.error(
        "Не удалось получить информацию о заказах, повторите попытку позже",
      );
    },
  });
  const { data: countData } = useQuery(FIND_MANY_ORDER_COUNT, {
    variables: countVariables,
    pollInterval: 1000 * 15,
  });

  const orders = useMemo(
    () => (data && data.findManyOrder ? data.findManyOrder : []),
    [data],
  );
  const ordersCount = useMemo(
    () =>
      countData && countData.findManyOrderCount
        ? countData.findManyOrderCount
        : 0,
    [countData],
  );

  useEffect(() => {
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  const handleChangeTable = ({ current }) => {
    setCurrentPage(current);
  };

  const renderOrderStatus = useCallback(
    (orderStatus, obj) => {
      const { id } = obj;
      let status = "Новый";
      let color = "#108ee9";
      if (orderStatus === "confirmed") {
        status = "Подтверждён";
        color = COLORS.primary.green;
      }
      if (orderStatus === "done") {
        status = "Доставлен";
        color = COLORS.primary.green;
      }
      if (orderStatus === "canceled") {
        status = "Отменён";
        color = COLORS.secondary.red;
      }
      if (orderStatus === "done" || orderStatus === "canceled") {
        return <Tag color={color}>{status}</Tag>;
      }
      return (
        <Popover
          content={
            <PopupMenu>
              {orderStatus === "new" && (
                <Button
                  type="primary"
                  className="item"
                  onClick={() => {
                    update({
                      variables: {
                        where: { id },
                        data: {
                          orderStatus: { set: "confirmed" },
                        },
                      },
                    });
                  }}
                  loading={updateLoading}
                >
                  Подтвердить
                </Button>
              )}
              {orderStatus === "confirmed" && (
                <Button
                  className="item done"
                  onClick={() => {
                    update({
                      variables: {
                        where: { id },
                        data: {
                          orderStatus: { set: "done" },
                        },
                      },
                    });
                  }}
                  loading={updateLoading}
                >
                  Доставлено
                </Button>
              )}
              {orderStatus !== "done" && orderStatus !== "canceled" && (
                <Button
                  className="item cancel"
                  onClick={() => {
                    update({
                      variables: {
                        where: { id },
                        data: {
                          orderStatus: { set: "canceled" },
                        },
                      },
                    });
                  }}
                  loading={updateLoading}
                >
                  Отменить
                </Button>
              )}
            </PopupMenu>
          }
          title="Изменить статус"
        >
          <Tag color={color}>{status}</Tag>
        </Popover>
      );
    },
    [updateLoading, update],
  );

  const renderPaymentStatus = (paymentStatus, paymentMethod) => {
    let status = "Оплата наличными курьеру";
    let color = COLORS.primary.green;
    if (paymentMethod === "online") {
      status = "В обработке";
      color = COLORS.primary.gray;
      if (paymentStatus === "CONFIRMED") {
        status = "Оплачено онлайн";
        color = COLORS.primary.green;
      }
      if (
        paymentStatus === "CANCELED" ||
        paymentStatus === "DEADLINE_EXPIRED" ||
        paymentStatus === "REJECTED"
      ) {
        status = "Ошибка оплаты";
        color = COLORS.secondary.red;
      }
      if (paymentStatus === "NEW") {
        status = "Ожидает списание";
        color = COLORS.primary.gray;
      }
    } else if (paymentMethod === "card") {
      status = "Оплата картой курьеру";
      color = COLORS.primary.blue;
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const renderExpandable = useCallback(
    ({
      deliveryMethod,
      address,
      comment,
      shipments,
      amount,
      paymentStatus,
      paymentMethod,
      promocode,
    }) => {
      return (
        <Info>
          <Label
            label="Способ доставки"
            value={deliveryMethod === "delivery" ? "Доставка" : "Самовывоз"}
          />
          <Label label="Адрес" value={address} />
          <Label label="Комментарий" value={comment} />
          <Label
            column
            label="Товары:"
            value={
              <div className="products-countainer">
                {shipments.map((item) => {
                  console.log(item);
                  return (
                    <div key={item.id} className="product">
                      <img
                        src={`${URI_Assets}/` + item.product.image}
                        alt={item.product.name}
                        className="image"
                      />
                      <div className="text">
                        {item.product.name} {item.count} шт.
                      </div>
                      <div>
                        <Label
                          label="Tип"
                          value={
                            <div className="products-countainer-type">
                              {item.types.map((element) => (
                                <div className="product-type">
                                  <div className="text-type">
                                    name: {element.name}
                                  </div>
                                  {element.list.map((listItem) => {
                                    return (
                                      <div className="text-type">
                                        price: {listItem.price} title:{" "}
                                        {listItem.title}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          />
          <Label label="Итог" value={amount + " sum"} />

          <Label
            label="Статус оплаты"
            value={renderPaymentStatus(paymentStatus, paymentMethod)}
          />
        </Info>
      );
    },
    [],
  );

  const onFormSubmit = ({ status, search }) => {
    setSearch(search);
    setStatus(status);
  };

  return (
    <>
      <Top title={`Заказы Ресторана (${ordersCount})`} />
      <Form name="order-filter" layout="horizontal" onFinish={onFormSubmit}>
        <Form.Item name={"search"} className="item">
          <Input
            placeholder="Поиск"
            allowClear
            onChange={(e) => (!e.target.value ? setSearch("") : null)}
          />
        </Form.Item>
        <Form.Item name={"status"} className="item">
          <Select
            placeholder="Статусы"
            allowClear
            onChange={(data) => (!data ? setStatus("all") : null)}
          >
            <Select.Option value={"new"}>Новый</Select.Option>
            <Select.Option value={"confirmed"}>Подтверждён</Select.Option>
            <Select.Option value={"done"}>Доставлен</Select.Option>
            <Select.Option value={"canceled"}>Отменён</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Показать
          </Button>
        </Form.Item>
      </Form>
      <Table
        loading={loading}
        rowKey={(obj) => obj.id}
        dataSource={orders}
        scroll={{ x: 600 }}
        size={window.innerWidth < 500 ? "small" : "large"}
        pagination={{
          current: currentPage,
          total: ordersCount,
          pageSize: limit,
        }}
        onChange={handleChangeTable}
        columns={[
          // {
          //     title: '№',
          //     dataIndex: 'id',
          //     key: 'id',
          //     render: (id, obj) => (
          //         <Link to={`/admin/orders/${obj.id}`}>{id}</Link>
          //     )
          // },
          {
            title: "Имя заказчика",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "Телефон заказчика",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => <a href={`tel:${phone}`}>{phone}</a>,
          },
          {
            title: "Создано",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt, obj) => (
              <span>{moment(createdAt).format("DD.MM.yyyy HH:mm")}</span>
            ),
          },
          {
            title: "Сумма",
            dataIndex: "amount",
            key: "amount",
            render: (amount, obj) => <span>{amount} sum</span>,
          },
          {
            title: "Промокод",
            dataIndex: "promocode",
            key: "promocode",
            render: (promocode, obj) => (
              <span>{promocode ? promocode.code : "-"}</span>
            ),
          },
          {
            title: "Статус",
            dataIndex: "orderStatus",
            key: "orderStatus",
            render: renderOrderStatus,
          },
        ]}
        expandable={{
          expandedRowRender: renderExpandable,
        }}
      />
    </>
  );
};

export default Orders;
