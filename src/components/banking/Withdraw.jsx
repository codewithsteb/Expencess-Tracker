import { HandCoinsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/config";
import { useNavigate } from "react-router";

export default function Withdraw({
  userId,
  withdrawalRefreshFlag,
  setWithdrawalRefreshFlag,
}) {
  const navigate = useNavigate();
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [reason, setReason] = useState("");
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWithdrawals, setCurrentWithdrawals] = useState(0);

  const monthKey = new Date().toISOString().slice(0, 7);

  async function getAccountData() {
    const docRef = doc(db, "accounts", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setAccountData(docSnap.data());
    }
  }

  async function getTotalWithdrawalsForMonth(monthKey) {
    const q = query(collection(db, "withdraw"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const entryMonth = new Date(data.date?.seconds * 1000).toISOString().slice(0, 7);
      if (entryMonth === monthKey) {
        total += Number(data.withdrawalAmount) || 0;
      }
    });
    return total;
  }

  useEffect(() => {
    if (userId) getAccountData();
  }, [userId]);

  useEffect(() => {
    async function fetchWithdrawals() {
      const total = await getTotalWithdrawalsForMonth(monthKey);
      setCurrentWithdrawals(total);
    }
    if (userId) fetchWithdrawals();
  }, [userId, accountData, withdrawalRefreshFlag]);

  const currentDeposit =
    accountData?.monthlyAccountSavings?.find((entry) => entry.month === monthKey)?.depositAmount || 0;
  const currentNetBalance = currentDeposit - currentWithdrawals;

  async function executeWithdrawal(e) {
    e.preventDefault();
    const withdrawalAmt = Number(withdrawalAmount);

    if (!withdrawalAmt || withdrawalAmt <= 0) return toast.error("Enter a valid amount");
    if (!accountData) return toast.error("Account not loaded");

    setLoading(true);
    try {
      const accountRef = doc(db, "accounts", userId);
      const withdrawRef = collection(db, "withdraw");

      await runTransaction(db, async (transaction) => {
        const accountSnap = await transaction.get(accountRef);
        if (!accountSnap.exists()) throw new Error("Account not found");

        const data = accountSnap.data();
        const savingsArray = [...(data.monthlyAccountSavings || [])];

        const entryIndex = savingsArray.findIndex((e) => e.month === monthKey);
        let entry = {
          month: monthKey,
          depositAmount: 0,
          monthlyTarget: 0,
          savingTarget: 0,
        };

        if (entryIndex !== -1) {
          entry = { ...entry, ...savingsArray[entryIndex] };
        }

        const net = Number(entry.depositAmount || 0) - Number(currentWithdrawals);
        if (withdrawalAmt > net) throw new Error("Insufficient funds for this month");

        const newWithdrawRef = doc(withdrawRef);
        transaction.set(newWithdrawRef, {
          userId,
          withdrawalAmount: withdrawalAmt,
          reason: reason || "-",
          date: Timestamp.now(),
        });

        // ❌ DO NOT subtract withdrawal from depositAmount
        // entry.depositAmount -= withdrawalAmt; <-- removed

        if (entryIndex !== -1) {
          savingsArray[entryIndex] = entry;
        } else {
          savingsArray.push(entry);
        }

        transaction.update(accountRef, { monthlyAccountSavings: savingsArray });
      });

      toast.success("Withdrawal successful");
      setWithdrawalAmount("");
      setReason("");
      await getAccountData();
      setWithdrawalRefreshFlag((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to withdraw");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <Button disabled={loading}>
            <HandCoinsIcon className="mr-2" /> Withdraw
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Card className="w-full max-w-md border-none">
            <CardHeader>
              <CardTitle>Withdraw</CardTitle>
              <CardDescription>Withdraw from account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 font-medium">
                <Button variant="ghost" disabled>
                  Balance (This Month)
                </Button>
                <span>₱{currentNetBalance.toFixed(2)}</span>
              </div>

              <form onSubmit={executeWithdrawal} className="space-y-4">
                <div>
                  <Label htmlFor="withdrawAmount">Withdraw Amount</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="100"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min={1}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" disabled={loading}>
                  {loading ? "Processing..." : "Withdraw"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
