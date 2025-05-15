'use client'
import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, ConfigProvider, theme } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { useToken } = theme;

const items1 = ['1', '2', '3'].map(key => ({
  key,
  label: `nav ${key}`,
}));

const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: Array.from({ length: 4 }).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

const App = () => {
  const { token } = useToken();
  const { colorBgContainer, borderRadiusLG } = token;

  return (
    <ConfigProvider>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="demo-logo" />
          {/*<Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items1}
            style={{ flex: 1, minWidth: 0 }}
          />*/}
        </Header>
        <div style={{ padding: '0 48px' }}>
 
          <Layout
            style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
          >
            <Sider style={{ background: colorBgContainer }} width={200}>
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%' }}
                items={items2}
              />
            </Sider>
            <Content style={{ padding: '0 24px', minHeight: window }}>Content</Content>
          </Layout>
        </div>
        <Footer style={{ textAlign: 'center' }}>
          Dellsony ©{new Date().getFullYear()} Created for UPVIEW test
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;