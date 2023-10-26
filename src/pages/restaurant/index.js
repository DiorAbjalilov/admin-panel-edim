import styled from "styled-components"
import {
    Button as AntButton,
    Spin,
    Empty,
    Image
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from "@apollo/client"

import Top from "../../components/Top"
import LabelComponent from "../../components/Label"
import { FIND_UNIQUE_RESTAURANT } from '../../gqls/restaurant'
import { COLORS } from "../../utils/const"

const Label = styled(LabelComponent)`
    margin-bottom: 15px;
`

const LoadingView = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const EmptyContainer = styled(Empty)`
    display: flex;
    flex-direction: column;
    min-height: 500px;
    align-items: center;
    justify-content: center;
`

const Button = styled(AntButton)`

`

const Restaurant = () => {

    const { id } = useParams()

    const { data, loading } = useQuery(FIND_UNIQUE_RESTAURANT, {
        variables: { where: { id } }
    })

    const restaurant = data && data.findUniqueRestaurant ? data.findUniqueRestaurant : null

    if (loading) {
        return (
            <LoadingView>
                <Spin />
            </LoadingView>
        )
    }

    return (
        <>
            <Top title="Ваш ресторан" />
            {
                restaurant ? (
                    <>
                        <Label
                            label="Логотип"
                            value={
                                <Image
                                    src={`/uploads/${restaurant.logo}`}
                                />
                            }
                            column
                        />
                        <Label
                            label="Изображение"
                            value={
                                <Image
                                    src={`/uploads/${restaurant.image}`}
                                />
                            }
                            column
                        />
                        <Label
                            label="Название ресторана"
                            value={restaurant.name}
                        />
                        <Label
                            label="Описание"
                            value={restaurant.description}
                        />
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
                        <Label
                            label="Идентификатор магазина"
                            value={restaurant.paymentId}
                        />
                        <Label
                            label="Населенный пункт или город"
                            value={restaurant.city ? restaurant.city : '-'}
                        />
                        <Label
                            label="Статус"
                            value={restaurant.publish ? "Опубликован" : "Не опубликован"}
                            valueStyle={{
                                color: restaurant.publish ? COLORS.primary.green : COLORS.secondary.red,
                                fontWeight: "bold"
                            }}
                        />
                        <Label
                            label="Категории"
                            value={restaurant.categories.join(", ")}
                        />
                        <Link to={`/admin/restaurant/edit/${id}`}>
                            <Button
                                type="primary"
                            >
                                Изменить
                            </Button>
                        </Link>
                    </>
                ) : (
                    <EmptyContainer
                        description={"У вас еще нет зарегистрированного ресторана."}
                    >
                        <Link to={'/moderator/restaurant/add'}>
                            <Button
                                type="primary"
                            >
                                Создать
                            </Button>
                        </Link>
                    </EmptyContainer>
                )
            }
        </>
    )
}

export default Restaurant