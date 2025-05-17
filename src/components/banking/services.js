import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config";

function getCurrentMonthName() {
  return new Date().toLocaleString("default", { month: "long" });
}

// ✅ Add or update depositAmount for the current month
export async function setDepAmount(amount, userId) {
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found");

  const data = userSnap.data();
  const month = getCurrentMonthName();
  const monthlyList = [...(data.monthlyAccountSavings || [])];

  const entry = monthlyList.find((e) => e.month === month);
  if (entry) {
    entry.depositAmount = (parseFloat(entry.depositAmount) || 0) + parseFloat(amount);
  } else {
    monthlyList.push({
      month,
      depositAmount: parseFloat(amount),
      monthlyTarget: 0,
      savingTarget: 0,
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: monthlyList });
}

// ✅ Add or update monthlyTarget
export async function setMonthTarget(target, accountData, userId) {
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const month = getCurrentMonthName();
  const monthlyList = [...(data.monthlyAccountSavings || [])];

  const entry = monthlyList.find((e) => e.month === month);
  if (entry) {
    entry.monthlyTarget = parseFloat(target);
  } else {
    monthlyList.push({
      month,
      monthlyTarget: parseFloat(target),
      depositAmount: 0,
      savingTarget: 0,
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: monthlyList });
}

// ✅ Add or update savingTarget
export async function setSavingTarget(target, accountData, userId) {
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const month = getCurrentMonthName();
  const monthlyList = [...(data.monthlyAccountSavings || [])];

  const entry = monthlyList.find((e) => e.month === month);
  if (entry) {
    entry.savingTarget = parseFloat(target);
  } else {
    monthlyList.push({
      month,
      monthlyTarget: 0,
      depositAmount: 0,
      savingTarget: parseFloat(target),
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: monthlyList });
}
