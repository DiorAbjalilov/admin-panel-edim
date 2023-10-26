import { useState } from 'react'
import {
    Input,
    Form as AntForm,
    Select,
    Button as AntButton,
    message,
    Tooltip,
    Switch,
    DatePicker,
    Typography
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, Navigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'

import { useUser } from '../../utils/hooks'

import { UPDATE_ONE_RESTAURANT } from '../../gqls/restaurant'
import { REQUEST_ID } from '../../gqls/moderator'

import Top from '../../components/Top'
import moment from 'moment'

const Form = styled(AntForm)`
    max-width: 400px;

    .row {
        display: flex;
    }
`

const Button = styled(AntButton)`

`

const requiredRule = {
    required: true,
    message: 'Обязательное поле'
}

const RequestId = () => {
    const { type, id } = useParams()
    const navigate = useNavigate()

    const [updateRestaurant, { loading: updateLoaing }] = useMutation(UPDATE_ONE_RESTAURANT, {
        onCompleted: ({ updateOneRestaurant }) => {
            message.success("Идентификатор получен")
            navigate(`/${type}/restaurant/${id}`)
        },
        onError: e => {
            message.error("Не удалось обновить данные")
        }
    })

    const [requestId, { loading }] = useMutation(REQUEST_ID, {
        onCompleted: ({ registerRestaurantForBilling }) => {
            if (id) {
                updateRestaurant({
                    variables: {
                        where: { id },
                        data: {
                            paymentId: { set: registerRestaurantForBilling }
                        }
                    }
                })
            } else {
                message.warning("Создайте ресторан")
            }
        },
        onError: e => {
            message.error("Не удалось получить идентификатор")
        }
    })

    const submit = ({ ceo, siteUrl, addresses, ...values }) => {
        const data = {
            ...values,
            ceo: {
                ...ceo,
                country: ceo.country.toUpperCase(),
                birthDate: moment(ceo.birthDate).format('YYYY-MM-DD')
            },
            siteUrl: siteUrl ? siteUrl : 'https://edimdim.ru/',
            addresses: addresses.map(item => ({ ...item, country: item.country.toUpperCase() }))
        }
        requestId({
            variables: { data }
        })
    }

    return (
        <>
            <Top title={"Запрос идентификатора магазина"} />
            <Form
                onFinish={submit}
                layout="vertical"
                name="add-restaurant"
                initialValues={{
                    smz: false
                }}
            >
                <Form.Item
                    name="billingDescriptor"
                    label="Название магазина в СМС и на страницепроверки 3DS на иностранном языке(не более 14 символов)"
                    rules={[requiredRule]}
                >
                    <Input placeholder="Kompania" maxLength={14} />
                </Form.Item>
                <Form.Item
                    name="fullName"
                    label="Полное наименование организации"
                    rules={[requiredRule]}
                >
                    <Input placeholder="Общество с ограниченной ответственностью «Компания»" />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Сокращенное наименование организации"
                    rules={[requiredRule]}
                >
                    <Input placeholder="ООО «Компания»" />
                </Form.Item>
                <Form.Item
                    name="inn"
                    label="ИНН"
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder="10 или 12 цифр"
                        maxLength={12}
                    />
                </Form.Item>
                <Form.Item
                    name="kpp"
                    label="КПП (если у вас ИП или Самозанятый, поставьте 000000000)"
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder="9 цифр"
                        maxLength={9}
                    />
                </Form.Item>
                <Form.Item
                    name="ogrn"
                    label="ОГРН"
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder="ОГРН"
                        maxLength={16}
                    />
                </Form.Item>
                <Form.Item
                    name="smz"
                    label="Вы «Самозанятый»?"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    name="addresses"
                    label="Адреса"
                    rules={[requiredRule]}
                >
                    <Form.List
                        name="addresses"
                        initialValue={[{}]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Form.Item key={key} style={{ marginBottom: 0 }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'type']}
                                            rules={[requiredRule]}
                                        >
                                            <Select
                                                placeholder="Тип адреса"
                                            >
                                                <Select.Option key={'legal'}>
                                                    Юридический
                                                </Select.Option>
                                                <Select.Option key={'actual'}>
                                                    Фактический
                                                </Select.Option>
                                                <Select.Option key={'post'}>
                                                    Почтовый
                                                </Select.Option>
                                                <Select.Option key={'other'}>
                                                    Прочий
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'zip']}
                                            rules={[requiredRule]}
                                        >
                                            <Input placeholder="Почтовый индекс" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'country']}
                                            style={{ marginBottom: 0 }}
                                            rules={[requiredRule]}
                                        >
                                            <Input placeholder='Трехбуквенный код страны по ISO(Например RUS)' />
                                        </Form.Item>
                                        <div
                                            style={{ marginBottom: 24 }}
                                        >
                                            <a
                                                target={"_blank"}
                                                href="https://ru.wikipedia.org/wiki/ISO_3166-1"
                                            >
                                                Страны в формате ISO
                                            </a>
                                        </div>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'city']}
                                            rules={[requiredRule]}
                                        >
                                            <Input placeholder="Город или населенный пункт" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'street']}
                                            rules={[requiredRule]}
                                        >
                                            <Input placeholder="Адрес улица, дом, корпус, квартира, офис" />
                                        </Form.Item>
                                        {/* <MinusCircleOutlined onClick={() => remove(name)} /> */}
                                        {
                                            fields.length > 1 && (
                                                <Form.Item>
                                                    <Button
                                                        onClick={() => remove(name)}
                                                        type="danger"
                                                    >
                                                        Удалить адрес
                                                    </Button>
                                                </Form.Item>
                                            )
                                        }
                                    </Form.Item>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Добавить адрес
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Электронный адрес организации"
                    rules={[requiredRule]}
                >
                    <Input placeholder="example@example.ru" />
                </Form.Item>
                <Form.Item
                    name="ceo"
                    label="Сведения о руководителе"
                    // rules={[requiredRule]}
                    required
                    style={{ marginBottom: 0 }}
                >
                    <Input.Group>
                        <Form.Item
                            name={["ceo", "firstName"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Имя' />
                        </Form.Item>
                        <Form.Item
                            name={["ceo", "lastName"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Фамилия' />
                        </Form.Item>
                        <Form.Item
                            name={["ceo", "middleName"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Отчество' />
                        </Form.Item>
                        <Form.Item
                            name={["ceo", "birthDate"]}
                            rules={[requiredRule]}
                        >
                            <DatePicker
                                placeholder='Дата рождения'
                            />
                        </Form.Item>
                        <Form.Item
                            name={["ceo", "phone"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Контактный телефон' />
                        </Form.Item>
                        <Form.Item
                            name={["ceo", "country"]}
                            rules={[requiredRule]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder='Страна гражданства по ISO 3 символа(Например RUS)' />
                        </Form.Item>
                        <div
                            style={{ marginBottom: 24 }}
                        >
                            <a
                                target={"_blank"}
                                href="https://ru.wikipedia.org/wiki/ISO_3166-1"
                            >
                                Страны в формате ISO
                            </a>
                        </div>
                    </Input.Group>
                </Form.Item>
                <Form.Item
                    name="siteUrl"
                    label="Адрес интернет сайта"
                >
                    <Input placeholder='Адрес интернет сайта(https://edimdim.ru)' />
                </Form.Item>
                <Form.Item
                    name="bankAccount"
                    label="Реквизиты"
                    // rules={[requiredRule]}
                    required
                    style={{ marginBottom: 0 }}
                >
                    <Input.Group>
                        <Form.Item
                            name={["bankAccount", "account"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Расчетный счет' />
                        </Form.Item>
                        <Form.Item
                            name={["bankAccount", "bankName"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='Наименование банка' />
                        </Form.Item>
                        <Form.Item
                            name={["bankAccount", "bik"]}
                            rules={[requiredRule]}
                        >
                            <Input placeholder='БИК' />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Form.Item>
                    Все данные передаются в Банк, система Е-димдим не хранит ваши данные на своих серверах.
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                >
                    Запросить
                </Button>
                <Button
                    style={{ marginLeft: 15 }}
                    onClick={() => navigate('/moderator/restaurant/edit')}
                >
                    Назад
                </Button>
            </Form>
        </>
    )
}

export default RequestId