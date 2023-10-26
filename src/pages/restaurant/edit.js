import { useState, useMemo } from 'react'
import {
    Input,
    Form as AntForm,
    Select,
    Button as AntButton,
    message,
    Spin,
    Switch
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useMutation, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import Top from '../../components/Top'
import UploadFile from '../../components/Upload'
import { UPDATE_ONE_RESTAURANT, FIND_UNIQUE_RESTAURANT } from '../../gqls/restaurant'
import { RESTAURANT_CATEGORIES } from '../../utils/const'
import { getSuggest, cityParser } from '../../utils/dadata'

const Form = styled(AntForm)`
    max-width: 400px;

    .row {
        display: flex;
    }
`

const Button = styled(AntButton)`

`

const LoadingView = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const requiredRule = {
    required: true,
    message: 'Обязательное поле'
}

let inputTimeout

const EditRestaurant = () => {
    const [logo, setLogo] = useState('')
    const [image, setImage] = useState('')
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { id } = useParams()
    const [suggestions, setSuggestions] = useState([])

    const variables = useMemo(() => ({
        where: {
            id
        }
    }), [id])

    const { loading: findLoading } = useQuery(FIND_UNIQUE_RESTAURANT, {
        variables,
        onCompleted: ({ findUniqueRestaurant: restaurant }) => {
            form.setFieldsValue({
                ...restaurant
            })
        }
    })

    const [update, { loading }] = useMutation(UPDATE_ONE_RESTAURANT, {
        onCompleted: () => {
            message.success("Данные изменены")
            navigate("/admin/restaurant/" + id)
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
        },
        update: (client, { data: { updateOneRestaurant } }) => {
            client.writeQuery({
                query: FIND_UNIQUE_RESTAURANT,
                variables: {
                    where: {
                        id
                    }
                },
                data: {
                    findUniqueRestaurant: updateOneRestaurant
                }
            })
        }
    })

    const submit = ({
        minimumOrderAmount,
        categories,
        ...data
    }) => {
        const editData = Object.keys(data).reduce((acc, key) => {
            acc[key] = { set: data[key] }
            return acc
        }, {})
        update({
            variables: {
                where: {
                    id
                },
                data: {
                    ...editData,
                    categories,
                    minimumOrderAmount: { set: parseInt(minimumOrderAmount) },

                }
            }
        })
    }
    const onChnageSearch = (text) => {
        clearTimeout(inputTimeout)
        inputTimeout = setTimeout(() => {
            if (text) {
                getSuggest(text).then(response => response.json()).then(result => {
                    const { suggestions } = result
                    const arr = cityParser(suggestions)
                    if (arr.length > 0) {
                        setSuggestions(arr)
                    }
                }).catch(e => {
                    console.error(e)
                })
            }
            clearTimeout(inputTimeout)
        }, 1300)
    }

    if (findLoading) {
        return (
            <LoadingView>
                <Spin />
            </LoadingView>
        )
    }

    return (
        <>
            <Top title="Редактирование ресторана" />
            {
                findLoading ? (
                    <LoadingView>
                        <Spin />
                    </LoadingView>
                ) : (
                    <Form form={form} onFinish={submit} layout="vertical" name="edit-restaurant">
                        <Form.Item
                            name="name"
                            label="Название"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Введите назание ресторана" />
                        </Form.Item>
                        <div className="row">
                            <Form.Item
                                name="logo"
                                label="Логотип"
                                rules={[requiredRule]}
                                style={{ marginRight: 15 }}
                            >
                                <UploadFile
                                    value={logo}
                                    onChange={name => setLogo(name)}
                                >
                                    Выбрать изображение
                                </UploadFile>
                            </Form.Item>
                            <Form.Item
                                name="image"
                                label="Изображение"
                                rules={[requiredRule]}
                            >
                                <UploadFile
                                    value={image}
                                    onChange={name => setImage(name)}
                                >
                                    Выбрать изображение
                                </UploadFile>
                            </Form.Item>
                        </div>
                        <Form.Item
                            name="description"
                            label="Описание"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите описание" />
                        </Form.Item>
                        <Form.Item
                            name="minimumOrderAmount"
                            label="Минимальная стоимость доставки"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Введите стоимость в рб." type="number" />
                        </Form.Item>
                        <Form.Item
                            name="deliveryCondition"
                            label="Условия доставки"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите условия" />
                        </Form.Item>
                        <Form.Item
                            name="legalInformation"
                            label="Юридическая информация"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите информацию" />
                        </Form.Item>
                        <Form.Item
                            name="paymentId"
                            label="Идентификатор магазина"
                        // rules={[requiredRule]}
                        >
                            <Input disabled placeholder="Введите id" />
                        </Form.Item>
                        <Form.Item
                            name="city"
                            label="Населенный пункт или город"
                            rules={[requiredRule]}
                        >
                            <Select
                                showSearch
                                placeholder="Введите город или населенный пункт"
                                onSearch={onChnageSearch}
                                // onChange={onChangeValue}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    suggestions.map(item => (
                                        <Select.Option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.value}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="categories"
                            label="Категории"
                            rules={[requiredRule]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Выберите категории"
                            >
                                {
                                    RESTAURANT_CATEGORIES.map(item => (
                                        <Select.Option
                                            key={item}
                                        >
                                            {item}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="publish"
                            label="Опубликован"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ marginRight: 15, marginBottom: 15 }}
                        >
                            Сохранить
                        </Button>
                        <Link to={`/admin/restaurant/request-id/${id}`}>
                            <Button>
                                Запросить индентификатор
                            </Button>
                        </Link>
                    </Form>
                )
            }
        </>
    )
}

export default EditRestaurant