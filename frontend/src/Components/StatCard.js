import CountUp from "react-countup";

export default function StatCard({ label, value, suffix }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-3xl font-extrabold text-blue-600">
        <CountUp end={value} duration={2.5} separator="," suffix={suffix || ""} />
      </div>
      <p className="mt-1 text-sm font-medium">{label}</p>
    </div>
  );
}
