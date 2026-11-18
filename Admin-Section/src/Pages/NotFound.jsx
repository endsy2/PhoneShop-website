import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center">
    <p className="price text-sm text-ink-3">404</p>
    <h1 className="mt-2 text-2xl">This page doesn&apos;t exist</h1>
    <Link to="/dashboard" className="btn btn-dark mt-6">Back to dashboard</Link>
  </div>
);

export default NotFound;
