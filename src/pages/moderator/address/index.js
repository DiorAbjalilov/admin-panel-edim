import { useMemo, useState } from 'react'
import {
    message,
    Table as AntTable,
    Button,
    Popconfirm,
    Input,
    Form as AntForm
} from 'antd'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
import { DeleteFilled, LoadingOutlined, EditFilled } from '@ant-design/icons'
import styled from 'styled-components'

import Top from '../../../components/Top'
import { FIND_MANY_ADDRESS, DELETE_ONE_ADDRESS, FIND_MANY_ADDRESS_COUNT } from '../../../gqls/address'
import { useUser } from '../../../utils/hooks'
import { COLORS } from '../../../utils/const'

const limit = 20

const Table = styled(AntTable)`
    .delete-button {
        position: relative;
        color: ${COLORS.secondary.red};
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .edit-button {
        position: relative;
        color: #1890ff;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s;
        margin-left: 5px;
    }
`

const Form = styled(AntForm)`
    max-width: 400px;
    display: flex;

    .search-intput {
        max-width: 300px;
        margin-right: 10px;
    }
`

export let variables

const Address = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [search, setSearch] = useState("")
    const { user } = useUser('moderator')

    variables = useMemo(() => ({
        where: {
            restaurantId: { equals: user ? user.restaurantId : "" },
            delete: { equals: false },
            OR: [
                { value: { contains: search, mode: "insensitive" } },
                { phones: { has: search } },
            ]
        },
        take: limit,
        skip: limit * (currentPage - 1)
    }), [user, search, currentPage])

    const { data, loading } = useQuery(FIND_MANY_ADDRESS, {
        variables
    })

    const { data: countData } = useQuery(FIND_MANY_ADDRESS_COUNT, {
        variables
    })

    const addresses = useMemo(() => data ? data.findManyAddress : [], [data])
    const addressCount = useMemo(() => countData ? countData.findManyAddressCount : [], [countData])

    const [deleteAddress, { loading: deleteLoading }] = useMutation(DELETE_ONE_ADDRESS, {
        onCompleted: () => {
            message.success("Адрес удалён")
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
            console.error(e)
        },
        update: (client, { data: { deleteOneAddress } }) => {
            const prevData = client.readQuery({
                query: FIND_MANY_ADDRESS,
                variables,
            })
            if (prevData) {
                const { findManyAddress } = prevData
                client.writeQuery({
                    query: FIND_MANY_ADDRESS,
                    variables,
                    data: {
                        findManyAddress: findManyAddress.filter(item => item.id !== deleteOneAddress.id)
                    }
                })
            }
        }
    })

    const handleChangeTable = ({ current }) => {
        setCurrentPage(current)
    }

    return (
        <>
            <Top
                title="Адреса ресторана"
                action={
                    <Link to='/moderator/address/add'>
                        <Button
                            type='primary'
                        >
                            + Добавить
                        </Button>
                    </Link>
                }
            />
            <Form
                name="address-filter"
                layout="horizontal"
                onFinish={({ search }) => setSearch(search ? search : "")}
            >
                <Form.Item
                    name={"search"}
                    style={{ marginRight: 15 }}
                >
                    <Input
                        name={"search"}
                        placeholder="Найти"
                        allowClear
                        onChange={e => !e.target.value ? setSearch("") : null}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type='primary'
                        htmlType="submit"
                    >
                        Найти
                    </Button>
                </Form.Item>
            </Form>
            <Table
                loading={loading}
                rowKey={(obj) => obj.id}
                dataSource={addresses}
                scroll={{ x: 600 }}
                size={window.innerWidth < 500 ? 'small' : 'large'}
                pagination={{
                    current: currentPage,
                    total: addressCount,
                    pageSize: limit
                }}
                onChange={handleChangeTable}
                columns={[
                    {
                        title: 'Адрес',
                        dataIndex: 'value',
                        key: 'value',
                        render: (value, obj) => (
                            <Link to={`/moderator/address/edit/${obj.id}`}>{value}</Link>
                        )
                    },
                    {
                        title: 'Телефон',
                        dataIndex: 'phones',
                        key: 'phones',
                        render: (value, obj) => (
                            <span>{value.join(", ")}</span>
                        )
                    },
                    {
                        title: "Время работы",
                        render: (_, obj) => (
                            obj.allTime ? "Круглосуточно" : <span>{moment(obj.startWorkAt).format("HH:mm")} - {moment(obj.endWorkAt).format("HH:mm")}</span>
                        )
                    },
                    {
                        title: "Действия",
                        dataIndex: 'delete',
                        key: 'delete',
                        align: "right",
                        render: (_, obj) => (
                            <>
                                <Popconfirm
                                    title={"Удалить адрес"}
                                    onConfirm={() => { deleteAddress({ variables: { where: { id: obj.id } } }) }}
                                    okText="Да"
                                    cancelText="Нет"
                                    disabled={deleteLoading}
                                >
                                    {
                                        deleteLoading ? <LoadingOutlined /> : <DeleteFilled className="delete-button" />
                                    }
                                </Popconfirm>
                                <Link to={`/moderator/address/edit/${obj.id}`}>
                                    <EditFilled className="edit-button" />
                                </Link>
                            </>
                        )
                    }
                ]}
            />
        </>
    )
}

export default Address