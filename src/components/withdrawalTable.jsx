import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  getDoc,
  doc as docRef,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config";
import { toast } from "react-hot-toast";
import formatTime from "@/utils/formatTime";

export default function WithdrawalTable({
  userId,
  withdrawalRefreshFlag = 0,
  setWithdrawalRefreshFlag = () => {},
}) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [editingData, setEditingData] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchWithdrawals();
  }, [userId, withdrawalRefreshFlag]);

  async function fetchWithdrawals() {
    try {
      const q = query(collection(db, "withdraw"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(data);
    } catch (error) {
      toast.error("Failed to load withdrawals");
      console.error(error);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this withdrawal?")) return;
    setLoading(true);
    try {
      await deleteDoc(docRef(db, "withdraw", id));
      toast.success("Withdrawal deleted");
      await fetchWithdrawals();
      setWithdrawalRefreshFlag((prev) => prev + 1);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete withdrawal");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit() {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setLoading(true);
    try {
      const docReference = docRef(db, "withdraw", editingData.id);
      const originalSnap = await getDoc(docReference);
      const original = originalSnap.data();

      const noChanges =
        parsedAmount === Number(original.withdrawalAmount) &&
        reason.trim() === (original.reason || "-");

      if (noChanges) {
        toast("No changes made.");
        setEditingData(null);
        return;
      }

      await updateDoc(docReference, {
        withdrawalAmount: parsedAmount,
        reason: reason.trim() || "-",
      });

      toast.success("Withdrawal updated");
      setEditingData(null);
      await fetchWithdrawals();
      setWithdrawalRefreshFlag((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to update withdrawal");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="my-3 italic">Withdrawals</h1>

      <div className="overflow-y-auto max-h-[50vh]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Reason</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {withdrawals.length ? (
              withdrawals.map((data) => (
                <tr key={data.id}>
                  <td className="p-2">{formatTime(data?.date)}</td>
                  <td className="p-2">₱{data?.withdrawalAmount}</td>
                  <td className="p-2">
                    <Badge variant="destructive">withdrawal</Badge>
                  </td>
                  <td className="p-2">{data?.reason || "-"}</td>
                  <td className="p-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingData(data);
                        setAmount(String(data.withdrawalAmount));
                        setReason(data.reason || "");
                      }}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(data.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No withdrawals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingData && (
        <Dialog open onOpenChange={(open) => !loading && !open && setEditingData(null)}>
          <DialogContent className="space-y-4">
            <h2 className="text-lg font-semibold">Edit Withdrawal</h2>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="New amount"
              min={1}
              disabled={loading}
            />
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
              disabled={loading}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => !loading && setEditingData(null)}
                variant="ghost"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
