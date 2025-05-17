import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config";
import { toast } from "react-hot-toast";

export default function DepositTable({ userId, setWithdrawalRefreshFlag }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [amount, setAmount] = useState("");
  const [target, setTarget] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState("");

  const MONTH_FORMAT = /^\d{4}-\d{2}$/;

  async function fetchDeposits() {
    if (!userId) return;
    setLoading(true);
    try {
      const userRef = doc(db, "accounts", userId);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        setDeposits([]);
        return;
      }
      const all = docSnap.data().monthlyAccountSavings || [];
      const clean = all.filter((entry) => MONTH_FORMAT.test(entry.month));
      setDeposits(clean);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load deposit data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) fetchDeposits();
  }, [userId]);

  function triggerRefresh() {
    if (typeof setWithdrawalRefreshFlag === "function") {
      setWithdrawalRefreshFlag((prev) =>
        typeof prev === "number" ? prev + 1 : undefined
      );
    }
  }

  async function handleSaveEdit() {
    if (!editingData) return;

    const newAmount = parseFloat(amount) || 0;
    const newTarget = parseFloat(target) || 0;
    const newMonthlyTarget = parseFloat(monthlyTarget) || 0;

    try {
      const userRef = doc(db, "accounts", userId);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      const updated = [...(data.monthlyAccountSavings || [])];

      const index = updated.findIndex((e) => e.month === editingData.month);
      if (index === -1) {
        toast.error("Month not found");
        return;
      }

      const old = updated[index];
      if (
        old.depositAmount === newAmount &&
        old.savingTarget === newTarget &&
        old.monthlyTarget === newMonthlyTarget
      ) {
        toast("No changes made.");
        return;
      }

      updated[index] = {
        ...old,
        depositAmount: newAmount,
        savingTarget: newTarget,
        monthlyTarget: newMonthlyTarget,
      };

      await updateDoc(userRef, { monthlyAccountSavings: updated });
      toast.success("Deposit updated successfully");
      setEditingData(null);
      await fetchDeposits();
      triggerRefresh(); // ✅ refresh graph or counter
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update deposit");
    }
  }

  async function handleDelete(monthToDelete) {
    if (!confirm(`Delete deposit for ${monthToDelete}?`)) return;

    try {
      const userRef = doc(db, "accounts", userId);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();

      const updated = (data.monthlyAccountSavings || []).filter(
        (entry) => entry.month !== monthToDelete
      );

      await updateDoc(userRef, { monthlyAccountSavings: updated });
      toast.success("Deposit deleted");
      await fetchDeposits();
      triggerRefresh(); // ✅ refresh graph or counter
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete deposit");
    }
  }

  return (
    <div>
      <h1 className="my-3 italic text-lg font-semibold">Deposits</h1>

      <div className="overflow-y-auto max-h-[50vh]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Deposit</th>
              <th className="p-2 text-left">Saving Target</th>
              <th className="p-2 text-left">Monthly Target</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : deposits.length > 0 ? (
              deposits.map((entry, index) => (
                <tr key={index}>
                  <td className="p-2">{entry.month}</td>
                  <td className="p-2">₱{entry.depositAmount || 0}</td>
                  <td className="p-2">₱{entry.savingTarget || 0}</td>
                  <td className="p-2">₱{entry.monthlyTarget || 0}</td>
                  <td className="p-2">
                    <Badge variant="secondary">deposit</Badge>
                  </td>
                  <td className="p-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingData(entry);
                        setAmount(entry.depositAmount?.toString() || "0");
                        setTarget(entry.savingTarget?.toString() || "0");
                        setMonthlyTarget(entry.monthlyTarget?.toString() || "0");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(entry.month)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No deposits yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📝 Edit Modal */}
      {editingData && (
        <Dialog open onOpenChange={() => setEditingData(null)}>
          <DialogContent className="space-y-4">
            <h2 className="text-lg font-semibold">
              Edit Deposit for {editingData.month}
            </h2>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Deposit Amount"
            />
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Saving Target"
            />
            <Input
              type="number"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              placeholder="Monthly Target"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingData(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
