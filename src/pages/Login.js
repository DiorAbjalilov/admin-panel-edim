import React from "react";
import styled from "styled-components";
import {
  Form,
  Card as AntCard,
  Input,
  Button as AntButton,
  message,
} from "antd";
import { useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import { LOGIN_ADMIN } from "../gqls/admin";
import { LOGIN_MODERATOR } from "../gqls/moderator";

const requiredRule = {
  required: true,
  message: "Обязательное поле",
};

const emailRule = {
  type: "email",
  message: "Введите правильный электронный адрес",
};

const Login = () => {
  const { type } = useParams();
  if (type === "admin") {
    return <AdminLogin />;
  }
  if (type === "moderator") {
    return <ModeratorLogin />;
  }
  return null;
};

const AdminLogin = () => {
  const [signIn, { loading }] = useMutation(LOGIN_ADMIN, {
    onCompleted: ({ signInAdmin: { token } }) => {
      localStorage.setItem("token", token);
      window.location = "/admin";
    },
    onError: (e) => {
      message.error("Неправильный логин или пароль");
      console.log(
        "----------------------------------------------------------------",
      );
      console.log(JSON.stringify(e, null, 2));
    },
  });

  const handleSubmitForm = ({ login, password }) => {
    signIn({
      variables: {
        data: {
          email: login,
          password,
        },
      },
    });
  };

  return (
    <Wrapper>
      <Card title="Вход в панель администратора">
        <Form onFinish={handleSubmitForm} layout="vertical" name="login">
          <Form.Item
            colon={false}
            label="Эл. почта"
            name="login"
            rules={[requiredRule, emailRule]}
          >
            <Input placeholder="Введите электронную почту..." />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[requiredRule]}>
            <Input.Password placeholder="Введите пароль..." />
          </Form.Item>
          <Actions>
            <Button loading={loading} type="primary" htmlType="submit">
              Войти
            </Button>
            <Link to={`/moderator/login`}>Войти как модератор</Link>
          </Actions>
          <Link to={`/admin/forgot`}>Забыли пароль?</Link>
        </Form>
      </Card>
    </Wrapper>
  );
};

const ModeratorLogin = () => {
  const [signIn, { loading }] = useMutation(LOGIN_MODERATOR, {
    onCompleted: ({ signInModerator: { token } }) => {
      localStorage.setItem("token", token);
      window.location = "/moderator";
    },
    onError: (e) => {
      message.error("Неправильный логин или пароль");
      console.log(
        "................................................................gorithm",
      );
      console.log(JSON.stringify(e, null, 2));
    },
  });

  const handleSubmitForm = ({ login, password }) => {
    signIn({
      variables: {
        data: {
          email: login,
          password,
        },
      },
    });
  };

  return (
    <Wrapper>
      <Card title="Вход в панель модератора">
        <Form onFinish={handleSubmitForm} layout="vertical" name="login">
          <Form.Item
            colon={false}
            label="Эл. почта"
            name="login"
            rules={[requiredRule]}
          >
            <Input placeholder="Введите электронную почту..." />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[requiredRule]}>
            <Input.Password placeholder="Введите пароль..." />
          </Form.Item>
          <Actions>
            <Button loading={loading} type="primary" htmlType="submit">
              Войти
            </Button>
            <Link to={`/admin/login`}>Войти как администратор</Link>
          </Actions>
          <Link to={`/moderator/forgot`}>Забыли пароль?</Link>
        </Form>
      </Card>
    </Wrapper>
  );
};

const Card = styled(AntCard)`
  width: 400px;

  @media only screen and (max-width: 420px) {
    width: 95%;
  }
`;

const Button = styled(AntButton)``;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;

  @media only screen and (max-width: 420px) {
    justify-content: flex-start;
    padding-top: 30px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-top: 5px;
`;

export default Login;
