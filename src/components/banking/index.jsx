import Account from "./account";
import Withdraw from "./Withdraw";

export default function Actions({ userId }) {
  return (
    <div className="flex space-x-5">
      <Account userId={userId} />
      <Withdraw userId={userId} />
    </div>
  );
}
