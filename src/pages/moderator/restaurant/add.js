import { useState } from "react";
import {
  Input,
  Form as AntForm,
  Select,
  Button as AntButton,
  message,
} from "antd";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useMutation } from "@apollo/client";

import Top from "../../../components/Top";
import UploadFile from "../../../components/Upload";
import { CREATE_ONE_RESTAURANT } from "../../../gqls/restaurant";
import { GET_MODERATOR } from "../../../gqls/moderator";
import { useUser } from "../../../utils/hooks";
import { RESTAURANT_CATEGORIES } from "../../../utils/const";
import { getSuggest, cityParser } from "../../../utils/dadata";

const Form = styled(AntForm)`
  max-width: 400px;

  .row {
    display: flex;
  }
`;

const Button = styled(AntButton)``;

const requiredRule = {
  required: true,
  message: "Обязательное поле",
};

let inputTimeout;

const AddRestaurant = () => {
  const [logo, setLogo] = useState("");
  const [image, setImage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { type } = useParams();
  const { user } = useUser(type);
  const navigate = useNavigate();

  const [create, { loading }] = useMutation(CREATE_ONE_RESTAURANT, {
    onCompleted: ({ createOneRestaurant }) => {
      message.success("Рестаран создан");
      navigate("/moderator/restaurant");
    },
    onError: (e) => {
      message.error("Что то пошло не так, повторите попытку позже");
    },
    update: (client, { data: { createOneRestaurant } }) => {
      client.writeQuery({
        query: GET_MODERATOR,
        data: {
          findMeModerator: {
            ...user,
            restaurantId: createOneRestaurant.id,
          },
        },
      });
    },
  });

  const submit = ({ minimumOrderAmount, ...data }) => {
    create({
      variables: {
        data: {
          ...data,
          minimumOrderAmount: parseInt(minimumOrderAmount),
          moderator: {
            connect: { id: user.id },
          },
          publish: true,
        },
      },
    });
  };

  const onChnageSearch = (text) => {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
      if (text) {
        getSuggest(text)
          .then((response) => response.json())
          .then((result) => {
            const { suggestions } = result;
            const arr = cityParser(suggestions);
            if (arr.length > 0) {
              setSuggestions(arr);
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }
      clearTimeout(inputTimeout);
    }, 1300);
  };

  if (user && user.restaurantId) {
    return <Navigate to={`/${type}/restaurant`} />;
  }

  return (
    <>
      <Top title="Создание ресторана" />
      <Form onFinish={submit} layout="vertical" name="add-restaurant">
        <Form.Item name="name" label="Название" rules={[requiredRule]}>
          <Input placeholder="Введите назание ресторана" />
        </Form.Item>
        <div className="row">
          <Form.Item
            name="logo"
            label="Логотип"
            rules={[requiredRule]}
            style={{ marginRight: 15 }}
          >
            <UploadFile value={logo} onChange={(name) => setLogo(name)}>
              Выбрать изображение
            </UploadFile>
          </Form.Item>
          <Form.Item name="image" label="Изображение" rules={[requiredRule]}>
            <UploadFile value={image} onChange={(name) => setImage(name)}>
              Выбрать изображение
            </UploadFile>
          </Form.Item>
        </div>
        <Form.Item name="description" label="Описание" rules={[requiredRule]}>
          <Input.TextArea
            style={{ height: 150 }}
            placeholder="Введите описание"
          />
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
          <Input.TextArea
            style={{ height: 150 }}
            placeholder="Введите условия"
          />
        </Form.Item>
        <Form.Item
          name="legalInformation"
          label="Юридическая информация"
          rules={[requiredRule]}
        >
          <Input.TextArea
            style={{ height: 150 }}
            placeholder="Введите информацию"
          />
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
            {suggestions.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* <Form.Item
                    name="paymentId"
                    label="Идентификатор магазина"
                >
                    <Input placeholder="Введите id" />
                </Form.Item> */}
        <Form.Item name="categories" label="Категории" rules={[requiredRule]}>
          <Select mode="multiple" allowClear placeholder="Выберите категории">
            {RESTAURANT_CATEGORIES.map((item) => (
              <Select.Option key={item}>{item}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Создать
        </Button>
      </Form>
    </>
  );
};

export default AddRestaurant;
