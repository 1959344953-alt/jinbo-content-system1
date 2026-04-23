import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import FormPage from "@/pages/FormPage";
import AdminPage from "@/pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/form" element={<FormPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
