import Link from "next/link";
import Button from "./components/ui/button";

export default function NotFound() {
  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="ui-text-title mb-4">404</h1>
        <div className="mb-4">
          <h2 className="ui-text-subtitle ">Pagina non trovata!</h2>
          <p className="ui-text-normal ">
            La pagina che stai cercando non esiste.
          </p>
        </div>
        <Button color="blue" className="mx-auto">
          <Link href="/" className="ui-text-light">
            Torna alla Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
