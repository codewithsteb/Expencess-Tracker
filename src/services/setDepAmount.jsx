import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config";

export async function setDepAmount(amount, userId) {
  const userDocRef = doc(db, "accounts", userId);
  let userSnap = await getDoc(userDocRef);

  // ✅ Create document if missing
  if (!userSnap.exists()) {
    await setDoc(userDocRef, {
      userId,
      monthlyAccountSavings: [],
    });
    console.log(`[setDepAmount] Created account for user: ${userId}`);
    userSnap = await getDoc(userDocRef); // refresh after creation
  }

  const data = userSnap.data();
  const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const updatedMonthly = [...(data.monthlyAccountSavings || [])];
  const monthEntry = updatedMonthly.find((entry) => entry.month === month);

  if (monthEntry) {
    monthEntry.depositAmount =
      (parseFloat(monthEntry.depositAmount) || 0) + parseFloat(amount);
  } else {
    updatedMonthly.push({
      month,
      depositAmount: parseFloat(amount),
      monthlyTarget: 0,
      savingTarget: 0,
    });
  }

  await updateDoc(userDocRef, {
    monthlyAccountSavings: updatedMonthly,
  });

  console.log(`[setDepAmount] Deposited ₱${amount} for ${month}`);
}
