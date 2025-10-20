// src/components/TaskList.tsx

import React, { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Input, Modal, Form, Typography, List, Space } from 'antd';
import { Task, TaskExecution } from '../types';
import { getTasks, getTaskByName, createTask, deleteTask, executeTask, TaskPayload } from '../api';

const { Search } = Input;
const { Title, Text } = Typography;

const TaskList: React.FC = () => {
    // State management
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
    const [viewingExecutions, setViewingExecutions] = useState<TaskExecution[] | null>(null);
    const [form] = Form.useForm();

    // Fetch all tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async (name?: string) => {
        setLoading(true);
        try {
            const response = name ? await getTaskByName(name) : await getTasks();
            setTasks(response.data);
        } catch (error) {
            message.error('Failed to fetch tasks');
            // If a search fails, show an empty list
            if (name) setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for CRUD operations
    const handleSearch = (value: string) => {
        if (value) {
            fetchTasks(value);
        } else {
            fetchTasks(); // Fetch all if search is cleared
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
            message.success('Task deleted successfully');
            fetchTasks(); // Refresh list
        } catch (error) {
            message.error('Failed to delete task');
        }
    };

    const handleExecute = async (id: string) => {
        setExecutingTaskId(id);
        try {
            await executeTask(id);
            message.success('Task execution started');
            fetchTasks(); // Refresh list to show new execution data
        } catch (error) {
            message.error('Failed to execute task');
        } finally {
            setExecutingTaskId(null);
        }
    };

    const handleFormSubmit = async (values: TaskPayload) => {
        try {
            // We need a unique ID for new tasks. A simple timestamp-based one works for this example.
            const payload = { ...values, id: Math.random().toString(36).substr(2, 9) };
            await createTask(payload);
            message.success('Task created successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchTasks(); // Refresh list
        } catch (error) {
            message.error('Failed to create task');
        }
    };

    // Define columns for the Ant Design Table
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Owner', dataIndex: 'owner', key: 'owner' },
        { title: 'Command', dataIndex: 'command', key: 'command' },
        {
            title: 'Executions',
            key: 'executions',
            render: (_: any, record: Task) => (
                <Button onClick={() => setViewingExecutions(record.taskExecutions)}>
                    View ({record.taskExecutions?.length || 0})
                </Button>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Task) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => handleExecute(record.id)}
                        loading={executingTaskId === record.id}
                    >
                        Run
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this task?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Search tasks by name"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                    Create Task
                </Button>
            </div>

            <Table rowKey="id" columns={columns} dataSource={tasks} loading={loading} />

            {/* Modal for Creating a New Task */}
            <Modal
                title="Create New Task"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="name" label="Task Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="command" label="Command" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Viewing Executions */}
            <Modal
                title="Command Output"
                open={!!viewingExecutions}
                onCancel={() => setViewingExecutions(null)}
                footer={[
                    <Button key="back" onClick={() => setViewingExecutions(null)}>
                        Close
                    </Button>,
                ]}
            >
                {viewingExecutions && viewingExecutions.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={viewingExecutions}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={`Execution ${index + 1}`}
                                    description={
                                        <>
                                            <Text strong>Start Time:</Text> {new Date(item.startTime).toLocaleString()} <br />
                                            <Text strong>End Time:</Text> {new Date(item.endTime).toLocaleString()} <br />
                                            <Text strong>Output:</Text>
                                            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                {item.output}
                                            </pre>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text>No executions found for this task.</Text>
                )}
            </Modal>
        </div>
    );
};

export default TaskList;