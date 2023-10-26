import { useState, useCallback, useMemo } from 'react'
import {
    message,
    Table,
    Tag,
    Select,
    Form as AntForm,
    Input,
    Button,
} from 'antd'
import { useQuery } from '@apollo/client'
import { Link, useParams } from 'react-router-dom'
import moment from 'moment'
import styled from 'styled-components'

import Top from '../../components/Top'
import Label from '../../components/Label'
import ModeratorOrder from '../moderator/orders'

import { FIND_MANY_ORDER, FIND_MANY_ORDER_COUNT } from '../../gqls/order'
import { FIND_MANY_RESTAURANT } from '../../gqls/restaurant'

import { COLORS } from '../../utils/const'

const limit = 20

const Form = styled(AntForm)`
    display: flex;
    margin-bottom: 15px;

    .item {
        margin-right: 15px;
        width: 200px;
    }
`

const Info = styled.div`

    .text {
        margin-top: 5px;
    }

    .products-countainer {
        display: flex;
        flex-direction: row;
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
`

const Orders = () => {
    const { type } = useParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [status, setStatus] = useState(undefined)
    const [search, setSearch] = useState('')
    const [restaurant, setRestaurant] = useState('')

    const variables = useMemo(() => ({
        where: {
            orderStatus: status !== 'all' ? { equals: status } : undefined,
            OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { restaurant: { name: { contains: search, mode: "insensitive" } } },
                { user: { phone: { contains: search, mode: "insensitive" } } },
            ],
            restaurantId: restaurant ? { equals: restaurant } : undefined
        },
        take: limit,
        skip: limit * (currentPage - 1),
        orderBy: {
            createdAt: 'desc'
        }
    }), [status, search, restaurant, currentPage])

    const countVariables = useMemo(() => ({
        ...variables,
        take: undefined,
        skip: undefined
    }), [variables])

    const { data, loading } = useQuery(FIND_MANY_ORDER, {
        variables,
        onError: e => {
            message.error("Не удалось получить информацию о заказзах, повторите попытку позже")
        },
        pollInterval: 1000 * 15
    })

    const { data: countData } = useQuery(FIND_MANY_ORDER_COUNT, {
        variables: countVariables,
        pollInterval: 1000 * 15
    })

    const { data: restaurantData } = useQuery(FIND_MANY_RESTAURANT)

    const orders = useMemo(() => data && data.findManyOrder ? data.findManyOrder : [], [data])
    const ordersCount = useMemo(() => countData && countData.findManyOrderCount ? countData.findManyOrderCount : 0, [countData])
    const restaurants = useMemo(() => restaurantData && restaurantData.findManyRestaurant ? restaurantData.findManyRestaurant : [], [restaurantData])

    const handleChangeTable = ({ current }) => {
        setCurrentPage(current)
    }

    const renderOrderStatus = useCallback((orderStatus) => {
        let status = 'Новый'
        let color = '#108ee9'
        if (orderStatus === 'confirmed') {
            status = 'Подтверждён'
            color = COLORS.primary.green
        }
        if (orderStatus === 'done') {
            status = 'Доставлен'
            color = COLORS.primary.green
        }
        if (orderStatus === 'canceled') {
            status = 'Отменён'
            color = COLORS.secondary.red
        }
        return (
            <Tag color={color}>{status}</Tag>
        )
    }, [])

    const renderExpandable = useCallback(({ deliveryMethod, address, comment, shipments, amount, paymentStatus, paymentMethod }) => {
        return (
            <Info>
                <Label
                    label="Способ доставки"
                    value={deliveryMethod === 'delivery' ? 'Доставка' : "Самовывоз"}
                />
                <Label
                    label="Адрес"
                    value={address}
                />
                <Label
                    label="Комментарий"
                    value={comment}
                />
                <Label
                    column
                    label="Товары:"
                    value={
                        <div className="products-countainer">
                            {
                                shipments.map(item => (
                                    <div className="product">
                                        <img src={'/uploads/' + item.product.image} alt={item.product.name} className="image" />
                                        <div className="text">{item.product.name} {item.count} шт.</div>
                                    </div>
                                ))
                            }
                        </div>
                    }
                />
                <Label
                    label="Итог"
                    value={amount + " ₽"}
                />
                <Label
                    label='Статус оплаты'
                    value={renderPaymentStatus(paymentStatus, paymentMethod)}
                />
            </Info>
        )
    }, [])

    const renderPaymentStatus = (paymentStatus, paymentMethod) => {
        let status = 'Оплата при получении'
        let color = COLORS.primary.green
        if (paymentMethod === 'online') {
            status = 'В обработке'
            color = COLORS.primary.gray
            if (paymentStatus === 'CONFIRMED') {
                status = 'Оплачено онлайн'
                color = COLORS.primary.green
            }
            if (paymentStatus === 'CANCELED' || paymentStatus === 'DEADLINE_EXPIRED' || paymentStatus === 'REJECTED') {
                status = 'Ошибка оплаты'
                color = COLORS.secondary.red
            }
            if (paymentStatus === 'NEW') {
                status = 'Ожидает списание'
                color = COLORS.primary.gray
            }
        }
        return <Tag color={color}>{status}</Tag>
    }

    const onFormSubmit = ({ status, search, restaurant }) => {
        setSearch(search)
        setStatus(status)
        setRestaurant(restaurant)
    }

    return (
        <>
            <Top title={`Заказы(${ordersCount})`} />
            <Form
                name="order-filter"
                layout="horizontal"
                onFinish={onFormSubmit}
            >

                <Form.Item
                    name={"search"}
                    className='item'
                >
                    <Input
                        placeholder="Поиск"
                        allowClear
                        onChange={e => !e.target.value ? setSearch("") : null}
                    />
                </Form.Item>
                <Form.Item
                    name={"status"}
                    className='item'
                >
                    <Select
                        placeholder="Статусы"
                        allowClear
                        onChange={data => !data ? setStatus('all') : null}
                    >
                        <Select.Option value={"new"}>
                            Новый
                        </Select.Option>
                        <Select.Option value={'confirmed'}>
                            Подтверждён
                        </Select.Option>
                        <Select.Option value={'done'}>
                            Доставлен
                        </Select.Option>
                        <Select.Option value={'canceled'}>
                            Отменён
                        </Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name={"restaurant"}
                    className='item'
                >
                    <Select
                        placeholder="Рестораны"
                        allowClear
                        onChange={data => !data ? setRestaurant('') : null}
                    >
                        {
                            restaurants.map(item => (
                                <Select.Option value={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button
                        type='primary'
                        htmlType="submit"
                    >
                        Показать
                    </Button>
                </Form.Item>
            </Form>
            <Table
                loading={loading}
                rowKey={(obj) => obj.id}
                dataSource={orders}
                scroll={{ x: 600 }}
                size={window.innerWidth < 500 ? 'small' : 'large'}
                pagination={{
                    current: currentPage,
                    total: ordersCount,
                    pageSize: limit
                }}
                onChange={handleChangeTable}
                columns={[
                    {
                        title: 'Ресторан',
                        dataIndex: 'restaurant',
                        key: 'restaurant',
                        render: (restaurant, obj) => (
                            <Link to={`/${type}/restaurant/${restaurant.id}`}>{restaurant.name}</Link>
                        )
                    },
                    {
                        title: 'Имя заказчика',
                        dataIndex: 'name',
                        key: 'name'
                    },
                    {
                        title: 'Телефон заказчика',
                        dataIndex: 'phone',
                        key: 'phone'
                    },
                    {
                        title: 'Создано',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (createdAt, obj) => (
                            <span>{moment(createdAt).format("DD.MM.yyyy HH:mm")}</span>
                        )
                    },
                    {
                        title: 'Сумма',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: (amount, obj) => (
                            <span>{amount} ₽</span>
                        )
                    },
                    {
                        title: 'Промокод',
                        dataIndex: 'promocode',
                        key: 'promocode',
                        render: (promocode, obj) => (
                            <span>{promocode ? promocode.code : '-'}</span>
                        )
                    },
                    {
                        title: 'Статус',
                        dataIndex: 'orderStatus',
                        key: 'orderStatus',
                        render: renderOrderStatus
                    }
                ]}
                expandable={{
                    expandedRowRender: renderExpandable
                }}
            />
        </>
    )
}

const OrdersContainer = (props) => {
    const { type } = useParams()
    if (type === 'admin') {
        return <Orders {...props} />
    }
    return <ModeratorOrder {...props} />
}

export default OrdersContainer