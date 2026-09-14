import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Wallet, FileBarChart,
  Users, Settings, LogOut, Search, Plus, Minus, Trash2, Wifi, WifiOff,
  Printer, X, Check, AlertTriangle, Clock, ChevronRight, Menu, Store,
  ArrowDownCircle, ArrowUpCircle, RefreshCw, ShieldAlert, Lock, Barcode,
  ChevronDown, Ban, CheckCircle2, CircleDot, Truck, ClipboardList, RotateCcw,
  Contact, Gift, Wallet2, PackageCheck, ArrowLeftRight, Building2, MessageCircle,
} from "lucide-react";

/* ----------------------------- helpers ----------------------------- */

const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const fmtRp = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

const todayStr = () => new Date().toISOString().slice(0, 10);

const dateStr = (d) => new Date(d).toISOString().slice(0, 10);

const nowStr = () => new Date().toLocaleString("id-ID", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});

const ROLES = ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"];

const ROLE_LABEL = {
  OWNER: "Owner", ADMIN: "Admin", SUPERVISOR: "Supervisor", KASIR: "Kasir",
};

const MENU = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"] },
  { id: "kasir", label: "Kasir", icon: ShoppingCart, roles: ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"] },
  { id: "produk", label: "Produk", icon: Package, roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { id: "stok", label: "Inventory", icon: Boxes, roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { id: "transfer", label: "Transfer Stok", icon: ArrowLeftRight, roles: ["OWNER", "ADMIN"] },
  { id: "pelanggan", label: "Customer", icon: Contact, roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { id: "supplier", label: "Supplier", icon: Truck, roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { id: "pembelian", label: "Pembelian", icon: ClipboardList, roles: ["OWNER", "ADMIN", "SUPERVISOR"] },
  { id: "kas", label: "Kas & Shift", icon: Wallet, roles: ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"] },
  { id: "retur", label: "Retur", icon: RotateCcw, roles: ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"] },
  { id: "laporan", label: "Laporan", icon: FileBarChart, roles: ["OWNER", "ADMIN", "SUPERVISOR", "KASIR"] },
  { id: "user", label: "User", icon: Users, roles: ["OWNER", "ADMIN"] },
  { id: "pengaturan", label: "Pengaturan", icon: Settings, roles: ["OWNER"] },
];

function seedData() {
  const categories = [
    { id: "c1", name: "Minuman" },
    { id: "c2", name: "Makanan" },
    { id: "c3", name: "Sembako" },
    { id: "c4", name: "Snack" },
  ];
  const stores = [
    { id: "st1", name: "Toko Pusat", address: "Jl. Contoh No. 10", phone: "0812-3456-7890" },
    { id: "st2", name: "Toko Cabang Selatan", address: "Jl. Merdeka No. 22", phone: "0813-9988-7766" },
  ];
  const products = [
    { id: "p1", sku: "KOP-001", barcode: "8991001", name: "Kopi Hitam", categoryId: "c1", unit: "cup", buyPrice: 4000, sellPrice: 10000, stock: { st1: 28, st2: 12 }, minStock: 10, active: true },
    { id: "p2", sku: "KOP-002", barcode: "8991002", name: "Kopi Susu", categoryId: "c1", unit: "cup", buyPrice: 5000, sellPrice: 13000, stock: { st1: 25, st2: 10 }, minStock: 10, active: true },
    { id: "p3", sku: "TEH-001", barcode: "8991003", name: "Teh Manis", categoryId: "c1", unit: "gelas", buyPrice: 2000, sellPrice: 6000, stock: { st1: 35, st2: 15 }, minStock: 15, active: true },
    { id: "p4", sku: "AIR-001", barcode: "8991004", name: "Air Mineral 600ml", categoryId: "c1", unit: "botol", buyPrice: 2500, sellPrice: 5000, stock: { st1: 40, st2: 20 }, minStock: 20, active: true },
    { id: "p5", sku: "ROT-001", barcode: "8991005", name: "Roti Tawar", categoryId: "c2", unit: "bks", buyPrice: 9000, sellPrice: 15000, stock: { st1: 12, st2: 6 }, minStock: 8, active: true },
    { id: "p6", sku: "ROT-002", barcode: "8991006", name: "Roti Coklat", categoryId: "c2", unit: "pcs", buyPrice: 3000, sellPrice: 6000, stock: { st1: 5, st2: 3 }, minStock: 10, active: true },
    { id: "p7", sku: "SNK-001", barcode: "8991007", name: "Keripik Singkong", categoryId: "c4", unit: "bks", buyPrice: 4500, sellPrice: 8000, stock: { st1: 17, st2: 8 }, minStock: 10, active: true },
    { id: "p8", sku: "SNK-002", barcode: "8991008", name: "Biskuit Kaleng", categoryId: "c4", unit: "kaleng", buyPrice: 12000, sellPrice: 18000, stock: { st1: 8, st2: 4 }, minStock: 5, active: true },
    { id: "p9", sku: "SMB-001", barcode: "8991009", name: "Gula Pasir 1kg", categoryId: "c3", unit: "kg", buyPrice: 13000, sellPrice: 16000, stock: { st1: 20, st2: 10 }, minStock: 10, active: true },
    { id: "p10", sku: "SMB-002", barcode: "8991010", name: "Beras 5kg", categoryId: "c3", unit: "karung", buyPrice: 62000, sellPrice: 72000, stock: { st1: 9, st2: 5 }, minStock: 5, active: true },
    { id: "p11", sku: "SMB-003", barcode: "8991011", name: "Minyak Goreng 1L", categoryId: "c3", unit: "botol", buyPrice: 15000, sellPrice: 19000, stock: { st1: 15, st2: 7 }, minStock: 8, active: true },
  ];
  const stockMovements = products.flatMap((p) => stores.map((s) => ({
    id: uid("mv"), date: todayStr(), productId: p.id, storeId: s.id, type: "STOCK_IN",
    qtyIn: p.stock[s.id] || 0, qtyOut: 0, note: "Stok awal", user: "system", trxRef: null,
  })));
  const users = [
    { username: "owner", password: "owner123", role: "OWNER", name: "Budi Santoso", storeId: null },
    { username: "admin", password: "admin123", role: "ADMIN", name: "Sari Admin", storeId: null },
    { username: "supervisor", password: "super123", role: "SUPERVISOR", name: "Dedi Supervisor", storeId: "st1" },
    { username: "kasir", password: "kasir123", role: "KASIR", name: "Rahmat Kasir", pin: "1234", storeId: "st1" },
  ];
  const settings = {
    storeName: "Toko Berkah", address: "Jl. Contoh No. 10", phone: "0812-3456-7890",
    footer: "Terima kasih atas kunjungan Anda", currency: "Rp", taxPercent: 0, trxPrefix: "TRX",
  };
  const customers = [
    { id: "cu1", name: "Ibu Ani", phone: "0813-1111-2222", address: "Jl. Melati No. 5", points: 0, totalTransaksi: 0, totalPembelian: 0, piutang: 0 },
  ];
  const suppliers = [
    { id: "sp1", name: "CV Sumber Makmur", phone: "021-555-1230", address: "Jl. Industri No. 8", contactPerson: "Pak Joko" },
  ];
  return {
    categories, products, stockMovements, users, settings, customers, suppliers, stores,
    transactions: [], cashMovements: [], shifts: [], purchaseOrders: [], returns: [], stockTransfers: [],
  };
}

function getStock(product, storeId) {
  if (!product || !product.stock) return 0;
  if (!storeId) return Object.values(product.stock).reduce((a, b) => a + b, 0);
  return product.stock[storeId] || 0;
}

function adjustStock(product, storeId, delta) {
  return { ...product, stock: { ...product.stock, [storeId]: (product.stock[storeId] || 0) + delta } };
}

const STORAGE_KEY = "kasirku-state-v1";

export default function App() {
  const [data, setData] = useState(seedData());
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [view, setView] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const syncTimers = useRef([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        /* first run, no saved state yet */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
      } catch (e) {
        /* best effort */
      }
    }, 60);
    function flushNow() {
      clearTimeout(t);
      try { window.storage.set(STORAGE_KEY, JSON.stringify(data), false); } catch (e) { /* best effort */ }
    }
    window.addEventListener("beforeunload", flushNow);
    window.addEventListener("pagehide", flushNow);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeunload", flushNow);
      window.removeEventListener("pagehide", flushNow);
    };
  }, [data, loaded]);

  function showToast(msg, kind = "info") {
    setToast({ msg, kind, id: uid("t") });
    setTimeout(() => setToast((t) => (t && t.msg === msg ? null : t)), 3200);
  }

  // sync pending transactions when coming back online
  useEffect(() => {
    if (!isOnline) return;
    const pending = data.transactions.filter((t) => t.status === "PENDING");
    if (pending.length === 0) return;
    pending.forEach((trx, i) => {
      const t1 = setTimeout(() => {
        setData((d) => ({
          ...d,
          transactions: d.transactions.map((x) => (x.id === trx.id ? { ...x, status: "SYNCING" } : x)),
        }));
      }, 300 + i * 500);
      const t2 = setTimeout(() => {
        setData((d) => ({
          ...d,
          transactions: d.transactions.map((x) => (x.id === trx.id ? { ...x, status: "SYNCED" } : x)),
        }));
      }, 900 + i * 500);
      syncTimers.current.push(t1, t2);
    });
    return () => { syncTimers.current.forEach(clearTimeout); syncTimers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  function login(username, password) {
    const u = data.users.find((x) => x.username === username && x.password === password);
    if (!u) return false;
    setSession(u);
    setView("dashboard");
    setStoreId(u.storeId || data.stores[0]?.id || null);
    return true;
  }

  function logout() {
    setSession(null);
  }

  const pendingCount = data.transactions.filter((t) => t.status === "PENDING" || t.status === "SYNCING").length;

  const currentShift = useMemo(() => {
    if (!session) return null;
    return data.shifts.find((s) => s.cashier === session.username && s.status === "OPEN") || null;
  }, [data.shifts, session]);

  if (!loaded) {
    return (
      <div style={{ minHeight: 520, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--muted)", fontFamily: "var(--font-ui)" }}>Memuat KasirKU...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-ui)", background: "var(--bg)", color: "var(--ink)", minHeight: 640 }}>
      <style>{GLOBAL_CSS}</style>
      {!session ? (
        <LoginScreen users={data.users} onLogin={login} storeName={data.settings.storeName} />
      ) : (
        <Shell
          session={session}
          view={view}
          setView={setView}
          logout={logout}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          pendingCount={pendingCount}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          data={data}
          setData={setData}
          currentShift={currentShift}
          showToast={showToast}
          storeId={storeId}
          setStoreId={setStoreId}
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.kind}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{
  --primary:#0E7C50; --primary-dark:#0A5E3C; --primary-light:#E6F3EC;
  --accent:#F2A93B; --accent-dark:#B9760E;
  --bg:#F5F7F4; --card:#FFFFFF; --ink:#16231D; --muted:#66756D;
  --border:#E3E8E2; --danger:#D14343; --danger-bg:#FBEAEA;
  --success:#1D9E75; --font-ui:'Inter',sans-serif; --font-display:'Sora',sans-serif; --font-mono:'JetBrains Mono',monospace;
}
*{box-sizing:border-box;}
button{font-family:inherit;cursor:pointer;}
input,select,textarea{font-family:inherit;}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:#D5DBD3;border-radius:8px;}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.18);}
.toast-error{background:var(--danger);}
.toast-success{background:var(--primary-dark);}
.btn{border-radius:10px;padding:9px 16px;font-size:13.5px;font-weight:600;border:1px solid transparent;display:inline-flex;align-items:center;gap:6px;transition:filter .12s,transform .05s;}
.btn:active{transform:scale(.98);}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{filter:brightness(1.06);}
.btn-outline{background:#fff;border-color:var(--border);color:var(--ink);}
.btn-outline:hover{border-color:var(--primary);color:var(--primary);}
.btn-danger{background:var(--danger-bg);color:var(--danger);}
.btn-ghost{background:transparent;color:var(--muted);}
.btn-ghost:hover{background:#EEF1EC;}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;}
.input{width:100%;border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:13.5px;background:#fff;color:var(--ink);}
.input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light);}
.label{font-size:12px;font-weight:600;color:var(--muted);margin-bottom:5px;display:block;}
table.tbl{width:100%;border-collapse:collapse;font-size:13px;}
table.tbl th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.02em;color:var(--muted);font-weight:700;padding:9px 12px;border-bottom:1.5px solid var(--border);white-space:nowrap;}
table.tbl td{padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;}
table.tbl tr:last-child td{border-bottom:none;}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;}
@media print {
  body * { visibility: hidden; }
  .receipt-print, .receipt-print * { visibility: visible; }
  .receipt-print { position: fixed; top:0; left:0; width:100%; }
}
`;

/* ----------------------------- Login ----------------------------- */

function LoginScreen({ users, onLogin, storeName }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!username || !password) { setErr("Isi username dan password."); return; }
    const ok = onLogin(username.trim(), password);
    if (!ok) setErr("Username atau password salah.");
  }

  return (
    <div style={{ minHeight: 640, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ display: "flex", width: "100%", maxWidth: 860, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(14,124,80,.14)" }}>
        <div style={{ flex: 1, background: "linear-gradient(160deg,var(--primary-dark),var(--primary))", color: "#fff", padding: "44px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 280 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={21} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>KasirKU</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, lineHeight: 1.35, marginTop: 38, fontWeight: 600 }}>
              Internet boleh mati,<br />transaksi tetap jalan.
            </h1>
            <p style={{ opacity: .85, fontSize: 14, marginTop: 14, lineHeight: 1.6 }}>
              POS offline-first untuk {storeName}. Transaksi tersimpan lokal dan otomatis tersinkron saat koneksi kembali.
            </p>
          </div>
          <div style={{ fontSize: 12, opacity: .7 }}>Demo akun: owner/admin/supervisor/kasir — password [role]123</div>
        </div>
        <form onSubmit={submit} className="card" style={{ flex: 1, border: "none", borderRadius: 0, padding: "44px 36px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 300 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 4 }}>Masuk</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Masuk untuk mulai bertransaksi.</p>
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="owner / admin / supervisor / kasir" style={{ marginBottom: 14 }} />
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" style={{ marginBottom: 6 }} />
          {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 8 }}>{err}</div>}
          <button type="submit" className="btn btn-primary" style={{ marginTop: 20, justifyContent: "center" }}>
            <Lock size={15} /> Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- Shell ----------------------------- */

function Shell(props) {
  const { session, view, setView, logout, isOnline, setIsOnline, pendingCount, sidebarOpen, setSidebarOpen, data, setData, currentShift, showToast, storeId, setStoreId } = props;
  const visibleMenu = MENU.filter((m) => m.roles.includes(session.role));
  const canSwitchStore = !session.storeId; // OWNER/ADMIN only
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";

  return (
    <div style={{ display: "flex", minHeight: 640 }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-only-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 30 }} />
      )}
      <aside style={{
        width: 224, background: "var(--card)", borderRight: "1px solid var(--border)",
        position: sidebarOpen ? "fixed" : "static", top: 0, left: sidebarOpen ? 0 : undefined,
        bottom: 0, zIndex: 31, transform: sidebarOpen ? "translateX(0)" : undefined,
        display: sidebarOpen ? "flex" : "none", flexDirection: "column",
      }} className="sidebar-desktop">
        <SidebarInner visibleMenu={visibleMenu} view={view} setView={(v) => { setView(v); setSidebarOpen(false); }} session={session} />
      </aside>
      <style>{`
        @media (min-width: 900px) {
          .sidebar-desktop { display: flex !important; position: static !important; transform: none !important; }
          .mobile-only-backdrop, .mobile-only-btn { display: none !important; }
        }
      `}</style>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar
          session={session} logout={logout} isOnline={isOnline} setIsOnline={setIsOnline}
          pendingCount={pendingCount} onMenuClick={() => setSidebarOpen(true)}
          currentView={view} currentShift={currentShift}
          stores={data.stores} storeId={storeId} setStoreId={setStoreId} canSwitchStore={canSwitchStore}
        />
        <main style={{ flex: 1, padding: "20px 22px 40px", overflowX: "hidden" }}>
          {view === "dashboard" && <DashboardView data={data} session={session} storeId={storeId} canSwitchStore={canSwitchStore} />}
          {view === "kasir" && <PosView data={data} setData={setData} session={session} isOnline={isOnline} currentShift={currentShift} showToast={showToast} setView={setView} storeId={storeId} />}
          {view === "produk" && <ProdukView data={data} setData={setData} showToast={showToast} storeId={storeId} canSwitchStore={canSwitchStore} />}
          {view === "stok" && <StokView data={data} setData={setData} session={session} showToast={showToast} storeId={storeId} canSwitchStore={canSwitchStore} />}
          {view === "transfer" && <TransferView data={data} setData={setData} session={session} showToast={showToast} storeId={storeId} />}
          {view === "pelanggan" && <PelangganView data={data} setData={setData} showToast={showToast} />}
          {view === "supplier" && <SupplierView data={data} setData={setData} showToast={showToast} />}
          {view === "pembelian" && <PembelianView data={data} setData={setData} session={session} showToast={showToast} storeId={storeId} />}
          {view === "kas" && <KasShiftView data={data} setData={setData} session={session} currentShift={currentShift} showToast={showToast} storeId={storeId} />}
          {view === "retur" && <ReturView data={data} setData={setData} session={session} showToast={showToast} storeId={storeId} />}
          {view === "laporan" && <LaporanView data={data} session={session} setData={setData} showToast={showToast} storeId={storeId} canSwitchStore={canSwitchStore} />}
          {view === "user" && <UserView data={data} setData={setData} showToast={showToast} session={session} />}
          {view === "pengaturan" && <PengaturanView data={data} setData={setData} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

function SidebarInner({ visibleMenu, view, setView, session }) {
  return (
    <>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Store size={17} color="#fff" />
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16.5, color: "var(--ink)" }}>KasirKU</span>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        {visibleMenu.map((m) => {
          const Icon = m.icon;
          const active = view === m.id;
          return (
            <button key={m.id} onClick={() => setView(m.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, marginBottom: 3, background: active ? "var(--primary-light)" : "transparent",
              color: active ? "var(--primary-dark)" : "var(--ink)", fontWeight: active ? 700 : 500,
              fontSize: 13.5, border: "none", textAlign: "left",
            }}>
              <Icon size={17} />
              {m.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 14, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted)" }}>
        Masuk sebagai <b style={{ color: "var(--ink)" }}>{ROLE_LABEL[session.role]}</b>
      </div>
    </>
  );
}

function Topbar({ session, logout, isOnline, setIsOnline, pendingCount, onMenuClick, currentView, currentShift, stores, storeId, setStoreId, canSwitchStore }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = MENU.find((m) => m.id === currentView)?.label || "";
  return (
    <header style={{
      height: 60, borderBottom: "1px solid var(--border)", background: "var(--card)",
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button className="btn btn-ghost mobile-only-btn" onClick={onMenuClick} style={{ display: "inline-flex", padding: 8 }}>
          <Menu size={18} />
        </button>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{title}</span>
        {currentShift && (
          <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}>
            <CircleDot size={11} /> Shift Aktif
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {canSwitchStore ? (
          <div style={{ position: "relative" }}>
            <Building2 size={14} style={{ position: "absolute", left: 9, top: 9, color: "var(--muted)", pointerEvents: "none" }} />
            <select className="input" value={storeId || ""} onChange={(e) => setStoreId(e.target.value)} style={{ paddingLeft: 28, fontSize: 12.5, fontWeight: 600, width: "auto" }}>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        ) : (
          <span className="badge" style={{ background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <Building2 size={11} /> {stores.find((s) => s.id === storeId)?.name || "-"}
          </span>
        )}
        <button
          onClick={() => setIsOnline((v) => !v)}
          className="btn"
          title="Simulasikan koneksi internet (demo)"
          style={{
            background: isOnline ? "var(--primary-light)" : "var(--danger-bg)",
            color: isOnline ? "var(--primary-dark)" : "var(--danger)",
          }}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? "Online" : "Offline"}
        </button>
        {pendingCount > 0 && (
          <span className="badge" style={{ background: "#FDF1DE", color: "var(--accent-dark)" }}>
            <RefreshCw size={11} className={isOnline ? "spin" : ""} /> {pendingCount} menunggu sync
          </span>
        )}
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((v) => !v)} className="btn btn-outline">
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {session.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</span>
            <ChevronDown size={13} />
          </button>
          {menuOpen && (
            <div className="card" style={{ position: "absolute", right: 0, top: 44, width: 190, padding: 6, zIndex: 40, boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
              <div style={{ padding: "8px 10px", fontSize: 12, color: "var(--muted)" }}>{ROLE_LABEL[session.role]}</div>
              <button onClick={logout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)" }}>
                <LogOut size={15} /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`.spin{animation:spin 1.4s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </header>
  );
}

/* ----------------------------- Dashboard ----------------------------- */

function DashboardView({ data, session, storeId, canSwitchStore }) {
  const [viewAll, setViewAll] = useState(false);
  const effectiveStoreId = canSwitchStore && viewAll ? null : storeId;
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";
  const today = todayStr();
  const salesToday = data.transactions.filter((t) => t.date === today && t.status !== "VOID" && (!effectiveStoreId || t.storeId === effectiveStoreId));
  const totalToday = salesToday.reduce((s, t) => s + t.total, 0);
  const itemsToday = salesToday.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);
  const grossProfitToday = salesToday.reduce((s, t) => s + t.items.reduce((a, i) => {
    const buyPrice = i.buyPriceAtSale != null ? i.buyPriceAtSale : (data.products.find((x) => x.id === i.productId)?.buyPrice || 0);
    return a + (i.price - buyPrice) * i.qty - (i.discount || 0);
  }, 0), 0);
  const cashInToday = data.cashMovements.filter((c) => c.date === today && c.type === "IN" && (!effectiveStoreId || c.storeId === effectiveStoreId)).reduce((s, c) => s + c.amount, 0);
  const cashOutToday = data.cashMovements.filter((c) => c.date === today && c.type === "OUT" && (!effectiveStoreId || c.storeId === effectiveStoreId)).reduce((s, c) => s + c.amount, 0);
  const lowStock = effectiveStoreId
    ? data.products.filter((p) => p.active && getStock(p, effectiveStoreId) <= p.minStock)
    : data.products.filter((p) => p.active && data.stores.some((s) => getStock(p, s.id) <= p.minStock));

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = dateStr(d);
      const total = data.transactions.filter((t) => t.date === ds && t.status !== "VOID" && (!effectiveStoreId || t.storeId === effectiveStoreId)).reduce((s, t) => s + t.total, 0);
      days.push({ label: d.toLocaleDateString("id-ID", { weekday: "short" }), total });
    }
    return days;
  }, [data.transactions, effectiveStoreId]);

  const storeComparison = useMemo(() => {
    if (!canSwitchStore || data.stores.length < 2) return [];
    return data.stores.map((s) => ({
      name: s.name,
      total: data.transactions.filter((t) => t.date === today && t.status !== "VOID" && t.storeId === s.id).reduce((sum, t) => sum + t.total, 0),
    }));
  }, [data.transactions, data.stores, canSwitchStore, today]);

  const catBreakdown = useMemo(() => {
    const map = {};
    salesToday.forEach((t) => t.items.forEach((i) => {
      const p = data.products.find((x) => x.id === i.productId);
      const cat = p ? (data.categories.find((c) => c.id === p.categoryId)?.name || "Lain") : "Lain";
      map[cat] = (map[cat] || 0) + i.subtotal;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [salesToday, data.products, data.categories]);

  const topProducts = useMemo(() => {
    const map = {};
    salesToday.forEach((t) => t.items.forEach((i) => {
      map[i.productId] = (map[i.productId] || 0) + i.qty;
    }));
    return Object.entries(map)
      .map(([pid, qty]) => ({ name: data.products.find((p) => p.id === pid)?.name || "?", qty }))
      .sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [salesToday, data.products]);

  const PIE_COLORS = ["#0E7C50", "#F2A93B", "#3C7DD9", "#D14343", "#8657C9"];

  const kpis = [
    { label: "Penjualan hari ini", value: fmtRp(totalToday) },
    { label: "Jumlah transaksi", value: salesToday.length },
    { label: "Produk terjual", value: itemsToday },
    { label: "Laba kotor", value: fmtRp(grossProfitToday) },
    { label: "Kas masuk", value: fmtRp(cashInToday) },
    { label: "Kas keluar", value: fmtRp(cashOutToday) },
  ];

  return (
    <div>
      {canSwitchStore && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <TabBtn active={!viewAll} onClick={() => setViewAll(false)} label={storeName} />
          {data.stores.length > 1 && <TabBtn active={viewAll} onClick={() => setViewAll(true)} label="Semua Toko" />}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginTop: 6, color: "var(--ink)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }} className="dash-grid">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Penjualan 7 hari terakhir</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1ED" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#66756D" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#66756D" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip formatter={(v) => fmtRp(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E3E8E2", fontSize: 12.5 }} />
              <Bar dataKey="total" fill="#0E7C50" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Penjualan per kategori (hari ini)</div>
          {catBreakdown.length === 0 ? (
            <EmptyHint text="Belum ada transaksi hari ini." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2}>
                  {catBreakdown.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtRp(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E3E8E2", fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {storeComparison.length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Perbandingan penjualan antar toko (hari ini)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={storeComparison} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1ED" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#66756D" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12.5, fill: "#16231D" }} axisLine={false} tickLine={false} width={130} />
              <Tooltip formatter={(v) => fmtRp(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E3E8E2", fontSize: 12.5 }} />
              <Bar dataKey="total" fill="#F2A93B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="dash-grid">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Produk terlaris hari ini</div>
          {topProducts.length === 0 ? <EmptyHint text="Belum ada penjualan." /> : (
            <div>
              {topProducts.map((p, i) => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < topProducts.length - 1 ? "1px solid var(--border)" : "none", fontSize: 13.5 }}>
                  <span>{i + 1}. {p.name}</span>
                  <span style={{ fontWeight: 700 }}>{p.qty} terjual</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={15} color="var(--accent-dark)" /> Stok menipis
          </div>
          {lowStock.length === 0 ? <EmptyHint text="Semua stok aman." /> : (
            <div>
              {lowStock.slice(0, 6).map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < Math.min(lowStock.length, 6) - 1 ? "1px solid var(--border)" : "none", fontSize: 13.5 }}>
                  <span>{p.name}</span>
                  <span style={{ fontWeight: 700, color: "var(--danger)" }}>{getStock(p, effectiveStoreId)} {p.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width:760px){.dash-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function EmptyHint({ text }) {
  return <div style={{ color: "var(--muted)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>{text}</div>;
}

/* ----------------------------- POS Kasir ----------------------------- */

function PosView({ data, setData, session, isOnline, currentShift, showToast, setView, storeId }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const barcodeRef = useRef(null);

  if (!currentShift) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 440, margin: "40px auto" }}>
        <Clock size={30} color="var(--accent-dark)" style={{ marginBottom: 10 }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Shift belum dibuka</div>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>
          Buka shift terlebih dahulu di menu Kas & Shift sebelum mulai bertransaksi.
        </p>
        <button className="btn btn-primary" onClick={() => setView("kas")}>Buka Shift</button>
      </div>
    );
  }

  const products = data.products.filter((p) => p.active && (catFilter === "all" || p.categoryId === catFilter)
    && (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)));

  function addToCart(p) {
    const stock = getStock(p, storeId);
    if (stock <= 0) { showToast(`${p.name} stok habis di toko ini`, "error"); return; }
    setCart((c) => {
      const ex = c.find((i) => i.productId === p.id);
      if (ex) {
        if (ex.qty + 1 > stock) { showToast(`Stok ${p.name} tidak cukup`, "error"); return c; }
        return c.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { productId: p.id, name: p.name, price: p.sellPrice, qty: 1, discount: 0, unit: p.unit, buyPriceAtSale: p.buyPrice }];
    });
  }

  function updateQty(pid, delta) {
    const prod = data.products.find((p) => p.id === pid);
    const stock = getStock(prod, storeId);
    setCart((c) => c.map((i) => {
      if (i.productId !== pid) return i;
      const newQty = i.qty + delta;
      if (newQty <= 0) return i;
      if (prod && newQty > stock) { showToast(`Stok ${prod.name} tidak cukup`, "error"); return i; }
      return { ...i, qty: newQty };
    }));
  }

  function removeItem(pid) {
    setCart((c) => c.filter((i) => i.productId !== pid));
  }

  function setItemDiscount(pid, val) {
    setCart((c) => c.map((i) => {
      if (i.productId !== pid) return i;
      const maxDiscount = i.price * i.qty;
      const d = Math.max(0, Math.min(maxDiscount, Number(val) || 0));
      return { ...i, discount: d };
    }));
  }

  function handleBarcodeEnter(e) {
    if (e.key !== "Enter") return;
    const val = e.target.value.trim();
    if (!val) return;
    const p = data.products.find((x) => x.active && (x.barcode === val || x.sku.toLowerCase() === val.toLowerCase()));
    if (p) { addToCart(p); showToast(`${p.name} ditambahkan`); } else { showToast("Produk tidak ditemukan", "error"); }
    e.target.value = "";
  }

  const subtotal = cart.reduce((s, i) => s + Math.max(0, i.price * i.qty - i.discount), 0);
  const tax = Math.round(subtotal * (data.settings.taxPercent || 0) / 100);
  const total = subtotal + tax;

  function completeSale(payments) {
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const change = paid - total;
    const dayCount = data.transactions.filter((t) => t.date === todayStr()).length + 1;
    const trxNo = `${data.settings.trxPrefix}-${todayStr().replace(/-/g, "")}-${String(dayCount).padStart(4, "0")}`;
    const customer = customerId ? data.customers.find((c) => c.id === customerId) : null;
    const piutangAmount = payments.filter((p) => p.method === "Piutang").reduce((s, p) => s + p.amount, 0);
    const pointsEarned = customer ? Math.floor(total / 10000) : 0;

    const trx = {
      id: uid("trx"), trxNo, date: todayStr(), time: nowStr(), cashier: session.username, cashierName: session.name,
      shiftId: currentShift.id, storeId, customerId: customer ? customer.id : null, customerName: customer ? customer.name : null,
      items: cart.map((i) => ({ ...i, subtotal: i.price * i.qty - i.discount })),
      subtotal, tax, discount: cart.reduce((s, i) => s + i.discount, 0), total,
      payments, change: Math.max(change, 0),
      status: isOnline ? "SYNCING" : "PENDING",
      voidStatus: null,
    };

    setData((d) => {
      const newProducts = d.products.map((p) => {
        const item = cart.find((i) => i.productId === p.id);
        return item ? adjustStock(p, storeId, -item.qty) : p;
      });
      const movements = cart.map((i) => ({
        id: uid("mv"), date: todayStr(), productId: i.productId, storeId, type: "SALE",

        qtyIn: 0, qtyOut: i.qty, note: `Penjualan ${trxNo}`, user: session.username, trxRef: trx.id,
      }));
      const newCustomers = customer ? d.customers.map((c) => (c.id === customer.id ? {
        ...c, totalTransaksi: c.totalTransaksi + 1, totalPembelian: c.totalPembelian + total,
        points: c.points + pointsEarned, piutang: c.piutang + piutangAmount,
      } : c)) : d.customers;
      return {
        ...d,
        products: newProducts,
        customers: newCustomers,
        stockMovements: [...movements, ...d.stockMovements],
        transactions: [trx, ...d.transactions],
      };
    });

    if (isOnline) {
      setTimeout(() => {
        setData((d) => ({ ...d, transactions: d.transactions.map((t) => (t.id === trx.id ? { ...t, status: "SYNCED" } : t)) }));
      }, 700);
    }

    setCart([]);
    setCustomerId("");
    setPayOpen(false);
    setReceipt(trx);
    showToast("Transaksi berhasil");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }} className="pos-grid">
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
            <input className="input" placeholder="Cari nama produk / SKU..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Barcode size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
            <input ref={barcodeRef} className="input" placeholder="Scan barcode / SKU lalu Enter" onKeyDown={handleBarcodeEnter} style={{ paddingLeft: 32 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <CatChip active={catFilter === "all"} onClick={() => setCatFilter("all")} label="Semua" />
          {data.categories.map((c) => (
            <CatChip key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)} label={c.name} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
          {products.map((p) => {
            const stock = getStock(p, storeId);
            return (
              <button key={p.id} onClick={() => addToCart(p)} className="card" style={{
                padding: 12, textAlign: "left", border: "1px solid var(--border)",
                opacity: stock <= 0 ? 0.45 : 1, cursor: stock <= 0 ? "not-allowed" : "pointer",
              }} disabled={stock <= 0}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--primary-dark)", fontWeight: 700 }}>{fmtRp(p.sellPrice)}</div>
                <div style={{ fontSize: 11, color: stock <= p.minStock ? "var(--danger)" : "var(--muted)", marginTop: 4 }}>Stok {stock} {p.unit}</div>
              </button>
            );
          })}
          {products.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, gridColumn: "1/-1", padding: 30, textAlign: "center" }}>Produk tidak ditemukan.</div>}
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", height: "fit-content", position: "sticky", top: 12 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ fontSize: 12.5 }}>
            <option value="">Pelanggan umum (opsional)</option>
            {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.piutang > 0 ? ` (piutang ${fmtRp(c.piutang)})` : ""}</option>)}
          </select>
          <button className="btn btn-outline" style={{ padding: "9px 10px" }} onClick={() => setQuickCustomerOpen(true)} title="Tambah pelanggan baru">
            <Plus size={14} />
          </button>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Keranjang ({cart.length})</div>
        <div style={{ maxHeight: 340, overflowY: "auto", marginBottom: 10 }}>
          {cart.length === 0 && <EmptyHint text="Keranjang kosong." />}
          {cart.map((i) => (
            <div key={i.productId} style={{ borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                <span>{i.name}</span>
                <button onClick={() => removeItem(i.productId)} className="btn-ghost" style={{ border: "none", background: "none", color: "var(--danger)" }}><Trash2 size={14} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => updateQty(i.productId, -1)} className="btn btn-outline" style={{ padding: 4 }}><Minus size={12} /></button>
                  <span style={{ fontSize: 13, minWidth: 18, textAlign: "center" }}>{i.qty}</span>
                  <button onClick={() => updateQty(i.productId, 1)} className="btn btn-outline" style={{ padding: 4 }}><Plus size={12} /></button>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{fmtRp(i.price * i.qty - i.discount)}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <input type="number" min={0} placeholder="Diskon item (Rp)" value={i.discount || ""} onChange={(e) => setItemDiscount(i.productId, e.target.value)} className="input" style={{ fontSize: 12, padding: "5px 8px" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 13.5 }}>
          <Row label="Subtotal" value={fmtRp(subtotal)} />
          {data.settings.taxPercent > 0 && <Row label={`Pajak ${data.settings.taxPercent}%`} value={fmtRp(tax)} />}
          <Row label="Total" value={fmtRp(total)} bold />
        </div>
        <button className="btn btn-primary" style={{ justifyContent: "center", marginTop: 12, fontSize: 14.5, padding: "11px" }} disabled={cart.length === 0} onClick={() => setPayOpen(true)}>
          Bayar
        </button>
      </div>

      {payOpen && <PaymentModal total={total} onClose={() => setPayOpen(false)} onConfirm={completeSale} hasCustomer={!!customerId} />}
      {receipt && <ReceiptModal trx={receipt} settings={data.settings} onClose={() => setReceipt(null)} customerPhone={data.customers.find((c) => c.id === receipt.customerId)?.phone} />}
      {quickCustomerOpen && (
        <CustomerForm
          onClose={() => setQuickCustomerOpen(false)}
          onSave={(form) => {
            const newCust = { id: uid("cu"), points: 0, totalTransaksi: 0, totalPembelian: 0, piutang: 0, ...form };
            setData((d) => ({ ...d, customers: [...d.customers, newCust] }));
            setCustomerId(newCust.id);
            setQuickCustomerOpen(false);
            showToast("Pelanggan ditambahkan");
          }}
        />
      )}
      <style>{`@media (max-width:840px){.pos-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function CatChip({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 13px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, border: "1px solid var(--border)",
      background: active ? "var(--primary)" : "#fff", color: active ? "#fff" : "var(--ink)",
    }}>{label}</button>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontWeight: bold ? 700 : 400, fontSize: bold ? 15.5 : 13.5 }}>
      <span style={{ color: bold ? "var(--ink)" : "var(--muted)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PaymentModal({ total, onClose, onConfirm, hasCustomer }) {
  const [method, setMethod] = useState("Cash");
  const [amount, setAmount] = useState(String(total));
  const [split, setSplit] = useState(false);
  const [second, setSecond] = useState({ method: "QRIS", amount: "0" });

  const paid = split ? (Number(amount) || 0) + (Number(second.amount) || 0) : (Number(amount) || 0);
  const change = paid - total;
  const canConfirm = paid >= total;

  function confirm() {
    if (!canConfirm) return;
    const payments = split
      ? [{ method, amount: Number(amount) || 0 }, { method: second.method, amount: Number(second.amount) || 0 }]
      : [{ method, amount: Number(amount) || 0 }];
    onConfirm(payments);
  }

  return (
    <Modal onClose={onClose} title="Pembayaran" width={400}>
      <div style={{ textAlign: "center", padding: "6px 0 16px" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Total tagihan</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--primary-dark)" }}>{fmtRp(total)}</div>
      </div>
      <label className="label">Metode pembayaran</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["Cash", "QRIS", "Transfer", "Debit", "Kredit", "E-wallet", ...(hasCustomer ? ["Piutang"] : [])].map((m) => (
          <button key={m} onClick={() => setMethod(m)} style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12.5, border: "1px solid var(--border)",
            background: method === m ? "var(--primary)" : "#fff", color: method === m ? "#fff" : "var(--ink)",
          }}>{m}</button>
        ))}
      </div>
      <label className="label">Jumlah dibayar</label>
      <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

      {!split ? (
        <button className="btn btn-ghost" style={{ marginTop: 10, fontSize: 12.5 }} onClick={() => setSplit(true)}>+ Split pembayaran</button>
      ) : (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--border)" }}>
          <label className="label">Metode kedua</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="input" value={second.method} onChange={(e) => setSecond((s) => ({ ...s, method: e.target.value }))} style={{ maxWidth: 130 }}>
              {["QRIS", "Cash", "Transfer", "Debit", "Kredit", "E-wallet", ...(hasCustomer ? ["Piutang"] : [])].map((m) => <option key={m}>{m}</option>)}
            </select>
            <input className="input" type="number" value={second.amount} onChange={(e) => setSecond((s) => ({ ...s, amount: e.target.value }))} placeholder="Jumlah" />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12.5, color: "var(--danger)" }} onClick={() => setSplit(false)}>Batalkan split</button>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 13.5 }}>
        <Row label="Dibayar" value={fmtRp(paid)} />
        <Row label="Kembalian" value={fmtRp(Math.max(change, 0))} bold />
      </div>
      {!canConfirm && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>Jumlah dibayar kurang dari total.</div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={!canConfirm} onClick={confirm}>
        <Check size={15} /> Konfirmasi pembayaran
      </button>
    </Modal>
  );
}

function ReceiptModal({ trx, settings, onClose, customerPhone }) {
  const [waNumber, setWaNumber] = useState(customerPhone || "");

  function buildReceiptText() {
    const lines = [];
    lines.push(`*${settings.storeName}*`);
    lines.push(settings.address);
    lines.push("");
    lines.push(trx.trxNo);
    lines.push(`${trx.time} — ${trx.cashierName}`);
    lines.push("-----------------------------");
    trx.items.forEach((i) => {
      lines.push(`${i.name}`);
      lines.push(`${i.qty} x ${fmtRp(i.price)}  =  ${fmtRp(i.subtotal)}`);
    });
    lines.push("-----------------------------");
    lines.push(`Subtotal: ${fmtRp(trx.subtotal)}`);
    if (trx.discount > 0) lines.push(`Diskon: -${fmtRp(trx.discount)}`);
    if (trx.tax > 0) lines.push(`Pajak: ${fmtRp(trx.tax)}`);
    lines.push(`*TOTAL: ${fmtRp(trx.total)}*`);
    lines.push("");
    lines.push(settings.footer);
    return lines.join("\n");
  }

  function sendWhatsApp() {
    const digits = waNumber.replace(/[^0-9]/g, "");
    if (!digits) return;
    const normalized = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(buildReceiptText())}`;
    window.open(url, "_blank");
  }

  return (
    <Modal onClose={onClose} title="Struk transaksi" width={360}>
      <div className="receipt-print" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.7 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{settings.storeName}</div>
          <div>{settings.address}</div>
          <div>{settings.phone}</div>
        </div>
        <Dashed />
        <div>{trx.trxNo}</div>
        <div>{trx.time} — {trx.cashierName}</div>
        {trx.customerName && <div>Pelanggan: {trx.customerName}</div>}
        <Dashed />
        {trx.items.map((i) => (
          <div key={i.productId} style={{ marginBottom: 4 }}>
            <div>{i.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.qty} x {fmtRp(i.price)}</span>
              <span>{fmtRp(i.subtotal)}</span>
            </div>
          </div>
        ))}
        <Dashed />
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{fmtRp(trx.subtotal)}</span></div>
        {trx.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Diskon</span><span>-{fmtRp(trx.discount)}</span></div>}
        {trx.tax > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Pajak</span><span>{fmtRp(trx.tax)}</span></div>}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>TOTAL</span><span>{fmtRp(trx.total)}</span></div>
        <Dashed />
        {trx.payments.map((p, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}><span>{p.method}</span><span>{fmtRp(p.amount)}</span></div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Kembalian</span><span>{fmtRp(trx.change)}</span></div>
        <Dashed />
        <div style={{ textAlign: "center" }}>{settings.footer}</div>
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <StatusBadge status={trx.status} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        <input className="input" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="No. WhatsApp pelanggan (08xx...)" style={{ fontSize: 12.5 }} />
        <button className="btn btn-outline" onClick={sendWhatsApp} disabled={!waNumber.trim()} title="Kirim struk via WhatsApp">
          <MessageCircle size={14} /> Kirim
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => window.print()}><Printer size={14} /> Cetak</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Selesai</button>
      </div>
    </Modal>
  );
}

function Dashed() {
  return <div style={{ borderTop: "1px dashed #999", margin: "6px 0" }} />;
}

function StatusBadge({ status }) {
  const map = {
    PENDING: { bg: "#FDF1DE", c: "var(--accent-dark)", label: "Menunggu sinkronisasi", icon: Clock },
    SYNCING: { bg: "#E7F0FC", c: "#2563C7", label: "Menyinkronkan...", icon: RefreshCw },
    SYNCED: { bg: "var(--primary-light)", c: "var(--primary-dark)", label: "Tersinkron", icon: CheckCircle2 },
    FAILED: { bg: "var(--danger-bg)", c: "var(--danger)", label: "Gagal sync", icon: AlertTriangle },
    VOID: { bg: "var(--danger-bg)", c: "var(--danger)", label: "Dibatalkan", icon: Ban },
    VOID_REQUESTED: { bg: "#FDF1DE", c: "var(--accent-dark)", label: "Menunggu approval void", icon: ShieldAlert },
  };
  const s = map[status] || map.SYNCED;
  const Icon = s.icon;
  return <span className="badge" style={{ background: s.bg, color: s.c }}><Icon size={11} />{s.label}</span>;
}

function Modal({ children, onClose, title, width = 420 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,20,17,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "var(--font-display)" }}>{title}</div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6 }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- Produk ----------------------------- */

function ProdukView({ data, setData, showToast, storeId, canSwitchStore }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";

  const products = data.products.filter((p) =>
    (catFilter === "all" || p.categoryId === catFilter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(p) { setEditing(p); setFormOpen(true); }

  function saveProduct(form) {
    setData((d) => {
      if (editing) {
        return { ...d, products: d.products.map((p) => (p.id === editing.id ? { ...p, ...form, stock: p.stock } : p)) };
      }
      const stockMap = {};
      d.stores.forEach((s) => { stockMap[s.id] = s.id === storeId ? form.stock : 0; });
      const newP = { id: uid("p"), active: true, ...form, stock: stockMap };
      const mv = { id: uid("mv"), date: todayStr(), productId: newP.id, storeId, type: "STOCK_IN", qtyIn: form.stock, qtyOut: 0, note: "Produk baru", user: "system", trxRef: null };
      return { ...d, products: [...d.products, newP], stockMovements: [mv, ...d.stockMovements] };
    });
    setFormOpen(false);
    showToast(editing ? "Produk diperbarui" : "Produk ditambahkan");
  }

  function toggleActive(p) {
    setData((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) }));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
          <input className="input" placeholder="Cari produk / SKU..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <select className="input" style={{ width: 160 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Semua kategori</option>
          {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Tambah produk</button>
      </div>
      {canSwitchStore && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
          Kolom stok menampilkan stok di <b>{storeName}</b>. Kelola per toko lengkap di menu Inventory.
        </div>
      )}

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr><th>Produk</th><th>Kategori</th><th>Harga beli</th><th>Harga jual</th><th>Stok ({storeName})</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cat = data.categories.find((c) => c.id === p.categoryId)?.name || "-";
              const stock = getStock(p, storeId);
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{p.sku} · {p.barcode}</div>
                  </td>
                  <td>{cat}</td>
                  <td>{fmtRp(p.buyPrice)}</td>
                  <td style={{ fontWeight: 600 }}>{fmtRp(p.sellPrice)}</td>
                  <td style={{ color: stock <= p.minStock ? "var(--danger)" : "var(--ink)", fontWeight: stock <= p.minStock ? 700 : 400 }}>{stock} {p.unit}</td>
                  <td>
                    <button onClick={() => toggleActive(p)} className="badge" style={{ background: p.active ? "var(--primary-light)" : "#EEE", color: p.active ? "var(--primary-dark)" : "var(--muted)", border: "none" }}>
                      {p.active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td><button className="btn btn-outline" onClick={() => openEdit(p)}>Edit</button></td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={7}><EmptyHint text="Tidak ada produk." /></td></tr>}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <ProductForm
          initial={editing}
          categories={data.categories}
          storeId={storeId}
          storeName={storeName}
          onClose={() => setFormOpen(false)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}

function ProductForm({ initial, categories, storeId, storeName, onClose, onSave }) {
  const [form, setForm] = useState(initial ? {
    sku: initial.sku, barcode: initial.barcode, name: initial.name, categoryId: initial.categoryId,
    unit: initial.unit, buyPrice: initial.buyPrice, sellPrice: initial.sellPrice, stock: getStock(initial, storeId), minStock: initial.minStock,
  } : { sku: "", barcode: "", name: "", categoryId: categories[0]?.id || "", unit: "pcs", buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5 });
  const [err, setErr] = useState("");

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit() {
    if (!form.name.trim() || !form.sku.trim()) { setErr("Nama dan SKU wajib diisi."); return; }
    if (form.sellPrice <= 0) { setErr("Harga jual harus lebih dari 0."); return; }
    onSave({
      ...form, buyPrice: Number(form.buyPrice) || 0, sellPrice: Number(form.sellPrice) || 0,
      stock: Number(form.stock) || 0, minStock: Number(form.minStock) || 0,
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Edit produk" : "Tambah produk"} width={440}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <label className="label">Nama produk</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">SKU</label>
          <input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
        </div>
        <div>
          <label className="label">Barcode</label>
          <input className="input" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Satuan</label>
          <input className="input" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
        </div>
        <div>
          <label className="label">Harga beli</label>
          <input className="input" type="number" value={form.buyPrice} onChange={(e) => set("buyPrice", e.target.value)} />
        </div>
        <div>
          <label className="label">Harga jual</label>
          <input className="input" type="number" value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)} />
        </div>
        <div>
          <label className="label">Stok {storeName} {initial && "(edit di menu Inventory)"}</label>
          <input className="input" type="number" value={form.stock} disabled={!!initial} onChange={(e) => set("stock", e.target.value)} />
        </div>
        <div>
          <label className="label">Stok minimum</label>
          <input className="input" type="number" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} />
        </div>
      </div>
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={submit}>Simpan</button>
    </Modal>
  );
}

/* ----------------------------- Stok ----------------------------- */

function StokView({ data, setData, session, showToast, storeId, canSwitchStore }) {
  const [tab, setTab] = useState("card");
  const [adjustFor, setAdjustFor] = useState(null);
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";
  const lowStock = data.products.filter((p) => p.active && getStock(p, storeId) <= p.minStock);
  const storeMovements = data.stockMovements.filter((m) => m.storeId === storeId);

  function saveAdjustment(product, type, qty, note, direction) {
    const q = Number(qty);
    if (!q || q <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    const currentStock = getStock(product, storeId);
    const isOut = type === "STOCK_OUT" || type === "DAMAGE" || (type === "ADJUSTMENT" && direction === "OUT");
    if (isOut && q > currentStock) { showToast(`Jumlah melebihi stok saat ini (${currentStock} ${product.unit})`, "error"); return; }
    setData((d) => ({
      ...d,
      products: d.products.map((p) => (p.id === product.id ? adjustStock(p, storeId, isOut ? -q : q) : p)),
      stockMovements: [{
        id: uid("mv"), date: todayStr(), productId: product.id, storeId, type,
        qtyIn: isOut ? 0 : q, qtyOut: isOut ? q : 0,
        note: note || type, user: session.username, trxRef: null,
      }, ...d.stockMovements],
    }));
    setAdjustFor(null);
    showToast("Stok diperbarui");
  }

  return (
    <div>
      {canSwitchStore && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
          Menampilkan data inventory untuk <b>{storeName}</b>. Ganti toko lewat pemilih di kanan atas.
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <TabBtn active={tab === "card"} onClick={() => setTab("card")} label="Stock card" />
        <TabBtn active={tab === "low"} onClick={() => setTab("low")} label={`Stok menipis (${lowStock.length})`} />
      </div>

      {tab === "card" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Produk</th><th>Stok di {storeName}</th><th>Min. stok</th><th></th></tr></thead>
            <tbody>
              {data.products.map((p) => {
                const stock = getStock(p, storeId);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: stock <= p.minStock ? "var(--danger)" : "var(--ink)", fontWeight: 700 }}>{stock} {p.unit}</td>
                    <td>{p.minStock} {p.unit}</td>
                    <td><button className="btn btn-outline" onClick={() => setAdjustFor(p)}>Sesuaikan stok</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "low" && (
        <div className="card" style={{ overflowX: "auto" }}>
          {lowStock.length === 0 ? <div style={{ padding: 24 }}><EmptyHint text="Semua stok dalam batas aman." /></div> : (
            <table className="tbl">
              <thead><tr><th>Produk</th><th>Stok</th><th>Min. stok</th><th>Selisih</th></tr></thead>
              <tbody>
                {lowStock.map((p) => {
                  const stock = getStock(p, storeId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: "var(--danger)", fontWeight: 700 }}>{stock} {p.unit}</td>
                      <td>{p.minStock} {p.unit}</td>
                      <td style={{ color: "var(--danger)" }}>-{p.minStock - stock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Riwayat pergerakan stok — {storeName}</div>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Tanggal</th><th>Produk</th><th>Jenis</th><th>Masuk</th><th>Keluar</th><th>Catatan</th><th>User</th></tr></thead>
            <tbody>
              {storeMovements.slice(0, 30).map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>{data.products.find((p) => p.id === m.productId)?.name || "-"}</td>
                  <td><MovementBadge type={m.type} /></td>
                  <td>{m.qtyIn > 0 ? `+${m.qtyIn}` : "-"}</td>
                  <td>{m.qtyOut > 0 ? `-${m.qtyOut}` : "-"}</td>
                  <td style={{ color: "var(--muted)" }}>{m.note}</td>
                  <td>{m.user}</td>
                </tr>
              ))}
              {storeMovements.length === 0 && <tr><td colSpan={7}><EmptyHint text="Belum ada pergerakan stok." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {adjustFor && <AdjustModal product={adjustFor} storeId={storeId} onClose={() => setAdjustFor(null)} onSave={saveAdjustment} />}
    </div>
  );
}

function MovementBadge({ type }) {
  const map = {
    STOCK_IN: { bg: "var(--primary-light)", c: "var(--primary-dark)" }, STOCK_OUT: { bg: "var(--danger-bg)", c: "var(--danger)" },
    SALE: { bg: "#E7F0FC", c: "#2563C7" }, RETURN: { bg: "#FDF1DE", c: "var(--accent-dark)" },
    ADJUSTMENT: { bg: "#F1EEFB", c: "#6B46C1" }, DAMAGE: { bg: "var(--danger-bg)", c: "var(--danger)" },
    TRANSFER_OUT: { bg: "#FDF1DE", c: "var(--accent-dark)" }, TRANSFER_IN: { bg: "var(--primary-light)", c: "var(--primary-dark)" },
  };
  const s = map[type] || { bg: "#EEE", c: "var(--muted)" };
  return <span className="badge" style={{ background: s.bg, color: s.c }}>{type}</span>;
}

function TabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 15px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
      background: active ? "var(--primary)" : "#fff", color: active ? "#fff" : "var(--ink)",
    }}>{label}</button>
  );
}

function AdjustModal({ product, storeId, onClose, onSave }) {
  const [type, setType] = useState("STOCK_IN");
  const [direction, setDirection] = useState("IN");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  return (
    <Modal onClose={onClose} title={`Sesuaikan stok — ${product.name}`} width={380}>
      <label className="label">Jenis penyesuaian</label>
      <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ marginBottom: 10 }}>
        <option value="STOCK_IN">Stok masuk (restock)</option>
        <option value="STOCK_OUT">Stok keluar</option>
        <option value="ADJUSTMENT">Penyesuaian (opname)</option>
        <option value="DAMAGE">Barang rusak</option>
      </select>
      {type === "ADJUSTMENT" && (
        <div style={{ marginBottom: 10 }}>
          <label className="label">Arah penyesuaian</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={() => setDirection("IN")} className="btn" style={{ flex: 1, justifyContent: "center", background: direction === "IN" ? "var(--primary)" : "#fff", color: direction === "IN" ? "#fff" : "var(--ink)", border: "1px solid var(--border)" }}>Tambah stok</button>
            <button type="button" onClick={() => setDirection("OUT")} className="btn" style={{ flex: 1, justifyContent: "center", background: direction === "OUT" ? "var(--primary)" : "#fff", color: direction === "OUT" ? "#fff" : "var(--ink)", border: "1px solid var(--border)" }}>Kurangi stok</button>
          </div>
        </div>
      )}
      <label className="label">Jumlah</label>
      <input className="input" type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Catatan</label>
      <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsional" />
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>Stok saat ini: {getStock(product, storeId)} {product.unit}</div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => onSave(product, type, qty, note, direction)}>Simpan</button>
    </Modal>
  );
}

/* ----------------------------- Kas & Shift ----------------------------- */

function KasShiftView({ data, setData, session, currentShift, showToast, storeId }) {
  const [openForm, setOpenForm] = useState(false);
  const [closeForm, setCloseForm] = useState(false);
  const [cashForm, setCashForm] = useState(null);
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";

  function shiftStats(shift) {
    const trx = data.transactions.filter((t) => t.shiftId === shift.id && t.status !== "VOID");
    const cashSales = trx.reduce((s, t) => s + t.payments.filter((p) => p.method === "Cash").reduce((a, p) => a + p.amount, 0), 0);
    const cashChange = trx.reduce((s, t) => s + t.change, 0);
    const cashIn = data.cashMovements.filter((c) => c.shiftId === shift.id && c.type === "IN").reduce((s, c) => s + c.amount, 0);
    const cashOut = data.cashMovements.filter((c) => c.shiftId === shift.id && c.type === "OUT").reduce((s, c) => s + c.amount, 0);
    const expected = shift.openingCash + cashSales - cashChange + cashIn - cashOut;
    return { trxCount: trx.length, cashSales, cashIn, cashOut, expected };
  }

  function openShift(openingCash) {
    const s = {
      id: uid("shift"), cashier: session.username, cashierName: session.name, date: todayStr(), storeId,
      openTime: nowStr(), closeTime: null, openingCash: Number(openingCash) || 0,
      actualCash: null, expectedCash: null, difference: null, status: "OPEN",
    };
    setData((d) => ({ ...d, shifts: [s, ...d.shifts] }));
    setOpenForm(false);
    showToast("Shift dibuka");
  }

  function closeShift(actualCash) {
    const stats = shiftStats(currentShift);
    const actual = Number(actualCash) || 0;
    setData((d) => ({
      ...d,
      shifts: d.shifts.map((s) => (s.id === currentShift.id ? {
        ...s, status: "CLOSED", closeTime: nowStr(), actualCash: actual,
        expectedCash: stats.expected, difference: actual - stats.expected,
      } : s)),
    }));
    setCloseForm(false);
    showToast("Shift ditutup");
  }

  function addCash(type, category, amount, note) {
    const amt = Number(amount);
    if (!amt || amt <= 0) { showToast("Nominal harus lebih dari 0", "error"); return; }
    setData((d) => ({
      ...d,
      cashMovements: [{
        id: uid("cash"), date: todayStr(), type, category, amount: amt, note,
        user: session.username, shiftId: currentShift ? currentShift.id : null, storeId,
      }, ...d.cashMovements],
    }));
    setCashForm(null);
    showToast("Kas dicatat");
  }

  const myShifts = data.shifts.filter((s) => s.storeId === storeId && (s.cashier === session.username || ["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role)));
  const todayCash = data.cashMovements.filter((c) => c.date === todayStr() && c.storeId === storeId);

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        {!currentShift ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Belum ada shift aktif</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Buka shift di <b>{storeName}</b> untuk mulai mencatat transaksi kasir.</div>
            </div>
            <button className="btn btn-primary" onClick={() => setOpenForm(true)}>Buka Shift</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <CircleDot size={13} color="var(--primary)" /> Shift aktif — {currentShift.cashierName}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Dibuka {currentShift.openTime} · Modal awal {fmtRp(currentShift.openingCash)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setCashForm({ type: "IN" })}><ArrowDownCircle size={14} /> Kas masuk</button>
                <button className="btn btn-outline" onClick={() => setCashForm({ type: "OUT" })}><ArrowUpCircle size={14} /> Kas keluar</button>
                <button className="btn btn-primary" onClick={() => setCloseForm(true)}>Tutup Shift</button>
              </div>
            </div>
            {(() => {
              const s = shiftStats(currentShift);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginTop: 16 }}>
                  <MiniStat label="Transaksi" value={s.trxCount} />
                  <MiniStat label="Penjualan cash" value={fmtRp(s.cashSales)} />
                  <MiniStat label="Kas masuk lain" value={fmtRp(s.cashIn)} />
                  <MiniStat label="Kas keluar" value={fmtRp(s.cashOut)} />
                  <MiniStat label="Estimasi kas saat ini" value={fmtRp(s.expected)} accent />
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Riwayat kas hari ini</div>
      <div className="card" style={{ overflowX: "auto", marginBottom: 20 }}>
        <table className="tbl">
          <thead><tr><th>Jenis</th><th>Kategori</th><th>Nominal</th><th>Catatan</th><th>User</th></tr></thead>
          <tbody>
            {todayCash.map((c) => (
              <tr key={c.id}>
                <td><span className="badge" style={{ background: c.type === "IN" ? "var(--primary-light)" : "var(--danger-bg)", color: c.type === "IN" ? "var(--primary-dark)" : "var(--danger)" }}>{c.type === "IN" ? "Masuk" : "Keluar"}</span></td>
                <td>{c.category}</td>
                <td style={{ fontWeight: 600 }}>{fmtRp(c.amount)}</td>
                <td style={{ color: "var(--muted)" }}>{c.note || "-"}</td>
                <td>{c.user}</td>
              </tr>
            ))}
            {todayCash.length === 0 && <tr><td colSpan={5}><EmptyHint text="Belum ada catatan kas hari ini." /></td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Riwayat shift</div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Kasir</th><th>Tanggal</th><th>Buka - Tutup</th><th>Modal awal</th><th>Expected</th><th>Actual</th><th>Selisih</th></tr></thead>
          <tbody>
            {myShifts.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.cashierName}</td>
                <td>{s.date}</td>
                <td style={{ fontSize: 12 }}>{s.openTime} {s.closeTime ? `— ${s.closeTime}` : "(aktif)"}</td>
                <td>{fmtRp(s.openingCash)}</td>
                <td>{s.expectedCash != null ? fmtRp(s.expectedCash) : "-"}</td>
                <td>{s.actualCash != null ? fmtRp(s.actualCash) : "-"}</td>
                <td style={{ fontWeight: 700, color: s.difference > 0 ? "var(--primary-dark)" : s.difference < 0 ? "var(--danger)" : "var(--ink)" }}>
                  {s.difference != null ? fmtRp(s.difference) : "-"}
                </td>
              </tr>
            ))}
            {myShifts.length === 0 && <tr><td colSpan={7}><EmptyHint text="Belum ada riwayat shift." /></td></tr>}
          </tbody>
        </table>
      </div>

      {openForm && <OpenShiftModal onClose={() => setOpenForm(false)} onConfirm={openShift} />}
      {closeForm && currentShift && <CloseShiftModal shift={currentShift} stats={shiftStats(currentShift)} onClose={() => setCloseForm(false)} onConfirm={closeShift} />}
      {cashForm && <CashModal type={cashForm.type} onClose={() => setCashForm(null)} onConfirm={(cat, amt, note) => addCash(cashForm.type, cat, amt, note)} />}
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div style={{ background: accent ? "var(--primary-light)" : "var(--bg)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11.5, color: accent ? "var(--primary-dark)" : "var(--muted)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 15, marginTop: 3, color: accent ? "var(--primary-dark)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function OpenShiftModal({ onClose, onConfirm }) {
  const [amount, setAmount] = useState("500000");
  return (
    <Modal onClose={onClose} title="Buka shift" width={340}>
      <label className="label">Modal awal (kas laci)</label>
      <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => onConfirm(amount)}>Buka shift</button>
    </Modal>
  );
}

function CloseShiftModal({ shift, stats, onClose, onConfirm }) {
  const [actual, setActual] = useState("");
  const diff = (Number(actual) || 0) - stats.expected;
  return (
    <Modal onClose={onClose} title="Tutup shift" width={360}>
      <div style={{ fontSize: 13.5, marginBottom: 12 }}>
        <Row label="Modal awal" value={fmtRp(shift.openingCash)} />
        <Row label="Penjualan cash" value={fmtRp(stats.cashSales)} />
        <Row label="Kas masuk lain" value={fmtRp(stats.cashIn)} />
        <Row label="Kas keluar" value={`-${fmtRp(stats.cashOut)}`} />
        <Row label="Expected cash" value={fmtRp(stats.expected)} bold />
      </div>
      <label className="label">Actual cash (hasil hitung fisik)</label>
      <input className="input" type="number" value={actual} onChange={(e) => setActual(e.target.value)} />
      {actual !== "" && (
        <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: diff === 0 ? "var(--primary-dark)" : diff > 0 ? "var(--primary-dark)" : "var(--danger)" }}>
          Selisih: {fmtRp(diff)}
        </div>
      )}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={actual === ""} onClick={() => onConfirm(actual)}>Tutup shift</button>
    </Modal>
  );
}

function CashModal({ type, onClose, onConfirm }) {
  const [category, setCategory] = useState(type === "OUT" ? "Operasional" : "Setoran");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const outCats = ["Operasional", "Beli ATK", "Transport", "Listrik", "Keperluan toko", "Lainnya"];
  const inCats = ["Setoran", "Tambahan modal", "Lainnya"];
  return (
    <Modal onClose={onClose} title={type === "IN" ? "Catat kas masuk" : "Catat kas keluar"} width={360}>
      <label className="label">Kategori</label>
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginBottom: 10 }}>
        {(type === "IN" ? inCats : outCats).map((c) => <option key={c}>{c}</option>)}
      </select>
      <label className="label">Nominal</label>
      <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Keterangan</label>
      <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsional" />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => onConfirm(category, amount, note)}>Simpan</button>
    </Modal>
  );
}

/* ----------------------------- Laporan ----------------------------- */

function LaporanView({ data, session, setData, showToast, storeId, canSwitchStore }) {
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [kasir, setKasir] = useState("all");
  const [method, setMethod] = useState("all");
  const [storeFilter, setStoreFilter] = useState(storeId || "all");
  const [expanded, setExpanded] = useState(null);
  const [voidReasonFor, setVoidReasonFor] = useState(null);

  const limited = session.role === "KASIR";

  const filtered = data.transactions.filter((t) => {
    if (t.date < from || t.date > to) return false;
    if (limited && t.cashier !== session.username) return false;
    if (!canSwitchStore && t.storeId !== storeId) return false;
    if (canSwitchStore && storeFilter !== "all" && t.storeId !== storeFilter) return false;
    if (kasir !== "all" && t.cashier !== kasir) return false;
    if (method !== "all" && !t.payments.some((p) => p.method === method)) return false;
    return true;
  });

  const validTrx = filtered.filter((t) => t.status !== "VOID");
  const totalSales = validTrx.reduce((s, t) => s + t.total, 0);
  const totalItems = validTrx.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);
  const grossProfit = validTrx.reduce((s, t) => s + t.items.reduce((a, i) => {
    const buyPrice = i.buyPriceAtSale != null ? i.buyPriceAtSale : (data.products.find((x) => x.id === i.productId)?.buyPrice || 0);
    return a + (i.price - buyPrice) * i.qty - (i.discount || 0);
  }, 0), 0);

  const cashierList = [...new Set(data.transactions.map((t) => t.cashier))];

  function requestVoid(trxId) {
    setData((d) => ({ ...d, transactions: d.transactions.map((t) => (t.id === trxId ? { ...t, status: "VOID_REQUESTED", voidStatus: "REQUESTED" } : t)) }));
    setVoidReasonFor(null);
    showToast("Permintaan void dikirim, menunggu approval supervisor.");
  }

  function approveVoid(trx, approve) {
    setData((d) => {
      if (!approve) {
        return { ...d, transactions: d.transactions.map((t) => (t.id === trx.id ? { ...t, status: "SYNCED", voidStatus: null } : t)) };
      }
      const restoredProducts = d.products.map((p) => {
        const item = trx.items.find((i) => i.productId === p.id);
        return item ? adjustStock(p, trx.storeId, item.qty) : p;
      });
      const movements = trx.items.map((i) => ({
        id: uid("mv"), date: todayStr(), productId: i.productId, storeId: trx.storeId, type: "RETURN",
        qtyIn: i.qty, qtyOut: 0, note: `Void ${trx.trxNo}`, user: session.username, trxRef: trx.id,
      }));
      return {
        ...d,
        products: restoredProducts,
        stockMovements: [...movements, ...d.stockMovements],
        transactions: d.transactions.map((t) => (t.id === trx.id ? { ...t, status: "VOID", voidStatus: "APPROVED" } : t)),
      };
    });
    showToast(approve ? "Void disetujui, stok dikembalikan" : "Void ditolak");
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label className="label">Dari tanggal</label>
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">Sampai tanggal</label>
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {canSwitchStore && (
          <div>
            <label className="label">Toko</label>
            <select className="input" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
              <option value="all">Semua Toko</option>
              {data.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {!limited && (
          <div>
            <label className="label">Kasir</label>
            <select className="input" value={kasir} onChange={(e) => setKasir(e.target.value)}>
              <option value="all">Semua kasir</option>
              {cashierList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label">Metode pembayaran</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="all">Semua metode</option>
            {["Cash", "QRIS", "Transfer", "Debit", "Kredit", "E-wallet"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14 }}><div style={{ fontSize: 12, color: "var(--muted)" }}>Total penjualan</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{fmtRp(totalSales)}</div></div>
        <div className="card" style={{ padding: 14 }}><div style={{ fontSize: 12, color: "var(--muted)" }}>Jumlah transaksi</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{validTrx.length}</div></div>
        <div className="card" style={{ padding: 14 }}><div style={{ fontSize: 12, color: "var(--muted)" }}>Item terjual</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{totalItems}</div></div>
        {!limited && <div className="card" style={{ padding: 14 }}><div style={{ fontSize: 12, color: "var(--muted)" }}>Laba kotor</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{fmtRp(grossProfit)}</div></div>}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th></th><th>No. transaksi</th><th>Tanggal</th><th>Kasir</th><th>Metode</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <Fragment key={t.id}>
                <tr>
                  <td><button className="btn-ghost" style={{ border: "none", background: "none" }} onClick={() => setExpanded(expanded === t.id ? null : t.id)}><ChevronRight size={14} style={{ transform: expanded === t.id ? "rotate(90deg)" : "none", transition: "transform .12s" }} /></button></td>
                  <td style={{ fontWeight: 600 }}>{t.trxNo}</td>
                  <td>{t.date}</td>
                  <td>{t.cashierName}</td>
                  <td>{t.payments.map((p) => p.method).join(", ")}</td>
                  <td style={{ fontWeight: 700 }}>{fmtRp(t.total)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    {t.status !== "VOID" && t.status !== "VOID_REQUESTED" && (
                      session.role === "KASIR"
                        ? <button className="btn btn-danger" onClick={() => setVoidReasonFor(t)}>Void</button>
                        : ["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role) && <button className="btn btn-danger" onClick={() => setVoidReasonFor(t)}>Void</button>
                    )}
                    {t.status === "VOID_REQUESTED" && ["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role) && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-primary" style={{ padding: "5px 9px" }} onClick={() => approveVoid(t, true)}>Setujui</button>
                        <button className="btn btn-outline" style={{ padding: "5px 9px" }} onClick={() => approveVoid(t, false)}>Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
                {expanded === t.id && (
                  <tr>
                    <td colSpan={8} style={{ background: "var(--bg)" }}>
                      <div style={{ padding: "6px 4px" }}>
                        {t.items.map((i) => (
                          <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0" }}>
                            <span>{i.qty}x {i.name}</span><span>{fmtRp(i.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8}><EmptyHint text="Tidak ada transaksi pada rentang ini." /></td></tr>}
          </tbody>
        </table>
      </div>

      {voidReasonFor && (
        <VoidModal
          trx={voidReasonFor}
          isDirect={["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role)}
          onClose={() => setVoidReasonFor(null)}
          onConfirm={() => (["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role) ? approveVoid(voidReasonFor, true) : requestVoid(voidReasonFor.id))}
        />
      )}
    </div>
  );
}

function VoidModal({ trx, isDirect, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <Modal onClose={onClose} title={`Void transaksi ${trx.trxNo}`} width={360}>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
        {isDirect ? "Void akan langsung membatalkan transaksi dan mengembalikan stok." : "Permintaan void akan dikirim ke supervisor untuk approval."}
      </p>
      <label className="label">Alasan void</label>
      <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Contoh: salah input produk" />
      <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={!reason.trim()} onClick={onConfirm}>
        <Ban size={14} /> {isDirect ? "Void transaksi" : "Kirim permintaan void"}
      </button>
    </Modal>
  );
}

/* ----------------------------- User ----------------------------- */

function UserView({ data, setData, showToast, session }) {
  const [formOpen, setFormOpen] = useState(false);
  const ownerCount = data.users.filter((u) => u.role === "OWNER").length;

  function addUser(form) {
    if (data.users.some((u) => u.username === form.username)) { showToast("Username sudah digunakan", "error"); return; }
    setData((d) => ({ ...d, users: [...d.users, form] }));
    setFormOpen(false);
    showToast("User ditambahkan");
  }

  function removeUser(u) {
    if (u.username === session.username) { showToast("Tidak bisa menghapus akun Anda sendiri", "error"); return; }
    if (u.role === "OWNER" && ownerCount <= 1) { showToast("Tidak bisa menghapus satu-satunya akun Owner", "error"); return; }
    setData((d) => ({ ...d, users: d.users.filter((x) => x.username !== u.username) }));
    showToast("User dihapus");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}><Plus size={14} /> Tambah user</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>PIN</th><th></th></tr></thead>
          <tbody>
            {data.users.map((u) => {
              const isSelf = u.username === session.username;
              const isLastOwner = u.role === "OWNER" && ownerCount <= 1;
              return (
                <tr key={u.username}>
                  <td style={{ fontWeight: 600 }}>{u.name}{isSelf && <span style={{ color: "var(--muted)", fontWeight: 400 }}> (Anda)</span>}</td>
                  <td>{u.username}</td>
                  <td><span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}>{ROLE_LABEL[u.role]}</span></td>
                  <td>{u.pin || "-"}</td>
                  <td>
                    {!isSelf && !isLastOwner && (
                      <button className="btn btn-danger" onClick={() => removeUser(u)}><Trash2 size={13} /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {formOpen && <UserForm onClose={() => setFormOpen(false)} onSave={addUser} />}
    </div>
  );
}

function UserForm({ onClose, onSave }) {
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "KASIR", pin: "" });
  const [err, setErr] = useState("");
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit() {
    if (!form.username.trim() || !form.password.trim() || !form.name.trim()) { setErr("Lengkapi semua field wajib."); return; }
    onSave(form.role === "KASIR" ? form : { ...form, pin: undefined });
  }
  return (
    <Modal onClose={onClose} title="Tambah user" width={380}>
      <label className="label">Nama lengkap</label>
      <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Username</label>
      <input className="input" value={form.username} onChange={(e) => set("username", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Password</label>
      <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Role</label>
      <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)} style={{ marginBottom: 10 }}>
        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
      </select>
      {form.role === "KASIR" && (
        <>
          <label className="label">PIN kasir</label>
          <input className="input" value={form.pin} onChange={(e) => set("pin", e.target.value)} placeholder="Opsional" />
        </>
      )}
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={submit}>Simpan</button>
    </Modal>
  );
}

/* ----------------------------- Pengaturan ----------------------------- */

function PengaturanView({ data, setData, showToast }) {
  const [form, setForm] = useState(data.settings);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function save() {
    setData((d) => ({ ...d, settings: form }));
    showToast("Pengaturan disimpan");
  }

  return (
    <div className="card" style={{ padding: 22, maxWidth: 520 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Pengaturan toko</div>
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label className="label">Nama toko</label>
          <input className="input" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
        </div>
        <div>
          <label className="label">Alamat</label>
          <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className="label">No. telepon</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Footer struk</label>
          <input className="input" value={form.footer} onChange={(e) => set("footer", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Prefix nomor transaksi</label>
            <input className="input" value={form.trxPrefix} onChange={(e) => set("trxPrefix", e.target.value)} />
          </div>
          <div>
            <label className="label">Pajak (%)</label>
            <input className="input" type="number" value={form.taxPercent} onChange={(e) => set("taxPercent", Number(e.target.value) || 0)} />
          </div>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={save}>Simpan pengaturan</button>
    </div>
  );
}

/* ----------------------------- Pelanggan (Customer) ----------------------------- */

function PelangganView({ data, setData, showToast }) {
  const [formOpen, setFormOpen] = useState(false);
  const [payDebtFor, setPayDebtFor] = useState(null);
  const [detailFor, setDetailFor] = useState(null);
  const [search, setSearch] = useState("");

  const customers = data.customers.filter((c) => search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  function addCustomer(form) {
    setData((d) => ({ ...d, customers: [...d.customers, { id: uid("cu"), points: 0, totalTransaksi: 0, totalPembelian: 0, piutang: 0, ...form }] }));
    setFormOpen(false);
    showToast("Pelanggan ditambahkan");
  }

  function payDebt(customerId, amount) {
    const cust = data.customers.find((c) => c.id === customerId);
    const amt = Number(amount);
    if (!amt || amt <= 0) { showToast("Nominal harus lebih dari 0", "error"); return; }
    if (amt > cust.piutang) { showToast("Nominal melebihi sisa piutang", "error"); return; }
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) => (c.id === customerId ? { ...c, piutang: Math.max(0, c.piutang - amt) } : c)),
      cashMovements: [{ id: uid("cash"), date: todayStr(), type: "IN", category: "Pembayaran piutang", amount: amt, note: `Piutang ${cust?.name}`, user: "system", shiftId: null }, ...d.cashMovements],
    }));
    setPayDebtFor(null);
    showToast("Pembayaran piutang dicatat");
  }

  const totalPiutang = data.customers.reduce((s, c) => s + c.piutang, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
          <input className="input" placeholder="Cari nama / no. HP..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Total piutang: <b style={{ color: "var(--danger)" }}>{fmtRp(totalPiutang)}</b></span>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}><Plus size={14} /> Tambah pelanggan</button>
        </div>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Nama</th><th>No. HP</th><th>Transaksi</th><th>Total belanja</th><th>Poin</th><th>Piutang</th><th></th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => setDetailFor(c)}>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.totalTransaksi}</td>
                <td>{fmtRp(c.totalPembelian)}</td>
                <td><span className="badge" style={{ background: "#FDF1DE", color: "var(--accent-dark)" }}><Gift size={11} />{c.points}</span></td>
                <td style={{ color: c.piutang > 0 ? "var(--danger)" : "var(--ink)", fontWeight: c.piutang > 0 ? 700 : 400 }}>{fmtRp(c.piutang)}</td>
                <td>{c.piutang > 0 && <button className="btn btn-outline" onClick={() => setPayDebtFor(c)}>Bayar piutang</button>}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={7}><EmptyHint text="Belum ada pelanggan." /></td></tr>}
          </tbody>
        </table>
      </div>

      {formOpen && <CustomerForm onClose={() => setFormOpen(false)} onSave={addCustomer} />}
      {payDebtFor && (
        <Modal onClose={() => setPayDebtFor(null)} title={`Bayar piutang — ${payDebtFor.name}`} width={340}>
          <PayAmountForm max={payDebtFor.piutang} onConfirm={(amt) => payDebt(payDebtFor.id, amt)} />
        </Modal>
      )}
      {detailFor && <CustomerDetailModal customer={detailFor} data={data} onClose={() => setDetailFor(null)} />}
    </div>
  );
}

function CustomerForm({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [err, setErr] = useState("");
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit() {
    if (!form.name.trim()) { setErr("Nama wajib diisi."); return; }
    onSave(form);
  }
  return (
    <Modal onClose={onClose} title="Tambah pelanggan" width={360}>
      <label className="label">Nama</label>
      <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">No. HP</label>
      <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Alamat</label>
      <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={submit}>Simpan</button>
    </Modal>
  );
}

function PayAmountForm({ max, onConfirm }) {
  const [amount, setAmount] = useState(String(max));
  return (
    <div>
      <label className="label">Nominal pembayaran (sisa piutang {fmtRp(max)})</label>
      <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => onConfirm(amount)}>Catat pembayaran</button>
    </div>
  );
}

function CustomerDetailModal({ customer, data, onClose }) {
  const trx = data.transactions.filter((t) => t.customerId === customer.id && t.status !== "VOID");
  return (
    <Modal onClose={onClose} title={customer.name} width={420}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        <MiniStat label="Total transaksi" value={customer.totalTransaksi} />
        <MiniStat label="Total belanja" value={fmtRp(customer.totalPembelian)} />
        <MiniStat label="Poin" value={customer.points} accent />
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Riwayat transaksi</div>
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {trx.length === 0 && <EmptyHint text="Belum ada transaksi." />}
        {trx.map((t) => (
          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
            <span>{t.trxNo} · {t.date}</span><span style={{ fontWeight: 600 }}>{fmtRp(t.total)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ----------------------------- Supplier ----------------------------- */

function SupplierView({ data, setData, showToast }) {
  const [formOpen, setFormOpen] = useState(null);

  function saveSupplier(form) {
    setData((d) => {
      if (formOpen && formOpen.id) {
        return { ...d, suppliers: d.suppliers.map((s) => (s.id === formOpen.id ? { ...s, ...form } : s)) };
      }
      return { ...d, suppliers: [...d.suppliers, { id: uid("sp"), ...form }] };
    });
    setFormOpen(null);
    showToast("Supplier disimpan");
  }

  function debtFor(supplierId) {
    return data.purchaseOrders.filter((po) => po.supplierId === supplierId && po.status === "RECEIVED")
      .reduce((s, po) => s + (po.total - po.paidAmount), 0);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setFormOpen({})}><Plus size={14} /> Tambah supplier</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Nama supplier</th><th>Kontak</th><th>Telepon</th><th>Alamat</th><th>Hutang</th><th></th></tr></thead>
          <tbody>
            {data.suppliers.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.contactPerson}</td>
                <td>{s.phone}</td>
                <td>{s.address}</td>
                <td style={{ color: debtFor(s.id) > 0 ? "var(--danger)" : "var(--ink)", fontWeight: debtFor(s.id) > 0 ? 700 : 400 }}>{fmtRp(debtFor(s.id))}</td>
                <td><button className="btn btn-outline" onClick={() => setFormOpen(s)}>Edit</button></td>
              </tr>
            ))}
            {data.suppliers.length === 0 && <tr><td colSpan={6}><EmptyHint text="Belum ada supplier." /></td></tr>}
          </tbody>
        </table>
      </div>
      {formOpen && <SupplierForm initial={formOpen.id ? formOpen : null} onClose={() => setFormOpen(null)} onSave={saveSupplier} />}
    </div>
  );
}

function SupplierForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ? { name: initial.name, phone: initial.phone, address: initial.address, contactPerson: initial.contactPerson } : { name: "", phone: "", address: "", contactPerson: "" });
  const [err, setErr] = useState("");
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit() {
    if (!form.name.trim()) { setErr("Nama supplier wajib diisi."); return; }
    onSave(form);
  }
  return (
    <Modal onClose={onClose} title={initial ? "Edit supplier" : "Tambah supplier"} width={380}>
      <label className="label">Nama supplier</label>
      <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Contact person</label>
      <input className="input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Telepon</label>
      <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Alamat</label>
      <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={submit}>Simpan</button>
    </Modal>
  );
}

/* ----------------------------- Pembelian (Purchase) ----------------------------- */

function PembelianView({ data, setData, session, showToast, storeId }) {
  const [formOpen, setFormOpen] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const storeName = data.stores.find((s) => s.id === storeId)?.name || "-";

  function createPO(supplierId, items) {
    if (!supplierId) { showToast("Pilih supplier", "error"); return; }
    const valid = items.filter((i) => i.productId && Number(i.qty) > 0);
    if (valid.length === 0) { showToast("Tambahkan minimal 1 produk", "error"); return; }
    const total = valid.reduce((s, i) => s + Number(i.qty) * Number(i.buyPrice), 0);
    const poCount = data.purchaseOrders.length + 1;
    const po = {
      id: uid("po"), poNo: `PO-${todayStr().replace(/-/g, "")}-${String(poCount).padStart(3, "0")}`,
      supplierId, date: todayStr(), status: "ORDERED", paidAmount: 0, total, storeId,
      items: valid.map((i) => ({ productId: i.productId, qty: Number(i.qty), buyPrice: Number(i.buyPrice) })),
    };
    setData((d) => ({ ...d, purchaseOrders: [po, ...d.purchaseOrders] }));
    setFormOpen(false);
    showToast("Purchase order dibuat");
  }

  function receivePO(po) {
    const totals = {};
    po.items.forEach((i) => {
      if (!totals[i.productId]) totals[i.productId] = { qty: 0, valueSum: 0 };
      totals[i.productId].qty += i.qty;
      totals[i.productId].valueSum += i.qty * i.buyPrice;
    });
    setData((d) => ({
      ...d,
      products: d.products.map((p) => {
        const t = totals[p.id];
        if (!t) return p;
        const avgBuyPrice = Math.round(t.valueSum / t.qty);
        return { ...adjustStock(p, po.storeId, t.qty), buyPrice: avgBuyPrice };
      }),
      stockMovements: [
        ...po.items.map((i) => ({ id: uid("mv"), date: todayStr(), productId: i.productId, storeId: po.storeId, type: "STOCK_IN", qtyIn: i.qty, qtyOut: 0, note: `Penerimaan ${po.poNo}`, user: session.username, trxRef: po.id })),
        ...d.stockMovements,
      ],
      purchaseOrders: d.purchaseOrders.map((x) => (x.id === po.id ? { ...x, status: "RECEIVED" } : x)),
    }));
    showToast("Barang diterima, stok diperbarui");
  }

  function cancelPO(po) {
    setData((d) => ({ ...d, purchaseOrders: d.purchaseOrders.map((x) => (x.id === po.id ? { ...x, status: "CANCELLED" } : x)) }));
    showToast("PO dibatalkan");
  }

  function payPO(po, amount) {
    const amt = Number(amount);
    const remaining = po.total - po.paidAmount;
    if (!amt || amt <= 0 || amt > remaining) { showToast("Nominal tidak valid", "error"); return; }
    setData((d) => ({
      ...d,
      purchaseOrders: d.purchaseOrders.map((x) => (x.id === po.id ? { ...x, paidAmount: x.paidAmount + amt } : x)),
      cashMovements: [{ id: uid("cash"), date: todayStr(), type: "OUT", category: "Pembayaran hutang supplier", amount: amt, note: po.poNo, user: session.username, shiftId: null, storeId: po.storeId }, ...d.cashMovements],
    }));
    setPayFor(null);
    showToast("Pembayaran hutang dicatat");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}><Plus size={14} /> Buat purchase order</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>No. PO</th><th>Toko</th><th>Supplier</th><th>Tanggal</th><th>Total</th><th>Hutang</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.purchaseOrders.map((po) => {
              const supplier = data.suppliers.find((s) => s.id === po.supplierId)?.name || "-";
              const remaining = po.total - po.paidAmount;
              return (
                <tr key={po.id}>
                  <td style={{ fontWeight: 600 }}>{po.poNo}</td>
                  <td style={{ color: "var(--muted)" }}>{data.stores.find((s) => s.id === po.storeId)?.name || "-"}</td>
                  <td>{supplier}</td>
                  <td>{po.date}</td>
                  <td>{fmtRp(po.total)}</td>
                  <td style={{ color: remaining > 0 && po.status === "RECEIVED" ? "var(--danger)" : "var(--ink)", fontWeight: remaining > 0 ? 700 : 400 }}>{po.status === "RECEIVED" ? fmtRp(remaining) : "-"}</td>
                  <td><PoStatusBadge status={po.status} /></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {po.status === "ORDERED" && <button className="btn btn-primary" onClick={() => receivePO(po)}><PackageCheck size={13} /> Terima</button>}
                    {po.status === "ORDERED" && <button className="btn btn-outline" onClick={() => cancelPO(po)}>Batal</button>}
                    {po.status === "RECEIVED" && remaining > 0 && <button className="btn btn-outline" onClick={() => setPayFor(po)}>Bayar</button>}
                  </td>
                </tr>
              );
            })}
            {data.purchaseOrders.length === 0 && <tr><td colSpan={8}><EmptyHint text="Belum ada purchase order." /></td></tr>}
          </tbody>
        </table>
      </div>
      {formOpen && <PurchaseOrderForm suppliers={data.suppliers} products={data.products} onClose={() => setFormOpen(false)} onSave={createPO} />}
      {payFor && (
        <Modal onClose={() => setPayFor(null)} title={`Bayar hutang — ${payFor.poNo}`} width={340}>
          <PayAmountForm max={payFor.total - payFor.paidAmount} onConfirm={(amt) => payPO(payFor, amt)} />
        </Modal>
      )}
    </div>
  );
}

function PoStatusBadge({ status }) {
  const map = {
    ORDERED: { bg: "#FDF1DE", c: "var(--accent-dark)", label: "Dipesan" },
    RECEIVED: { bg: "var(--primary-light)", c: "var(--primary-dark)", label: "Diterima" },
    CANCELLED: { bg: "var(--danger-bg)", c: "var(--danger)", label: "Dibatalkan" },
  };
  const s = map[status];
  return <span className="badge" style={{ background: s.bg, color: s.c }}>{s.label}</span>;
}

function PurchaseOrderForm({ suppliers, products, onClose, onSave }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [items, setItems] = useState([{ productId: "", qty: "", buyPrice: "" }]);

  function updateItem(idx, key, val) {
    setItems((its) => its.map((it, i) => {
      if (i !== idx) return it;
      const next = { ...it, [key]: val };
      if (key === "productId") {
        const p = products.find((x) => x.id === val);
        if (p) next.buyPrice = p.buyPrice;
      }
      return next;
    }));
  }
  function addRow() { setItems((its) => [...its, { productId: "", qty: "", buyPrice: "" }]); }
  function removeRow(idx) { setItems((its) => its.filter((_, i) => i !== idx)); }

  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.buyPrice) || 0), 0);

  return (
    <Modal onClose={onClose} title="Buat purchase order" width={520}>
      <label className="label">Supplier</label>
      <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={{ marginBottom: 12 }}>
        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <label className="label">Produk</label>
      <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 6 }}>
            <select className="input" value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} style={{ flex: 2 }}>
              <option value="">Pilih produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input" type="number" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} style={{ flex: 1 }} />
            <input className="input" type="number" placeholder="Harga beli" value={it.buyPrice} onChange={(e) => updateItem(idx, "buyPrice", e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => removeRow(idx)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline" onClick={addRow}><Plus size={13} /> Tambah baris</button>
      <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, textAlign: "right" }}>Total: {fmtRp(total)}</div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => onSave(supplierId, items)}>Buat PO</button>
    </Modal>
  );
}

/* ----------------------------- Retur ----------------------------- */

function ReturView({ data, setData, session, showToast, storeId }) {
  const [search, setSearch] = useState("");
  const [selectedTrx, setSelectedTrx] = useState(null);
  const canApprove = ["OWNER", "ADMIN", "SUPERVISOR"].includes(session.role);

  const matchedTrx = search.length >= 2
    ? data.transactions.filter((t) => t.status !== "VOID" && t.trxNo.toLowerCase().includes(search.toLowerCase()))
    : [];

  function createReturn(trx, items, reason) {
    const valid = items.filter((i) => i.qty > 0);
    if (valid.length === 0) { showToast("Pilih minimal 1 item untuk retur", "error"); return; }
    const refundAmount = valid.reduce((s, i) => {
      const trxItem = trx.items.find((x) => x.productId === i.productId);
      return s + (trxItem ? (trxItem.price * i.qty) : 0);
    }, 0);
    const returnRec = {
      id: uid("ret"), returnNo: `RET-${todayStr().replace(/-/g, "")}-${String(data.returns.length + 1).padStart(3, "0")}`,
      trxId: trx.id, trxNo: trx.trxNo, storeId: trx.storeId, date: todayStr(), items: valid, reason, refundAmount,
      status: canApprove ? "APPROVED" : "PENDING", requestedBy: session.username,
    };
    setData((d) => {
      if (!canApprove) {
        return { ...d, returns: [returnRec, ...d.returns] };
      }
      const products = d.products.map((p) => {
        const item = valid.find((i) => i.productId === p.id);
        return item ? adjustStock(p, trx.storeId, item.qty) : p;
      });
      const movements = valid.map((i) => ({
        id: uid("mv"), date: todayStr(), productId: i.productId, storeId: trx.storeId, type: "RETURN",
        qtyIn: i.qty, qtyOut: 0, note: `Retur ${trx.trxNo}`, user: session.username, trxRef: trx.id,
      }));
      return {
        ...d, products, stockMovements: [...movements, ...d.stockMovements],
        returns: [returnRec, ...d.returns],
        cashMovements: [{ id: uid("cash"), date: todayStr(), type: "OUT", category: "Refund retur", amount: refundAmount, note: returnRec.returnNo, user: session.username, shiftId: null, storeId: trx.storeId }, ...d.cashMovements],
      };
    });
    setSelectedTrx(null);
    setSearch("");
    showToast(canApprove ? "Retur diproses, stok dikembalikan" : "Permintaan retur dikirim untuk approval");
  }

  function approveReturn(ret, approve) {
    setData((d) => {
      if (!approve) {
        return { ...d, returns: d.returns.map((r) => (r.id === ret.id ? { ...r, status: "REJECTED" } : r)) };
      }
      const products = d.products.map((p) => {
        const item = ret.items.find((i) => i.productId === p.id);
        return item ? adjustStock(p, ret.storeId, item.qty) : p;
      });
      const movements = ret.items.map((i) => ({
        id: uid("mv"), date: todayStr(), productId: i.productId, storeId: ret.storeId, type: "RETURN",
        qtyIn: i.qty, qtyOut: 0, note: `Retur ${ret.trxNo}`, user: session.username, trxRef: ret.trxId,
      }));
      return {
        ...d, products, stockMovements: [...movements, ...d.stockMovements],
        returns: d.returns.map((r) => (r.id === ret.id ? { ...r, status: "APPROVED" } : r)),
        cashMovements: [{ id: uid("cash"), date: todayStr(), type: "OUT", category: "Refund retur", amount: ret.refundAmount, note: ret.returnNo, user: session.username, shiftId: null, storeId: ret.storeId }, ...d.cashMovements],
      };
    });
    showToast(approve ? "Retur disetujui" : "Retur ditolak");
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <label className="label">Cari transaksi untuk diretur (ketik no. transaksi)</label>
        <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Contoh: TRX-20260911-0001" />
        {matchedTrx.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {matchedTrx.slice(0, 5).map((t) => (
              <div key={t.id} onClick={() => setSelectedTrx(t)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }} className="trx-hit">
                <span>{t.trxNo} · {t.date} · {t.cashierName}</span>
                <span style={{ fontWeight: 700 }}>{fmtRp(t.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Riwayat retur</div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>No. retur</th><th>Transaksi</th><th>Tanggal</th><th>Alasan</th><th>Refund</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.returns.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.returnNo}</td>
                <td>{r.trxNo}</td>
                <td>{r.date}</td>
                <td style={{ color: "var(--muted)" }}>{r.reason}</td>
                <td>{fmtRp(r.refundAmount)}</td>
                <td><ReturnStatusBadge status={r.status} /></td>
                <td>
                  {r.status === "PENDING" && canApprove && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: "5px 9px" }} onClick={() => approveReturn(r, true)}>Setujui</button>
                      <button className="btn btn-outline" style={{ padding: "5px 9px" }} onClick={() => approveReturn(r, false)}>Tolak</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.returns.length === 0 && <tr><td colSpan={7}><EmptyHint text="Belum ada retur." /></td></tr>}
          </tbody>
        </table>
      </div>

      {selectedTrx && (
        <NewReturnModal
          trx={selectedTrx}
          alreadyReturned={data.returns.filter((r) => r.trxId === selectedTrx.id && r.status !== "REJECTED").reduce((map, r) => {
            r.items.forEach((i) => { map[i.productId] = (map[i.productId] || 0) + i.qty; });
            return map;
          }, {})}
          onClose={() => setSelectedTrx(null)}
          onSave={createReturn}
          isDirect={canApprove}
        />
      )}
      <style>{`.trx-hit:hover{background:var(--bg);}`}</style>
    </div>
  );
}

function ReturnStatusBadge({ status }) {
  const map = {
    PENDING: { bg: "#FDF1DE", c: "var(--accent-dark)", label: "Menunggu approval" },
    APPROVED: { bg: "var(--primary-light)", c: "var(--primary-dark)", label: "Disetujui" },
    REJECTED: { bg: "var(--danger-bg)", c: "var(--danger)", label: "Ditolak" },
  };
  const s = map[status];
  return <span className="badge" style={{ background: s.bg, color: s.c }}>{s.label}</span>;
}

function NewReturnModal({ trx, onClose, onSave, isDirect, alreadyReturned }) {
  const maxes = trx.items.map((i) => Math.max(0, i.qty - (alreadyReturned[i.productId] || 0)));
  const [qtys, setQtys] = useState(trx.items.map(() => 0));
  const [reason, setReason] = useState("");

  function setQty(idx, val, max) {
    const v = Math.max(0, Math.min(max, Number(val) || 0));
    setQtys((q) => q.map((x, i) => (i === idx ? v : x)));
  }

  function submit() {
    if (!reason.trim()) return;
    const items = trx.items.map((i, idx) => ({ productId: i.productId, qty: qtys[idx] }));
    onSave(trx, items, reason);
  }

  const refund = trx.items.reduce((s, i, idx) => s + i.price * qtys[idx], 0);

  return (
    <Modal onClose={onClose} title={`Retur — ${trx.trxNo}`} width={420}>
      <div style={{ marginBottom: 10 }}>
        {trx.items.map((i, idx) => (
          <div key={i.productId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                Dibeli {i.qty} · {fmtRp(i.price)}{maxes[idx] < i.qty && ` · sisa bisa diretur ${maxes[idx]}`}
              </div>
            </div>
            <input className="input" type="number" min={0} max={maxes[idx]} value={qtys[idx]} disabled={maxes[idx] === 0} onChange={(e) => setQty(idx, e.target.value, maxes[idx])} style={{ width: 70 }} />
          </div>
        ))}
      </div>
      <label className="label">Alasan retur</label>
      <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Contoh: produk cacat" />
      <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, textAlign: "right" }}>Estimasi refund: {fmtRp(refund)}</div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} disabled={!reason.trim() || refund === 0} onClick={submit}>
        {isDirect ? "Proses retur" : "Kirim untuk approval"}
      </button>
    </Modal>
  );
}

/* ----------------------------- Transfer Stok ----------------------------- */

function TransferView({ data, setData, session, showToast, storeId }) {
  const [fromStore, setFromStore] = useState(storeId || data.stores[0]?.id || "");
  const [toStore, setToStore] = useState(data.stores.find((s) => s.id !== storeId)?.id || "");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const sourceProduct = data.products.find((p) => p.id === productId);
  const availableStock = sourceProduct ? getStock(sourceProduct, fromStore) : 0;

  function submitTransfer() {
    const q = Number(qty);
    if (fromStore === toStore) { showToast("Toko asal dan tujuan harus berbeda", "error"); return; }
    if (!productId) { showToast("Pilih produk", "error"); return; }
    if (!q || q <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    if (q > availableStock) { showToast(`Stok di toko asal hanya ${availableStock} ${sourceProduct.unit}`, "error"); return; }

    const fromName = data.stores.find((s) => s.id === fromStore)?.name || "-";
    const toName = data.stores.find((s) => s.id === toStore)?.name || "-";
    const transferNo = `TRF-${todayStr().replace(/-/g, "")}-${String(data.stockTransfers.length + 1).padStart(3, "0")}`;

    setData((d) => ({
      ...d,
      products: d.products.map((p) => {
        if (p.id !== productId) return p;
        return adjustStock(adjustStock(p, fromStore, -q), toStore, q);
      }),
      stockMovements: [
        { id: uid("mv"), date: todayStr(), productId, storeId: fromStore, type: "TRANSFER_OUT", qtyIn: 0, qtyOut: q, note: `${transferNo} → ${toName}`, user: session.username, trxRef: null },
        { id: uid("mv"), date: todayStr(), productId, storeId: toStore, type: "TRANSFER_IN", qtyIn: q, qtyOut: 0, note: `${transferNo} ← ${fromName}`, user: session.username, trxRef: null },
        ...d.stockMovements,
      ],
      stockTransfers: [{
        id: uid("trf"), transferNo, date: todayStr(), productId, qty: q, fromStore, toStore, note, user: session.username,
      }, ...d.stockTransfers],
    }));
    setQty("");
    setNote("");
    showToast("Transfer stok berhasil");
  }

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 16, maxWidth: 520 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Transfer stok antar toko</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label className="label">Dari toko</label>
            <select className="input" value={fromStore} onChange={(e) => setFromStore(e.target.value)}>
              {data.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ke toko</label>
            <select className="input" value={toStore} onChange={(e) => setToStore(e.target.value)}>
              {data.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <label className="label">Produk</label>
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)} style={{ marginBottom: 10 }}>
          <option value="">Pilih produk</option>
          {data.products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {sourceProduct && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            Stok tersedia di toko asal: <b>{availableStock} {sourceProduct.unit}</b>
          </div>
        )}
        <label className="label">Jumlah</label>
        <input className="input" type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} style={{ marginBottom: 10 }} />
        <label className="label">Catatan</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsional" style={{ marginBottom: 14 }} />
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submitTransfer}>
          <ArrowLeftRight size={14} /> Kirim transfer
        </button>
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Riwayat transfer</div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>No. Transfer</th><th>Tanggal</th><th>Produk</th><th>Qty</th><th>Dari</th><th>Ke</th><th>Catatan</th></tr></thead>
          <tbody>
            {data.stockTransfers.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.transferNo}</td>
                <td>{t.date}</td>
                <td>{data.products.find((p) => p.id === t.productId)?.name || "-"}</td>
                <td>{t.qty}</td>
                <td>{data.stores.find((s) => s.id === t.fromStore)?.name || "-"}</td>
                <td>{data.stores.find((s) => s.id === t.toStore)?.name || "-"}</td>
                <td style={{ color: "var(--muted)" }}>{t.note || "-"}</td>
              </tr>
            ))}
            {data.stockTransfers.length === 0 && <tr><td colSpan={7}><EmptyHint text="Belum ada transfer stok." /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
