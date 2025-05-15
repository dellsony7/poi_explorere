'use client'
import { Button, Form, Input, message } from 'antd'
import { signIn } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [form] = Form.useForm()
  
  const handleSubmit = async (values) => {
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (error) {
      message.error(error.message)
    }
  }
  
  return (
    <div className="auth-container">
      <h1>Login</h1>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form.Item>
      </Form>
      <p>Don't have an account? <Link href="/signup">Sign up</Link></p>
    </div>
  )
}