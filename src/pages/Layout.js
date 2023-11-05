import { useEffect } from "react";
import styled from "styled-components";
import { Spin, Layout as AntLayout, message } from "antd";
import { Navigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Menu from "../components/Menu";
import { useUser } from "../utils/hooks";

const { Content: AntContent, Footer: AntFooter, Sider: AntSider } = AntLayout;

const Layout = ({ children, ...props }) => {
  const { type } = useParams();
  const { user, loading, error } = useUser(type);

  useEffect(() => {
    if (user && user.block) {
      message.error("Ваш аккунт был заблокирован");
    }
    if (user && user.delete) {
      message.error("Ваш аккунт был удалён");
    }
  }, [user]);

  if (loading) {
    return (
      <LoadingView>
        <Spin />
      </LoadingView>
    );
  }

  if (error || !user || user.block || user.delete) {
    return <Navigate to={`/${type}/login`} />;
  }

  return (
    <Provider>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo">Панель Е-димдим</div>
        <Menu type={type} />
      </Sider>
      <AntLayout>
        <Header
          user={
            user
              ? type === "moderator"
                ? { ...user, email: user.login }
                : user
              : { email: "test@test.ru" }
          }
          {...props}
        />
        <Content>
          <div className="inside">{children}</div>
        </Content>
        <Footer>
          {type === "moderator"
            ? `Панель администратора @2023`
            : `Панель администратора @2023`}
        </Footer>
      </AntLayout>
    </Provider>
  );
};

const LoadingView = styled.div`
  background: whitesmoke;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled(AntContent)`
  margin: 20px 20px 0;

  @media only screen and (max-width: 480px) {
    margin: 10px 0;
  }

  .inside {
    padding: 18px 22px;
    background: #fff;
    min-height: 100%;

    @media only screen and (max-width: 480px) {
      padding: 20px 14px;
    }
  }
`;

const Footer = styled(AntFooter)`
  text-align: center;
`;

const Provider = styled(AntLayout)`
  min-height: 100vh;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: whitesmoke;
    cursor: pointer;
    transition: 0.3s background;

    img {
      width: 60%;
    }
  }

  .ant-layout-sider-zero-width-trigger {
    top: 11px;
  }
`;

const Sider = styled(AntSider)`
  z-index: 3;

  @media only screen and (max-width: 992px) {
    position: absolute;
    height: 100%;
  }
`;

export default Layout;
