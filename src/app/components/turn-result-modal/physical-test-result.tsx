import type React from "react";
import type { PhysicalTest } from "@/model/deck";
import Button from "../ui/button";

interface PhysicalTestResultProps {
  actionData: PhysicalTest;
  onResolvePhysicalTest?: (success: boolean) => void;
  onClose: () => void;
}

const H3 = (props: { children: string }) => (
  <h3 className="ui-text-dark ui-text-subtitle">{props.children}</h3>
);

const PhysicalTestResult: React.FC<PhysicalTestResultProps> = ({
  actionData,
  onResolvePhysicalTest,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>Test Fisico</H3>
      <p className="mb-1 text-xl">
        Test da eseguire:{" "}
        <span className="font-bold">{actionData.cardTest.cardTitle}</span>
      </p>
      <div className="mt-2 flex justify-center space-x-4">
        <Button
          onClick={() => {
            if (onResolvePhysicalTest) {
              onResolvePhysicalTest(true);
            }
            onClose();
          }}
          color="green"
        >
          Test Completato
        </Button>
        <Button
          onClick={() => {
            if (onResolvePhysicalTest) {
              onResolvePhysicalTest(false);
            }
            onClose();
          }}
          color="red"
        >
          Test Non Completato
        </Button>
      </div>
    </div>
  );
};

export default PhysicalTestResult;
