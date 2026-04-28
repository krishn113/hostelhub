"use client";
import { useRef } from "react";

export default function OtpInput({ length = 6, value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;

    const newValue = value.split("");
    newValue[index] = val;

    onChange(newValue.join(""));

    if (index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newValue = value.split("");
      newValue[index] = "";
      onChange(newValue.join(""));

      if (index > 0) inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[...Array(length)].map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-10 h-10 text-center border rounded-md text-base font-semibold
          focus:outline-none focus:ring-2 focus:ring-black"
        />
      ))}
    </div>
  );
}