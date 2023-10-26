import { useState, useMemo } from 'react'
import Top from '../../components/Top'
import {
    Button,
    Form as AntForm,
    Input,
    Table as AntTable,
    Popconfirm,
    message,
} from 'antd'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import styled from 'styled-components'
import { DeleteFilled, LoadingOutlined, EditFilled, CheckCircleFilled } from '@ant-design/icons'
import { COLORS } from '../../utils/const'
import { useUser } from '../../utils/hooks'
import {
    FIND_MANY_PROMOCODE,
    FIND_MANY_PROMOCODE_COUNT,
    DELETE_ONE_PROMOCODE,
} from '../../gqls/promocode'

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

const CheckIcon = styled(CheckCircleFilled)`
    color: green;

    svg {
        width: 20px;
        height: 20px;
    }
`

const limit = 20

export let variables

const Promocodes = () => {
    const [search, setSearch] = useState("")
    const { user: moderator } = useUser('moderator')
    const { user: admin } = useUser()
    const [currentPage, setCurrentPage] = useState(1)
    const columns = useMemo(() => {
        let cols = [
            {
                title: 'Промокод',
                dataIndex: 'code',
                key: 'code',
                render: (value, obj) => (
                    <span>{value}</span>
                )
            },
            {
                title: 'Скидка',
                render: (_, obj) => (
                    <span>{obj.discount} руб.</span>
                )
            },
            {
                title: 'Опубликован',
                render: (_, obj) => (
                    obj.publish && <CheckIcon />
                )
            },
        ]

        if (admin && !moderator) {
            cols.push({
                title: 'Ресторан',
                render: (_, obj) => (
                    <span>{obj?.restaurant?.name}</span>
                )
            })
        }

        cols.push({
            title: "Действия",
            dataIndex: 'delete',
            key: 'delete',
            align: "right",
            render: (_, obj) => (
                <>
                    <Popconfirm
                        title={"Удалить промокод"}
                        onConfirm={() => { deletePromocode({ variables: { where: { id: obj.id } } }) }}
                        okText="Да"
                        cancelText="Нет"
                        disabled={deleteLoading}
                    >
                        {
                            deleteLoading ? <LoadingOutlined /> : <DeleteFilled className="delete-button" />
                        }
                    </Popconfirm>

                    {(admin && !moderator) && (
                        <Link to={`/admin/promocodes/${obj.id}`}>
                            <EditFilled className="edit-button" />
                        </Link>
                    )}

                    {(!admin && moderator) && (
                        <Link to={`/moderator/promocodes/${obj.id}`}>
                            <EditFilled className="edit-button" />
                        </Link>
                    )}
                </>
            )
        })

        return cols
    }, [admin, moderator])

    variables = useMemo(() => ({
        where: {
            restaurantId: (!admin && moderator) ? {
                equals: moderator.restaurantId
            } : {},
            delete: { equals: false },
            code: {
                contains: search,
                mode: "insensitive"
            }
        },
        take: limit,
        skip: limit * (currentPage - 1)
    }), [admin, moderator, search, currentPage])

    const { data, loading } = useQuery(FIND_MANY_PROMOCODE, {
        variables
    })

    const { data: countData } = useQuery(FIND_MANY_PROMOCODE_COUNT, {
        variables
    })

    const promocodes = useMemo(() => data ? data.findManyPromocode : [], [data])
    const promocodesCount = useMemo(() => data ? data.findManyPromocodeCount : [], [countData])

    const [deletePromocode, { loading: deleteLoading }] = useMutation(DELETE_ONE_PROMOCODE, {
        onCompleted: () => {
            message.success("Промокод удалён")
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
            console.error(e)
        },
        update: (client, { data: { deleteOnePromocode } }) => {
            const prevData = client.readQuery({
                query: FIND_MANY_PROMOCODE,
                variables,
            })
            if (prevData) {
                const { findManyPromocode } = prevData
                client.writeQuery({
                    query: FIND_MANY_PROMOCODE,
                    variables,
                    data: {
                        findManyPromocode: findManyPromocode.filter(item => item.id !== deleteOnePromocode.id)
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
                title="Промокоды"
                action={
                    <Link to={admin && !moderator ? '/admin/promocodes/new' : '/moderator/promocodes/new'}>
                        <Button type="primary">
                            + Добавить
                        </Button>   
                    </Link>
                }
            />
            <Form
                name="promocode-filter"
                layout="horizontal"
                onFinish={({ search }) => setSearch(search ? search : "")}
            >
                <Form.Item
                    name="search"
                    style={{ marginRight: 15 }}
                >
                    <Input
                        name="search"
                        placeholder="Найти"
                        allowClear
                        onChange={e => !e.target.value ? setSearch('') : null}
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
                dataSource={promocodes}
                scroll={{ x: 600 }}
                size={window.innerWidth < 500 ? 'small' : 'large'}
                pagination={{
                    current: currentPage,
                    pageSize: limit,
                    total: promocodesCount,
                }}
                onChange={handleChangeTable}
                columns={columns}
            />
        </>
    )
}

export default Promocodes