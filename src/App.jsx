import { useEffect, useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // ✅ FIXED
import { auth } from "./config";
import { Button } from "./components/ui/button";
import { LogOutIcon } from "lucide-react";
import Actions from "./components/banking";
import { Toaster } from "react-hot-toast";
import DepositTable from "./components/depositTable";
import WithdrawalTable from "./components/withdrawalTable";
import Graph from "./components/Graph";

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/sign-in");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  function signOutHandler() {
    signOut(auth)
      .then(() => navigate("/sign-in"))
      .catch((err) => console.error(err));
  }

  return (
    <>
      <Toaster />
      <div className="my-4 mx-2 flex justify-between items-center">
        <ModeToggle />
        <Button onClick={signOutHandler} variant="destructive" aria-label="Sign Out">
          <LogOutIcon />
        </Button>
      </div>

      <div className="my-4 mx-4 flex flex-col">
        <div className="flex md:items-center mx-5">
          <Actions userId={user?.uid} />
        </div>

        <div className="mx-auto md:w-[950px] flex flex-col md:flex-row gap-4 mt-[17px] space-y-5 md:space-y-0">
          <div className="flex flex-col space-y-6 mx-4 md:w-2/3">
            <WithdrawalTable
              userId={user?.uid}
              withdrawalRefreshFlag={refreshFlag}
              setWithdrawalRefreshFlag={setRefreshFlag}
            />
            <hr />
            <DepositTable
              userId={user?.uid}
              setWithdrawalRefreshFlag={setRefreshFlag}
            />
          </div>

          <div className="mt-4 md:mt-0 md:w-1/3">
            <Graph userId={user?.uid} key={refreshFlag} />
          </div>
        </div>
      </div>
    </>
  );
}
