import type React from "react";
import {
  MODAL_PHYSICAL_TEST,
  MODAL_PHYSICAL_TEST_COMPLETED,
  MODAL_PHYSICAL_TEST_NOT_COMPLETED,
  MODAL_PHYSICAL_TEST_TEST_TO_EXECUTE,
} from "@/app/texts";
import type { PhysicalTest } from "@/model/deck";
import Button from "../ui/button";
import { H3 } from "./h3";

interface PhysicalTestResultProps {
  actionData: PhysicalTest;
  onResolvePhysicalTest?: (success: boolean) => void;
  onClose: () => void;
}

const PhysicalTestResult: React.FC<PhysicalTestResultProps> = ({
  actionData,
  onResolvePhysicalTest,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>{MODAL_PHYSICAL_TEST}</H3>
      <p className="mb-1 text-xl">
        {MODAL_PHYSICAL_TEST_TEST_TO_EXECUTE}{" "}
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
          {MODAL_PHYSICAL_TEST_COMPLETED}
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
          {MODAL_PHYSICAL_TEST_NOT_COMPLETED}
        </Button>
      </div>
    </div>
  );
};

export default PhysicalTestResult;
