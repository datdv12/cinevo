import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

export default function UserLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container main"><Outlet /></main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
