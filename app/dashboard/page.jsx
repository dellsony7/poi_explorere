"use client";
import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { initDB, syncLocalPOIs, exportPOIsToJSON } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import MapComponent from "./components/MapComponent";
import POIList from "./components/POIList";
import SearchBar from "./components/SearchBar";
import DistanceCalculator from "./components/DistanceCalculator";
import {
	Button,
	Layout,
	Menu,
	message,
	Radio,
	Space,
	Modal,
	Row,
	Col,
	Typography,
	Divider,
} from "antd";
import {
	ExportOutlined,
	HistoryOutlined,
	BulbOutlined,
} from "@ant-design/icons";
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Dashboard() {
	const [user, setUser] = useState(null);
	const [pois, setPois] = useState([]);
	const [selectedPOIs, setSelectedPOIs] = useState([]);
	const [isOnline, setIsOnline] = useState(
		typeof window !== "undefined" ? navigator.onLine : true
	);
	const [loading, setLoading] = useState(true);
	const [mapTheme, setMapTheme] = useState("light");
	const [searchHistory, setSearchHistory] = useState([]);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [isExportModalVisible, setIsExportModalVisible] = useState(false);
	const [exportFormat, setExportFormat] = useState("json");

	useEffect(() => {
		const checkAuth = async () => {
			try {
				setLoading(true);
				const user = await getCurrentUser();

				if (!user) {
					if (!hasRedirected.current) {
						hasRedirected.current = true;
						message.warning("Please login to continue");
						window.location.href = "/login";
					}
					return;
				}

				setUser(user);
				await initDB();

				if (isOnline) {
					try {
						await syncLocalPOIs(user.id);
						const db = await initDB();
						const { rows } = await db.query(
							"SELECT * FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
							[user.id]
						);
						setSearchHistory(rows);
					} catch (syncError) {
						console.error("Sync error:", syncError);
						message.warning(
							"Offline data sync failed - working with local data"
						);
					}
				}

				await loadPOIs(user.id);

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							setCurrentLocation({
								lat: position.coords.latitude,
								lng: position.coords.longitude,
							});
						},
						(error) => {
							console.error("Geolocation error:", error);
							message.warning("Could not determine your current location");
						}
					);
				}
			} catch (error) {
				console.error("Auth error:", error);
				message.error("Authentication check failed");
				if (!hasRedirected.current) {
					hasRedirected.current = true;
					window.location.href = "/login";
				}
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [isOnline]);

	// Load POIs base on online or offline status
	const loadPOIs = async (userId) => {
		try {
			if (isOnline) {
				const { data, error } = await supabase
					.from("pois")
					.select("*")
					.eq("user_id", userId)
					.order("created_at", { ascending: false });

				if (error) throw error;
				setPois(data || []);
			} else {
				const db = await initDB();
				const { rows } = await db.query(
					"SELECT * FROM pois WHERE user_id = $1 ORDER BY created_at DESC",
					[userId]
				);
				setPois(rows || []);
			}
		} catch (error) {
			console.error("Failed to load POIs:", error);
			message.error("Failed to load points of interest");
		}
	};

	// Handle POI selection (supports multi-select for distance calculation)
	const handlePOISelected = (poi) => {
		setSelectedPOIs((prev) => {
			if (prev.some((p) => p.id === poi.id)) {
				return prev.filter((p) => p.id !== poi.id);
			} else if (prev.length < 2) {
				return [...prev, poi];
			} else {
				message.info("Select up to 2 POIs for distance calculation");
				return [prev[1], poi]; // Keep the last selected and add new one
			}
		});
	};

	// Add new POI to state and database
	const handlePOIAdded = async (newPOI) => {
		try {
			setPois((prev) => [newPOI, ...prev]);

			// Add to search history if not already there
			const db = await initDB();
			const { rows } = await db.query(
				"SELECT * FROM search_history WHERE user_id = $1 AND query = $2",
				[newPOI.user_id, newPOI.name]
			);

			if (rows.length === 0) {
				await db.query(
					"INSERT INTO search_history (id, user_id, query, created_at) VALUES ($1, $2, $3, NOW())",
					[crypto.randomUUID(), newPOI.user_id, newPOI.name]
				);
				setSearchHistory((prev) => [
					{ query: newPOI.name },
					...prev.slice(0, 9),
				]);
			}
		} catch (error) {
			console.error("Failed to update search history:", error);
		}
	};

	// Handle logout
	const handleSignOut = async () => {
		try {
			await signOut();
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout error:", error);
			message.error("Failed to logout");
		}
	};

	// Export POIs to file
	const handleExport = async () => {
		try {
			if (exportFormat === "json") {
				await exportPOIsToJSON(user.id);
			} else {
				// Could add CSV export here
				message.info("CSV export coming soon!");
			}
			setIsExportModalVisible(false);
			message.success(`POIs exported as ${exportFormat.toUpperCase()}`);
		} catch (error) {
			console.error("Export failed:", error);
			message.error("Failed to export POIs");
		}
	};

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<div>Loading dashboard...</div>
			</div>
		);
	}

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Header
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 24px",
				}}
			>
				<Title level={4} style={{ color: "white", margin: 0 }}>
					POI Explorer
				</Title>
				<Space>
					<Button
						icon={<BulbOutlined />}
						onClick={() =>
							setMapTheme((prev) => (prev === "light" ? "dark" : "light"))
						}
					>
						{mapTheme === "light" ? "Dark" : "Light"} Map
					</Button>
					<Button
						icon={<ExportOutlined />}
						onClick={() => setIsExportModalVisible(true)}
					>
						Export
					</Button>
					<Button danger onClick={handleSignOut}>
						Logout
					</Button>
				</Space>
			</Header>
			<Layout>
				{/*<Sider width={350} style={{ background: '#fff', padding: '16px' }}>*/}
				<Sider
					breakpoint="lg"
					collapsedWidth="0"
					width={350}
					style={{
						background: "#fff",
						padding: "16px",
						overflowY: "auto",
						height: "calc(100vh - 64px)",
						minWidth: 250,
						maxWidth: 500,
					}}
				>
					<SearchBar
						onPOIAdded={handlePOIAdded}
						searchHistory={searchHistory}
						currentLocation={currentLocation}
					/>

					<Divider orientation="left" style={{ margin: "16px 0" }}>
						POI List
					</Divider>

					<POIList
						pois={pois}
						selectedPOIs={selectedPOIs}
						onPOISelected={handlePOISelected}
						currentLocation={currentLocation}
					/>

					{selectedPOIs.length === 2 && (
						<>
							<Divider orientation="left" style={{ margin: "16px 0" }}>
								Distance
							</Divider>
							<DistanceCalculator
								poi1={selectedPOIs[0]}
								poi2={selectedPOIs[1]}
							/>
						</>
					)}
				</Sider>
				<Content style={{ padding: 0 }}>
					<MapComponent
						pois={pois}
						selectedPOIs={selectedPOIs}
						onPOISelected={handlePOISelected}
						theme={mapTheme}
						currentLocation={currentLocation}
					/>
				</Content>
			</Layout>

			{/* Export Modal */}
			<Modal
				title="Export POIs"
				visible={isExportModalVisible}
				onOk={handleExport}
				onCancel={() => setIsExportModalVisible(false)}
			>
				<Radio.Group
					onChange={(e) => setExportFormat(e.target.value)}
					value={exportFormat}
				>
					<Radio value="json">JSON</Radio>
					<Radio value="csv">CSV</Radio>
				</Radio.Group>
			</Modal>
		</Layout>
	);
}
