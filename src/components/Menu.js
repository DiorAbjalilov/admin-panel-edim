import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'

const MenuComponent = ({ type }) => {
    const { pathname } = window.location

    return (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[pathname]}>
            <Menu.Item style={{ marginTop: 0 }} key={`/${type}`}>
                <MenuLink to={`/${type}`}>
                    Главная
                </MenuLink>
            </Menu.Item>
            {
                type === 'moderator' && (
                    <Menu.Item key={`/${type}/restaurant`}>
                        <MenuLink to={`/${type}/restaurant`}>
                            Ресторан
                        </MenuLink>
                    </Menu.Item>
                )
            }
            {
                type === 'moderator' && (
                    <Menu.Item key={`/${type}/address`}>
                        <MenuLink to={`/${type}/address`}>
                            Адреса
                        </MenuLink>
                    </Menu.Item>
                )
            }
            {
                type === 'moderator' && (
                    <Menu.Item key={`/${type}/product`}>
                        <MenuLink to={`/${type}/product`}>
                            Товары
                        </MenuLink>
                    </Menu.Item>
                )
            }
            {
                type === 'moderator' && (
                    <Menu.Item key={`/${type}/stock`}>
                        <MenuLink to={`/${type}/stock`}>
                            Акции
                        </MenuLink>
                    </Menu.Item>
                )
            }
            {
                type === 'moderator' && (
                    <Menu.Item key={`/${type}/categories`}>
                        <MenuLink to={`/${type}/categories`}>
                            Категории товаров
                        </MenuLink>
                    </Menu.Item>
                )
            }
            {type === 'admin' && (
                <>
                    <Menu.Item style={{ marginTop: 7 }} key={`/${type}/clients`}>
                        <MenuLink to={`/${type}/clients`}>
                            Клиенты
                        </MenuLink>
                    </Menu.Item>
                </>
            )}
            <Menu.Item key={`/${type}/promocodes`}>
                <MenuLink to={`/${type}/promocodes`}>
                    Промокоды
                </MenuLink>
            </Menu.Item>
            <Menu.Item style={{ marginTop: 7 }} key={`/${type}/orders`}>
                <MenuLink to={`/${type}/orders`}>
                    Заказы
                </MenuLink>
            </Menu.Item>
        </Menu>
    )
}

const MenuLink = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    a {
        color: white;
    }
`

export default MenuComponent
