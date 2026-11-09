export default function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <div className="container">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children && <div style={{ marginTop: 32 }}>{children}</div>}
      </div>
    </div>
  );
}
