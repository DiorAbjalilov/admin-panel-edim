import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
    Table,
    Form as AntForm,
} from 'antd'
import { MenuOutlined } from '@ant-design/icons';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'

import Top from '../../../components/Top'
import { useUser } from '../../../utils/hooks'
import { FIND_UNIQUE_RESTAURANT } from '../../../gqls/restaurant'
import { UPDATE_ONE_RESTAURANT } from '../../../gqls/restaurant';

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
    const { user } = useUser(type)
    const [categories, setCategories] = useState([])
    const [edit, setEdit] = useState(null)

    const variables = useMemo(() => ({
        where: {
            id: user && user.restaurantId ? user.restaurantId : ""
        }
    }), [user])

    const { data, loading } = useQuery(FIND_UNIQUE_RESTAURANT, {
        variables,
        fetchPolicy: 'network-only',
        onCompleted: ({ findUniqueRestaurant }) => {
            if (findUniqueRestaurant) {
                setCategories(findUniqueRestaurant.productsCategoriers.map((item, index) => ({ name: item, index })))
            }
        }
    })

    const restaurant = useMemo(() => data ? data.findUniqueRestaurant : null, [data])

    const [updateRestaurant, { loading: updateLoading }] = useMutation(UPDATE_ONE_RESTAURANT)

    const onSortEnd = async ({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
            const prevCategories = [...categories]

            const oldItem = prevCategories[oldIndex]
            const toDown = oldIndex < newIndex
            const target = toDown ? newIndex + 1 : newIndex

            prevCategories.splice(oldIndex, 1, undefined)
            prevCategories.splice(target, 0, oldItem)
            const newProductCategories = prevCategories.filter(item => item)
            setCategories(newProductCategories)
            updateRestaurant({
                variables: {
                    where: { id: restaurant.id },
                    data: {
                        productsCategoriers: newProductCategories.map(item => item.name)
                    }
                }
            })
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
        const index = categories.findIndex(x => x.index === restProps['data-row-key']);
        return <SortableItem index={index} {...restProps} />;
    }, [categories])

    return (
        <>
            <Top
                title={`Категории товаров`}
            // action={
            //     <Link to='/admin/clients/add'>
            //         <Button
            //             type='primary'
            //         >
            //             + Добавить
            //         </Button>
            //     </Link>
            // }
            />
            <Table
                loading={loading || updateLoading}
                dataSource={categories}
                scroll={{ x: 600 }}
                size={window.innerWidth < 500 ? 'small' : 'large'}
                pagination={false}
                rowKey={"index"}
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
                        title: 'Название',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name, obj) => (
                            <Link to={name}>
                                {name}
                            </Link>
                        )
                    }
                ]}
            />
        </>
    )
}

export default Clients
