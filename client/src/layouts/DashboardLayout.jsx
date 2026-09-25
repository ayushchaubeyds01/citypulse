import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1600px]">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;