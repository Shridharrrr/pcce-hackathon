import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppSidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({ children }) {
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


