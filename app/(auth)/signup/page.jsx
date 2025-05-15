"use client";
import { Button, Form, Input, message } from "antd";
import { signUp } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { initDB } from "@/lib/database";

export default function SignupPage() {
	const [form] = Form.useForm();
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const user = await getCurrentUser();
			if (user) router.push("/dashboard");
		};
		checkAuth();
	}, [router]);

	const handleSubmit = async (values) => {
		try {
			// 1. First try Supabase signup
			const { data, error } = await signUp(values.email, values.password);
			if (error) throw error;

			// 2. Then setup local DB (critical for offline support)
			const db = await initDB();

			// 3. Store user in local DB (essential for offline functionality)
			await db.query("INSERT INTO users (id, email) VALUES ($1, $2)", [
				data.user.id,
				data.user.email,
			]);

			// 4. Redirect to dashboard (hard refresh to ensure auth state loads)
			window.location.href = "/dashboard";
		} catch (error) {
			message.error(
				error.message.includes("User already registered")
					? "Email already in use. Please log in instead."
					: "Signup failed. Please try again."
			);
		}
	};

	return (
		<div
			className="auth-container"
			style={{
				maxWidth: "400px",
				margin: "0 auto",
				padding: "2rem",
				boxShadow: "0 0 10px rgba(0,0,0,0.1)",
				borderRadius: "8px",
				marginTop: "5rem",
			}}
		>
			<h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Sign Up</h1>
			<Form form={form} onFinish={handleSubmit}>
				<Form.Item
					name="email"
					rules={[
						{ required: true, message: "Please input your email!" },
						{ type: "email", message: "Please enter a valid email!" },
					]}
				>
					<Input placeholder="Email" />
				</Form.Item>

				<Form.Item
					name="password"
					rules={[
						{ required: true, message: "Please input your password!" },
						{ min: 6, message: "Password must be at least 6 characters!" },
					]}
					hasFeedback
				>
					<Input.Password placeholder="Password" />
				</Form.Item>

				<Form.Item
					name="confirm"
					dependencies={["password"]}
					hasFeedback
					rules={[
						{ required: true, message: "Please confirm your password!" },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue("password") === value) {
									return Promise.resolve();
								}
								return Promise.reject(
									new Error("The two passwords do not match!")
								);
							},
						}),
					]}
				>
					<Input.Password placeholder="Confirm Password" />
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						block
						style={{ marginTop: "1rem" }}
					>
						Sign Up
					</Button>
				</Form.Item>
			</Form>

			<div style={{ textAlign: "center", marginTop: "1rem" }}>
				<span>Already have an account? </span>
				<Link href="/login" style={{ color: "#1677ff" }}>
					Login
				</Link>
			</div>
		</div>
	);
}
