import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Banknote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

import {
  getAccountData,
  setDepAmount,
  setMonthTarget,
  setSavingTarget,
} from "@/services/banking";

import { toast } from "react-hot-toast";

export default function Account({ userId }) {
  const [monthlyTarget, setMonthlyTargetInput] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [savingTargetAmount, setSavingTargetAmount] = useState("");
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch current account data
  async function fetchAccountData() {
    if (!userId) return;
    try {
      const data = await getAccountData(userId);
      setAccountData(data);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      toast.error("Failed to load account data");
    }
  }

  useEffect(() => {
    fetchAccountData();
  }, [userId]);

  // 📌 Monthly Target Handler
  async function handleSetMonthTarget() {
    if (!monthlyTarget || Number(monthlyTarget) <= 0) {
      return toast.error("Please enter a valid monthly target");
    }

    setLoading(true);
    try {
      console.log("[SetMonthTarget]", monthlyTarget);
      await setMonthTarget(monthlyTarget, accountData, userId);
      toast.success("Monthly target set");
      setMonthlyTargetInput("");
      await fetchAccountData();
    } catch (error) {
      console.error("❌ Failed to set monthly target:", error);
      toast.error("Failed to set monthly target");
    } finally {
      setLoading(false);
    }
  }

  // 💰 Deposit Handler
  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) {
      return toast.error("Please enter a valid deposit amount");
    }

    setLoading(true);
    try {
      console.log("[Deposit]", depositAmount);
      await setDepAmount(depositAmount, userId);
      toast.success("Deposit successful");
      setDepositAmount("");
      await fetchAccountData();
    } catch (error) {
      console.error("❌ Failed to deposit:", error);
      toast.error("Failed to deposit");
    } finally {
      setLoading(false);
    }
  }

  // 🎯 Saving Target Handler
  async function handleSetSavingTarget() {
    if (!savingTargetAmount || Number(savingTargetAmount) <= 0) {
      return toast.error("Please enter a valid saving target");
    }

    setLoading(true);
    try {
      console.log("[SetSavingTarget]", savingTargetAmount);
      await setSavingTarget(savingTargetAmount, accountData, userId);
      toast.success("Saving target set");
      setSavingTargetAmount("");
      await fetchAccountData();
    } catch (error) {
      console.error("❌ Failed to set saving target:", error);
      toast.error("Failed to set saving target");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <Button disabled={loading}>
            <Banknote className="mr-2" /> Account
          </Button>
        </DialogTrigger>

        <DialogContent>
          <Card className="w-full max-w-md border-none">
            <CardHeader>
              <CardTitle>Saving Account</CardTitle>
              <CardDescription>Manage your monthly savings</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Monthly Target */}
              <div className="grid gap-2">
                <Label>Monthly Savings Target</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTargetInput(e.target.value)}
                    min={1}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSetMonthTarget}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Set Target
                  </Button>
                </div>
              </div>

              {/* Deposit */}
              <div className="grid gap-2">
                <Label>Deposit</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min={1}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleDeposit}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Deposit
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Saving Target */}
              <div className="grid gap-2">
                <Label>Saving Target</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    value={savingTargetAmount}
                    onChange={(e) => setSavingTargetAmount(e.target.value)}
                    min={1}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSetSavingTarget}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Set Saving Target
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
