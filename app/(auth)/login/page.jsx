'use client'
import { useEffect } from 'react'
import { Button, Form, Input, message } from 'antd'
import { signIn } from '@/lib/auth'
import Link from 'next/link'
import { devBypassAuth } from '@/lib/auth';

export default function LoginPage() {
  const [form] = Form.useForm()
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const devLogin = async () => {
        try {
          await devBypassAuth();
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Dev login failed:', error);
        }
      };
      
      // Add a 2-second delay to see the login page briefly
      const timer = setTimeout(devLogin, 2000);
      return () => clearTimeout(timer);
    }
  }, []);
  
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