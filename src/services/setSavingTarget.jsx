export async function setSavingTarget(amount, userId) {
  const userDocRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userDocRef);
  if (!userSnap.exists()) throw new Error("User account not found");

  const data = userSnap.data();
  const month = new Date().toISOString().slice(0, 7);

  const updatedMonthly = [...(data.monthlyAccountSavings || [])];
  const monthEntry = updatedMonthly.find((entry) => entry.month === month);

  if (monthEntry) {
    monthEntry.savingTarget = parseFloat(amount);
  } else {
    updatedMonthly.push({
      month,
      savingTarget: parseFloat(amount),
      depositAmount: 0,
      monthlyTarget: 0,
    });
  }

  await updateDoc(userDocRef, {
    monthlyAccountSavings: updatedMonthly,
  });
}
