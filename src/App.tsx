// src/App.tsx
import { Layout, Typography } from 'antd';
import './App.css';
import TaskList from './components/TaskList'; // <-- 1. Import the component

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>Kaiburr Task Manager</Title>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <TaskList /> {/* <-- 2. Use the component here instead of the paragraph */}
        </div>
      </Content>
    </Layout>
  );
}

export default App;