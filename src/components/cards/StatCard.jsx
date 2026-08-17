import "./StatCard.css";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  type = "primary",
}) {
  return (
    <article className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <span>{title}</span>

        <div className="stat-card-icon">
          <Icon size={20} />
        </div>
      </div>

      <strong className="stat-card-value">
        {value}
      </strong>

      <span className="stat-card-description">
        {description}
      </span>
    </article>
  );
}

export default StatCard;