// Dashboard số liệu tổng quan cho manager/admin.
import { useEffect, useState } from "react";
import { panelService } from "../services/panelService";
import ErrorBox from "./ErrorBox";
import Loading from "./Loading";

export default function StatsDashboard({ title, endpoint }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    panelService.list(endpoint).then((d) => setStats(d.stats)).catch((e) => setError(e.message));
  }, [endpoint]);

  return (
    <section>
      <h1 className="page-title">{title}</h1>
      <ErrorBox message={error} />
      {!stats && !error ? <Loading /> : (
        <div className="stats">
          {stats?.map((s) => <div key={s.label} className="stat"><b>{s.value}</b><span>{s.label}</span></div>)}
        </div>
      )}
    </section>
  );
}
