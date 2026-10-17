import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";
import { useFeatures } from "../context/FeaturesContext";

export default function UserLayout() {
  const { features } = useFeatures();
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container main"><Outlet /></main>
      <Footer />
      {features.ai && <ChatbotWidget />}
    </div>
  );
}
