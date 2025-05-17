import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config";

// YYYY-MM format
function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

// 🔒 Ensure user's account exists
async function ensureAccountExists(userId) {
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log("[ensureAccountExists] Created new account:", userId);
    await setDoc(userRef, {
      userId,
      monthlyAccountSavings: [],
    });
  }
}

// 📦 Get user account data
export async function getAccountData(userId) {
  const userRef = doc(db, "accounts", userId);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) throw new Error("Account not found");
  return docSnap.data();
}

// 💰 Deposit handling
export async function setDepAmount(amount, userId) {
  await ensureAccountExists(userId);
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const month = getCurrentMonthKey();
  const updatedMonthly = [...(data.monthlyAccountSavings || [])];

  const index = updatedMonthly.findIndex(entry => entry.month === month);
  if (index !== -1) {
    updatedMonthly[index].depositAmount =
      (parseFloat(updatedMonthly[index].depositAmount) || 0) + parseFloat(amount);
  } else {
    updatedMonthly.push({
      month,
      depositAmount: parseFloat(amount),
      monthlyTarget: 0,
      savingTarget: 0,
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: updatedMonthly });
  console.log("[setDepAmount] Updated month:", month);
}

// 🎯 Monthly Target
export async function setMonthTarget(target, accountData, userId) {
  await ensureAccountExists(userId);
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const month = getCurrentMonthKey();
  const updatedMonthly = [...(data.monthlyAccountSavings || [])];

  const index = updatedMonthly.findIndex(entry => entry.month === month);
  if (index !== -1) {
    updatedMonthly[index].monthlyTarget = parseFloat(target);
  } else {
    updatedMonthly.push({
      month,
      depositAmount: 0,
      monthlyTarget: parseFloat(target),
      savingTarget: 0,
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: updatedMonthly });
  console.log("[setMonthTarget] Updated month:", month);
}

// 💼 Saving Target
export async function setSavingTarget(target, accountData, userId) {
  await ensureAccountExists(userId);
  const userRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const month = getCurrentMonthKey();
  const updatedMonthly = [...(data.monthlyAccountSavings || [])];

  const index = updatedMonthly.findIndex(entry => entry.month === month);
  if (index !== -1) {
    updatedMonthly[index].savingTarget = parseFloat(target);
  } else {
    updatedMonthly.push({
      month,
      depositAmount: 0,
      monthlyTarget: 0,
      savingTarget: parseFloat(target),
    });
  }

  await updateDoc(userRef, { monthlyAccountSavings: updatedMonthly });
  console.log("[setSavingTarget] Updated month:", month);
}
