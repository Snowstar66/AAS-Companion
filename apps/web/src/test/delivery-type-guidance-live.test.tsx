import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DeliveryTypeGuidanceProvider,
  DeliveryTypeGuidanceText,
  DeliveryTypeHelperText,
  DeliveryTypeSelect
} from "@/components/framing/delivery-type-guidance-live";

describe("Delivery type guidance", () => {
  it("updates helper and guidance text immediately when the selection changes", () => {
    render(
      <DeliveryTypeGuidanceProvider initialValue={null}>
        <label htmlFor="delivery-type">Delivery type</label>
        <DeliveryTypeSelect defaultValue="" id="delivery-type" name="deliveryType" />
        <p>
          <DeliveryTypeHelperText />
        </p>
        <p>
          <DeliveryTypeGuidanceText slot="businessCaseDescription" />
        </p>
      </DeliveryTypeGuidanceProvider>
    );

    expect(
      screen.getByText(
        "Choose the delivery posture that best describes this case so Framing can guide the business case, baseline, risks, and hierarchy the right way from the start."
      )
    ).toBeDefined();

    fireEvent.change(screen.getByLabelText("Delivery type"), { target: { value: "AT" } });

    expect(
      screen.getByText(
        "Application Transformation: What in the current system is blocking value? Outcome, baseline, risk posture, and AI level need tighter discipline."
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "What in the current system is blocking value? Structural change in an existing landscape. Structural effect on speed, cost, risk, or resilience."
      )
    ).toBeDefined();
  });
});
