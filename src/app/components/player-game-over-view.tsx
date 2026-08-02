import Link from "next/link";
import { URL_FEEDBACK } from "@/vars";
import Button from "./ui/button";

type PlayerGameOverViewProps = {
  winnerName: string;
};

export default function PlayerGameOverView(props: PlayerGameOverViewProps) {
  return (
    <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="ui-text-title">Fine partita!</h2>
      <p className="ui-text-subtitle">
        Vince: <strong>{props.winnerName}</strong>
      </p>
      <Link href={URL_FEEDBACK}>
        <Button color="blue" className="mx-0">
          Dai un feedback!
        </Button>
      </Link>
    </div>
  );
}
