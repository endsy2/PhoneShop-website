// Title row at the top of every admin page
const PageHeader = ({ title, description, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl tracking-[-0.01em]">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export default PageHeader;
