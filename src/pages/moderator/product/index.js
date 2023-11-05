import { useMemo, useState } from "react";
import {
  Button,
  Card as AntCard,
  List,
  Form as AntForm,
  Input,
  Select,
} from "antd";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";

import Top from "../../../components/Top";
import { FIND_MANY_PRODUCT, CATEGORIES } from "../../../gqls/product";
import { useUser } from "../../../utils/hooks";
import { COLORS } from "../../../utils/const";
import { URI_Assets } from "../../../utils/apollo";

const Card = styled(AntCard)`
  .ant-card-meta-title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1; /* number of lines to show */
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .ant-card-meta-description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  img {
    height: 120px;
    object-fit: contain;
    background-color: #f0f2f5;
  }

  .ant-card-body {
    padding: 15px;
  }
  .text {
    margin-top: 5px;
  }
`;
const Form = styled(AntForm)`
  display: flex;

  .item {
    margin-right: 15px;
    width: 200px;
  }
`;

export let variables = undefined;

const Product = () => {
  const { user } = useUser("moderator");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(undefined);
  const [publish, setPublish] = useState(undefined);

  variables = useMemo(
    () => ({
      where: {
        restaurantId: { equals: user ? user.restaurantId : "" },
        delete: { equals: false },
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
        categories: categories ? { hasSome: categories } : undefined,
        publish: typeof publish === "boolean" ? { equals: publish } : undefined,
      },
    }),
    [user, search, categories, publish],
  );

  const { data, loading } = useQuery(FIND_MANY_PRODUCT, {
    variables,
  });

  const { data: categoriesData } = useQuery(CATEGORIES, {
    variables: {
      where: {
        restaurantId: { equals: user ? user.restaurantId : "" },
        delete: { equals: false },
      },
    },
    fetchPolicy: "network-only",
  });

  const onFinish = ({ search, categories, publish }) => {
    setSearch(search ? search : "");
    setCategories(categories);
    setPublish(publish);
  };

  const products = useMemo(() => (data ? data.findManyProduct : []), [data]);
  const usedCategories = useMemo(
    () => (categoriesData ? categoriesData.findManyCategoryByProduct : []),
    [categoriesData],
  );

  return (
    <>
      <Top
        title="Список товаров"
        action={
          <Link to="/moderator/product/add">
            <Button type="primary">+ Добавить</Button>
          </Link>
        }
      />
      <Form name="product-filter" layout="horizontal" onFinish={onFinish}>
        <Form.Item className="item" name="search">
          <Input
            placeholder="Поиск"
            allowClear
            onChange={(e) => (!e.target.value ? setSearch("") : null)}
          />
        </Form.Item>
        <Form.Item name="categories" className="item">
          <Select
            allowClear
            mode="tags"
            placeholder="Выбрать категории"
            onChange={(data) =>
              data.length === 0 ? setCategories(undefined) : null
            }
          >
            {usedCategories.map((item) => (
              <Select.Option key={item}>{item}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className="item" name="publish">
          <Select
            placeholder="Публикация"
            allowClear
            onChange={(data) =>
              typeof data !== "boolean" ? setPublish(undefined) : null
            }
          >
            <Select.Option value={true}>Опубликовано</Select.Option>
            <Select.Option value={false}>Не опубликовано</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Показать
          </Button>
        </Form.Item>
      </Form>
      <List
        loading={loading}
        dataSource={products}
        rowKey={(item) => item.id}
        grid={{ gutter: 15, column: 7 }}
        renderItem={(item) => (
          <Link to={`/moderator/product/edit/${item.id}`}>
            <List.Item>
              <Card
                cover={
                  <img src={`${URI_Assets}/${item.image}`} alt={item.name} />
                }
                hoverable
              >
                <Card.Meta title={item.name} description={item.description} />
                <div className="ant-card-meta-description text">
                  {item.price} so'm.
                </div>
                <div
                  className="ant-card-meta-description"
                  style={{
                    color: item.publish
                      ? COLORS.primary.green
                      : COLORS.secondary.red,
                  }}
                >
                  {item.publish ? "Опубликовано" : "Не опубликовано"}
                </div>
              </Card>
            </List.Item>
          </Link>
        )}
      />
    </>
  );
};

export default Product;
