import { useRef } from "react";
import Graph from "@/components/Graph";
import Withdraw from "@/components/Withdraw";
import DepositTable from "@/components/DepositTable";

export default function Dashboard({ userId }) {
  const graphRef = useRef();

  // This triggers Graph refresh manually
  const refreshGraph = () => {
    graphRef.current?.refreshGraph();
  };

  return (
    <div className="space-y-6">
      <Withdraw userId={userId} setWithdrawalRefreshFlag={refreshGraph} />
      <DepositTable userId={userId} setWithdrawalRefreshFlag={refreshGraph} />
      <Graph userId={userId} ref={graphRef} />
    </div>
  );
}
