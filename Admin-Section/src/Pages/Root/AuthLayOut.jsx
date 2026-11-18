import { Outlet } from "react-router-dom";
import { logo } from "../../Assets";

const AuthLayOut = () => (
  <div className="flex min-h-screen flex-col items-center bg-page px-4 pt-20">
    <img src={logo} alt="Genius Store" className="h-10 w-auto" />
    <p className="mt-3 text-sm text-ink-3">Store admin</p>
    <main className="mt-10 w-full max-w-sm">
      <Outlet />
    </main>
  </div>
);

export default AuthLayOut;
