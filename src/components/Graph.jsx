import { db } from "@/config";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Graph = forwardRef(({ userId }, ref) => {
  const [graphData, setGraphData] = useState([]);

  const COLORS = ["#8884d8", "#82ca9d", "#007aff", "#FF6B6B"];

  function formatMonthKey(date) {
    return new Date(date).toISOString().slice(0, 7); // "YYYY-MM"
  }

  async function fetchData() {
    if (!userId) return;

    try {
      const accountQuery = query(collection(db, "accounts"), where("userId", "==", userId));
      const accountSnap = await getDocs(accountQuery);
      const account = accountSnap.docs.length > 0 ? accountSnap.docs[0].data() : null;

      const withdrawQuery = query(collection(db, "withdraw"), where("userId", "==", userId));
      const withdrawSnap = await getDocs(withdrawQuery);
      const withdrawals = withdrawSnap.docs.map(doc => doc.data());

      if (!account?.monthlyAccountSavings?.length) {
        setGraphData([]);
        return;
      }

      // Group withdrawals by month in "YYYY-MM"
      const withdrawalsByMonth = withdrawals.reduce((acc, w) => {
        if (!w.date?.seconds) return acc;
        const monthKey = formatMonthKey(w.date.seconds * 1000);
        const amount = parseFloat(w.withdrawalAmount || 0);
        if (!isNaN(amount)) {
          acc[monthKey] = (acc[monthKey] || 0) + amount;
        }
        return acc;
      }, {});

      const graph = account.monthlyAccountSavings
        .filter(entry => typeof entry.month === "string" && /^\d{4}-\d{2}$/.test(entry.month))
        .map(entry => {
          const month = entry.month;

          const depositAmount = parseFloat(entry.depositAmount || 0);
          const savingTarget = parseFloat(entry.savingTarget || 0);
          const monthlyTarget = parseFloat(entry.monthlyTarget || 0);
          const withdrawals = withdrawalsByMonth[month] || 0;
          const netDeposit = depositAmount - withdrawals;

          return {
            month,
            depositAmount,
            savingTarget,
            monthlyTarget,
            withdrawals,
            netDeposit,
          };
        })
        .filter(
          d =>
            d.netDeposit > 0 ||
            d.withdrawals > 0 ||
            d.savingTarget > 0 ||
            d.monthlyTarget > 0
        );

      setGraphData(graph);
    } catch (err) {
      console.error("Graph fetch error:", err);
      setGraphData([]);
    }
  }

  useImperativeHandle(ref, () => ({
    refreshGraph: fetchData,
  }));

  useEffect(() => {
    fetchData();
  }, [userId]);

  const formatCurrency = (value) =>
    `₱${(value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  if (!graphData.length) {
    return <p className="text-center text-muted">No savings activity yet.</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem",
        justifyContent: "center",
      }}
    >
      {graphData.map((data, idx) => {
        const pieData = [
          { name: "Net Deposit", value: Math.max(data.netDeposit, 0) },
          { name: "Saving Target", value: data.savingTarget },
          { name: "Monthly Target", value: data.monthlyTarget },
          { name: "Withdrawals", value: data.withdrawals },
        ];

        return (
          <div key={idx} style={{ width: "360px", textAlign: "center" }}>
            <div className="mb-2">
              <h3 className="font-semibold">{data.month}</h3>
              <p className="text-sm text-muted-foreground">
                Balance Remaining: {formatCurrency(data.netDeposit)}
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  isAnimationActive
                  animationDuration={1000}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
});

export default Graph;
