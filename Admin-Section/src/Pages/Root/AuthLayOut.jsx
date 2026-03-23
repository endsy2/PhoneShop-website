import { logo } from "../../Assets";
import { Outlet } from "react-router-dom";

const AuthLayOut = () => {
  return (
    // <>
    //   <nav>
    //     <header>
    //       <img src={logo} alt="Nav logo" className="p-16 w-70 lg:w-70" />
    //     </header>
    //   </nav>
    //   <main>
    //     <Outlet />
    //   </main>
    // </>
    <>
  {/* <nav className="w-full">
    <header className="flex justify px-6 py-4">
      <img src={logo} alt="Nav logo" className="w-40 lg:w-48" />
    </header>
  </nav>

  <main className="flex justify-center items-center min-h-[80vh]">
    <Outlet />
  </main> */}
  <nav className="w-full">
  <header className="px-10 py-6">
    <img src={logo} alt="Nav logo" className="w-56 lg:w-72" />
  </header>
</nav>

<main className="flex justify-center items-center min-h-[80vh]">
  <div className="w-full max-w-lg scale-110">
    <Outlet />
  </div>
</main>
</>

  );
};

export default AuthLayOut;
