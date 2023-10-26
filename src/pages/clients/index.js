import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
    Button,
    Table,
    Switch,
    Popconfirm,
    Form as AntForm,
    Select,
    Input,
    message
} from 'antd'
import { MenuOutlined } from '@ant-design/icons';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/client'

import Top from '../../components/Top'
import { GET_MODERATORS, UPDATE_MODERATOR, UPDATE_MANY_MODERATOR, REORDER_MODERATORS } from '../../gqls/moderator'

const Form = styled(AntForm)`
    display: flex;
    margin-bottom: 15px;

    .item {
        margin-right: 15px;
        width: 200px;
    }
`
const SortableItem = SortableElement(props => <tr {...props} />)
const SortableBody = SortableContainer(props => <tbody {...props} />)
const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />)

const Clients = () => {
    const { type } = useParams()
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState(undefined)
    const [moderators, setModerators] = useState([])

    const variables = useMemo(() => ({
        where: {
            delete: {
                equals: status
            },
            restaurant: {
                name: search ? { contains: search, mode: 'insensitive' } : undefined
            }
        },
        orderBy: { weight: 'desc' }
    }), [search, status])

    const { data, loading } = useQuery(GET_MODERATORS, {
        onCompleted: ({ findManyModerator }) => {
            setModerators(findManyModerator)
        },
        fetchPolicy: 'network-only',
        variables,
        pollInterval: 5000
    })

    const [updateModerator] = useMutation(UPDATE_MODERATOR)

    const [reorderModerators, { loading: reorderLoading }] = useMutation(REORDER_MODERATORS)

    const onUpdateModerator = async (id, data) => {
        await updateModerator({
            variables: {
                where: {
                    id
                },
                data
            }
        })
    }

    const moderatorsTotal = useMemo(() => data ? data.findManyModeratorCount : 0, [data])

    const onFormSubmit = ({ status, search }) => {
        setSearch(search)
        setStatus(status)
    }

    const onSortEnd = async ({ oldIndex, newIndex }) => {
        if (!search && typeof status !== 'boolean') {
            if (oldIndex !== newIndex) {
                let prevModerators = [...moderators]
                const oldItem = prevModerators[oldIndex]
                const newItem = prevModerators[newIndex]
                const toDown = oldIndex < newIndex
                const target = toDown ? newIndex + 1 : newIndex
                let itemsToUpdate = []

                prevModerators.splice(oldIndex, 1, undefined)
                prevModerators.splice(target, 0, oldItem)

                setModerators(prevModerators.filter(item => item))

                reorderModerators({
                    variables: {
                        where: {
                            oldIndex,
                            newIndex
                        }
                    }
                })
            }
        } else {
            message.warning("Отмените фильры перед сортировкой")
        }
    }

    const DraggableContainer = props => (
        <SortableBody
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={onSortEnd}
            {...props}
        />
    )

    const DraggableBodyRow = useCallback(({ className, style, ...restProps }) => {
        // function findIndex base on Table rowKey props and should always be a right array index
        const index = moderators.findIndex(x => x.weight === restProps['data-row-key']);
        return <SortableItem index={index} {...restProps} />;
    }, [moderators])

    return (
        <>
            <Top
                title={`Клиенты (${moderatorsTotal})`}
                action={
                    <Link to='/admin/clients/add'>
                        <Button
                            type='primary'
                        >
                            + Добавить
                        </Button>
                    </Link>
                }
            />
            <Form
                name="clients-filter"
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
                        // defaultValue={false}
                        // onChange={data => setStatus(false)}
                        allowClear
                        onClear={() => setStatus(undefined)}
                    >
                        <Select.Option value={false}>
                            Активный
                        </Select.Option>
                        <Select.Option value={true}>
                            Удалённый
                        </Select.Option>
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
                loading={loading || reorderLoading}
                // rowKey={(obj) => obj.id}
                dataSource={moderators}
                scroll={{ x: 600 }}
                size={window.innerWidth < 500 ? 'small' : 'large'}
                // pagination={{
                //     current: currentPage,
                //     total: moderatorsTotal,
                //     pageSize: limit
                // }}
                pagination={false}
                // onChange={handleChangeTable}
                rowKey={"weight"}
                components={{
                    body: {
                        wrapper: DraggableContainer,
                        row: DraggableBodyRow,
                    },
                }}
                columns={[
                    {
                        title: 'Сортировка',
                        dataIndex: 'sort',
                        width: 30,
                        className: 'drag-visible',
                        render: () => <DragHandle />,
                    },
                    {
                        title: 'Ресторан',
                        dataIndex: 'restaurant',
                        key: 'restaurant',
                        render: (restaurant, obj) => restaurant ? (
                            <Link to={`/${type}/restaurant/${restaurant.id}`}>{restaurant.name}</Link>
                        ) : <span>-</span>
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email',
                    },
                    {
                        title: 'Дата создание',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (createdAt) => {
                            const date = new Date(createdAt)
                            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                        }
                    },
                    {
                        title: 'Бан',
                        dataIndex: 'block',
                        key: 'block',
                        render: (block, object) => <Switch
                            size='small'
                            onChange={(value) => onUpdateModerator(
                                object.id,
                                {
                                    block: {
                                        set: value
                                    },
                                    restaurant: object.restaurant ? {
                                        update: {
                                            publish: {
                                                set: false
                                            }
                                        }
                                    } : undefined
                                }
                            )}
                            defaultChecked={block}
                        />
                    },
                    {
                        title: 'Действие',
                        dataIndex: 'delete',
                        key: 'delete',
                        width: 150,
                        render: (_, object) => (
                            <Popconfirm
                                title={`${object.delete ? "Восстановить" : "Удалить"} модератора?`}
                                onConfirm={() => {
                                    onUpdateModerator(
                                        object.id,
                                        {
                                            delete: {
                                                set: !object.delete
                                            },
                                            restaurant: object.restaurant ? {
                                                update: {
                                                    publish: {
                                                        set: false
                                                    },
                                                    delete: {
                                                        set: !object.delete
                                                    }
                                                }
                                            } : undefined
                                        }
                                    )
                                }}
                            >
                                <Button
                                    type={object.delete ? 'primary' : 'danger'}
                                >
                                    {object.delete ? "Восстановить" : "Удалить"}
                                </Button>
                            </Popconfirm>
                        )
                    },
                ]}
            />
        </>
    )
}

export default Clients
