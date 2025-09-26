import { Inter } from "next/font/google";
import "./globals.css"; // Make sure you have this file for Tailwind CSS
import { AuthProvider } from "@/context/AuthContext";
import AppSidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduPlanner - College Savings",
  description: "Your personal guide to college savings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppSidebar>{children}</AppSidebar>
        </AuthProvider>
      </body>
    </html>
  );
}
