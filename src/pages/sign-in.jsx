import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { MountainIcon } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ FIXED
import { auth, db } from "@/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export default function SignIn() {
  const navigate = useNavigate();

  const onSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "accounts", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const { displayName, uid, photoURL } = user;
        const account = {
          name: displayName,
          userId: uid,
          depositAmount: 0,
          photo: photoURL,
          savingTarget: 0,
          monthlyAccountSavings: [],
        };
        await setDoc(doc(db, "accounts", uid), account);
      }

      navigate("/");
    } catch (error) {
      console.log("Google sign-in error:", error.message);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="space-y-4">
          <MountainIcon className="mx-auto h-12 w-12" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to ExpenCessTracker
          </h1>
          <p className="text-muted-foreground">
            Effortlessly track your expenses and stay on top of your finances.
          </p>
        </div>

        <div className="mt-6">
          <Button
            onClick={onSignIn}
            className="flex w-full items-center justify-center gap-2"
          >
            Sign In with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
