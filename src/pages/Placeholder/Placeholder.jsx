function Placeholder({ title }) {
  return (
    <div>
      <h1 className="page-title">
        {title}
      </h1>

      <p className="page-description">
        Este módulo será desarrollado posteriormente.
      </p>

      <section
        className="surface"
        style={{
          padding: "30px",
        }}
      >
        <strong>
          Módulo preparado para desarrollo
        </strong>
      </section>
    </div>
  );
}

export default Placeholder;