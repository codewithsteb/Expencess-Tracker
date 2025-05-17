export async function setMonthTarget(amount, accountData, userId) {
  const userDocRef = doc(db, "accounts", userId);
  const userSnap = await getDoc(userDocRef);
  const data = userSnap.data();
  const month = new Date().toISOString().slice(0, 7);

  const updatedMonthly = [...(data.monthlyAccountSavings || [])];
  const monthEntry = updatedMonthly.find((entry) => entry.month === month);

  if (monthEntry) {
    monthEntry.monthlyTarget = parseFloat(amount);
  } else {
    updatedMonthly.push({
      month,
      monthlyTarget: parseFloat(amount),
      depositAmount: 0,
      savingTarget: 0,
    });
  }

  await updateDoc(userDocRef, {
    monthlyAccountSavings: updatedMonthly,
  });
}
